"""
Caching of hits data
"""

from os.path import isfile, join
import os
import json
from . import datadog_queries

CACHE_DIR = "cache/"

# Remove cached files, but keep at least preserve_count files
def cleanup_cache(query_type, preserve_count):
    filtered_files = get_all_cached_files_sorted(query_type)
    remove_count = len(filtered_files) - preserve_count
    if (remove_count > 0):
        print("Removing " + str(remove_count) + " files...")
        files_to_remove = filtered_files[:remove_count]
        for file in files_to_remove:
            os.remove(join(CACHE_DIR, file))

def get_all_cached_files_sorted(query_type):
    files = [f for f in os.listdir(CACHE_DIR) if isfile(join(CACHE_DIR, f))]
    filtered_files = list(filter(lambda file: query_type in file, files))
    return sorted(filtered_files)

# Return list of all the cached hits (unused)
def get_all_cached_hits(query_type):
    return get_latest_cached_hits(query_type, 9999)

# Get latest cached hits
def get_latest_cached_hits(query_type, count):
    filtered_files = get_all_cached_files_sorted(query_type)
    count = min(count, len(filtered_files))
    last_files = filtered_files[-count:]
    print("Returning cached hits from " + str(count) + " files")
    hits_list_all = []
    for file in last_files:
        hits_list = get_cached_hits_from_file(join(CACHE_DIR, file))
        for hits in hits_list:
            hits_list_all.append(hits)
    return hits_list_all

# Get cached hits for the current time
def get_cached_hits(query_type):
    filename = cache_filename(query_type)
    if not (os.path.exists(filename)):
        return None
    return get_cached_hits_from_file(filename)

# Get hits from a specific file
def get_cached_hits_from_file(filename):
    with open(filename, 'r') as openfile:
        return json.load(openfile)

# Store hits in a file
def cache_hits(query_type, hits_list):
    ensure_cache_dir_exists()
    json_object = json.dumps(hits_list, indent=4)
    with open(cache_filename(query_type), "w") as outfile:
        outfile.write(json_object)

def ensure_cache_dir_exists():
    if not (os.path.exists(CACHE_DIR)):
        os.makedirs(CACHE_DIR)

def cache_filename(query_type):
    return CACHE_DIR + query_type + "-" + str(int(queries.query_from_time().timestamp())) + ".json"
