#!/bin/sh
rm link-gopher-*.xpi

version=$(sed -n 's|.*"version".*"\(.*\)".*|\1|p' manifest.json)
[ -n "$1" ] && version=$1

7za a -tzip -mx=9  -r \
  '-x!*.git' '-x!package.sh' '-x!README.md' '-x!*.xpi' \
  '-x!node_modules' '-x!package.json' '-x!package-lock.json' \
  '-x!vitest.config.js' '-x!test' \
  link-gopher-$version.xpi .

# Recompress with zopfli for a smaller xpi. advzip -4 is slow but the
# archive is tiny (~30KB), so it finishes in well under a second.
advzip -z -4 link-gopher-$version.xpi
