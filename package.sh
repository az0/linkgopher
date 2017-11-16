#!/bin/sh
rm link-gopher-*.xpi
7za a -tzip -mx=9  -r '-x!*.git' '-x!package.sh' '-x!README.md' '-x!*.xpi' link-gopher-2.0.xpi .
