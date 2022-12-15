"""
Basic Flask application to serve location data and optionally metrics
for the globe visualization.

This is currently tied to Datadog Logs API, because that is what was used
originally for our internal implementation, but you can use any dynamic
data source that provides longitude and latitude for your traffic.
"""

from collections import Counter
import os
import json

from datadog_api_client.v2 import ApiClient, Configuration
from datadog_api_client.v1.api.metrics_api import MetricsApi
from datadog_api_client.v2.api.logs_api import LogsApi
from datadog_api_client.v2.model.logs_list_request import LogsListRequest
from datadog_api_client.v2.model.logs_list_request_page import LogsListRequestPage
from datadog_api_client.v2.model.logs_query_filter import LogsQueryFilter

from flask import Flask, jsonify, request
from flask_cors import CORS

from . import datadog_queries
from . import caching

# Lookup queries.py for the `query_<name>()` method
DEFAULT_QUERY = "type1"

app = Flask(__name__)
CORS(app, resources={
    r"/locdata*": {"origins": "*"},
    r"/metrics":  {"origins": "*"},
})

configuration = Configuration(
    host="https://api.datadoghq.eu",
    api_key={"apiKeyAuth": os.environ["DATADOG_API_KEY"],
             "appKeyAuth": os.environ["DATADOG_APP_KEY"]},
)


@app.get('/locdata')
def get_loc_data():
    query_type = request.args.get("queryType", DEFAULT_QUERY)
    cache_count = int(request.args.get("cacheCount", "1"))
    hits = get_hits(query_type, cache_count)
    return responsify(jsonify({"hits": hits}))


@app.get('/locdatacached')
def get_loc_data_cached():
    query_type = request.args.get("queryType", DEFAULT_QUERY)
    hits_list = caching.get_all_cached_hits(query_type)
    return responsify(jsonify({"hits": hits_list}))


@app.get('/metrics')
def get_metrics():
    #m1 = get_metrics("sum:some.metric{env:production}")
    #m2 = get_metrics("sum:another.metric{env:production}")
    #return responsify(jsonify({"metric1": m1, "metric2": m2}))
    return responsify(jsonify({}))


def responsify(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    response.headers['Cache-Control'] = 'public, max-age=0'
    return response


def get_request(query_type):
    print("Query type: " + query_type)

    # Dynamically load the `queries.query_<name>()` function and call it
    # to obtain the LogsQueryFilter object to use to get the logs api data
    query_func_name = f"query_{query_type}"
    query_func = getattr(queries, query_func_name)
    logs_query_filter : LogsQueryFilter = query_func()

    body = LogsListRequest(
        filter=logs_query_filter,
        page=LogsListRequestPage(limit=1000),
    )
    return body


# Get hit location data, cached or not
def get_hits(query_type, cache_count):
    caching.cleanup_cache(query_type, max(5, cache_count))
    try:
        get_hits_internal(query_type)
    except:
        print("Something went wrong when getting hits")
    return caching.get_latest_cached_hits(query_type, cache_count)


def get_hits_internal(query_type):
    cached_hits = caching.get_cached_hits(query_type)
    if cached_hits is not None:
        print("Get hits success: Returning cached hits")
        return cached_hits
    with ApiClient(configuration) as api_client:
        api_instance = LogsApi(api_client)
        response = api_instance.list_logs(body=get_request(query_type))

        hit_count = Counter()

        for log_record in response.data:
            attr = log_record.attributes

            log_geoip = attr['attributes']['network']['client']['geoip']
            log_location = log_geoip['location'] if 'location' in log_geoip else None

            if not log_location:
                continue

            lat = log_location['latitude']
            lon = log_location['longitude']

            hit_count.update([(lat, lon)])

        # Convert to list
        hits_list = []
        for loc, hits in hit_count.most_common():
            lat, lon = loc
            hits_list.append([lat, lon, hits])

        # Cache the list
        print("Get hits from datadog success: Caching hits")
        caching.cache_hits(query_type, hits_list)
        return hits_list


def get_point_value(point):
    return int(point._data_store['value'][1])


def get_metrics(query):
    with ApiClient(configuration) as api_client:
        metrics_api = MetricsApi(api_client)
        response = metrics_api.query_metrics(
            _from=int(queries.minutes_ago(3).timestamp()),
            to=int(queries.minutes_ago(2).timestamp()),
            query=query,
        )
        metric_series = response['series']
        point_list = metric_series[0]['pointlist']
        return [get_point_value(point_list[0]), get_point_value(point_list[-1])]

