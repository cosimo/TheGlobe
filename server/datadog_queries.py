"""
Defines the different types of queries over Datadog logs we can perform

NOTE: This is just an example for how to extract log data out of Datadog.

Uses the Datadog Logs API to aggregate logs by latitude, longitude.
You most likely want a Datadog Log Pipeline that's been configured with
the GeoIP Parser, so you automatically get the `@network.client.geoip`
attribute.

https://docs.datadoghq.com/api/latest/logs/#get-a-list-of-logs
"""

import datetime

from datadog_api_client.v2.model.logs_query_filter import LogsQueryFilter


# Query logs from how many minutes ago from the current timestamp
FROM_MINUTES_AGO = 2

# Query logs to how many minutes ago from the current timestamp,
# such that `FROM_MINUTES_AGO - TO_MINUTES_AGO` is the interval in minutes
# of data we will fetch from Datadog Logs API
TO_MINUTES_AGO = 1


# Define the Datadog queries in terms of LogsQueryFilter instances
def query_type1():
    return LogsQueryFilter(
        query="",                   # your Datadog Logs query goes here
        indexes=["my-log-index"],   # your Datadog Logs index name goes here
        _from=datetime_to_str(query_from_time()),
        to=datetime_to_str(query_to_time()),
    )


def query_type2():
    return LogsQueryFilter(
        query="",                   # your Datadog Logs query goes here
        indexes=["my-log-index"],   # your Datadog Logs index name goes here
        _from=datetime_to_str(minutes_ago(FROM_MINUTES_AGO)),
        to=datetime_to_str(minutes_ago(TO_MINUTES_AGO)),
    )


def minutes_ago(minutes_ago):
    now_time = datetime.datetime.now(datetime.timezone.utc)

    # Truncate seconds to get data for a fixed minute
    now_time = now_time.replace(second = 0, microsecond = 0)
    return now_time - datetime.timedelta(minutes=minutes_ago)

def query_from_time():
    return minutes_ago(FROM_MINUTES_AGO)

def query_to_time():
    return minutes_ago(TO_MINUTES_AGO)

def datetime_to_str(datetime_value):
    return datetime_value.strftime("%Y-%m-%dT%H:%M:%S+00:00")


__all__ = [
    minutes_ago,
]
