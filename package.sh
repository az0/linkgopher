#!/bin/sh
rm link-gopher-*.xpi

version=$(sed -n 's|.*"version".*"\(.*\)".*|\1|p' manifest.json)
[ -n "$1" ] && version=$1

7za a -tzip -mx=9  -r '-x!*.git' '-x!package.sh' '-x!README.md' '-x!*.xpi' link-gopher-$version.xpi .
