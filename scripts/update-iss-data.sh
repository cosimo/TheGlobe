#!/bin/bash
#
# Updates the ISS trajectory data files from NASA's website:
# https://spotthestation.nasa.gov/trajectory_data.cfm
#

set -x
set -o nounset

ISS_EPHEMERIS_URL="https://nasa-public-data.s3.amazonaws.com/iss-coords/current/ISS_OEM/ISS.OEM_J2K_EPH.txt"

download_iss_data() {
    curl -s "${ISS_EPHEMERIS_URL}" \
        -H "User-Agent: cosimo.github.io/TheGlobe" \
        -o ./public/data/ISS.OEM_J2K_EPH.txt

    if [ $? -ne 0 ]; then
        echo "Download of ISS data from ${ISS_EPHEMERIS_URL} failed"
        exit 1
    fi
}

commit_updated_file() {
    echo git config --global user.name "Cosimo Streppone"
    echo git config --global user.email "cosimo@streppone.it"
    echo git commit -am "Periodic update of the ISS trajectory data\n\nfrom https://spotthestation.nasa.gov/trajectory_data.cfm"
    echo git push
}

#
# Start
#

pushd browser

download_iss_data

commit_updated_file

popd
