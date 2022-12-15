#!/bin/bash
#
# Builds the browser javascript application assets
#

set -e -x
set -o nounset

pushd browser

rm -rf dist

npm install
npm run build
