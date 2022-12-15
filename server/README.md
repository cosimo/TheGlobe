# The Globe server component

Please note: this is just a prototype component, you will need to modify it
or build your own from scratch.

This is a simple backend application that serves location data in the form
of JSON aggregate hit counts, with longitude, latitude and number of hits.

It's supposed to represent how much traffic your service/website it's getting
in realtime, or close to it.

We use the Logs API from Datadog to aggregate log entries by latitude and
longitude values, but of course this can be customized to accept any other
data source you can think of.

## Installation

To install and run:

    pip3 install -r requirements.txt

    export DATADOG_API_KEY=...
    export DATADOG_APP_KEY=...
    export FLASK_RUN_PORT=5001
    export FLASK_APP=earth.py

    flask run
