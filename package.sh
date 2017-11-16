#!/bin/sh
rm link-gopher-*.xpi
zip -r  link-gopher-2.0.xpi . -x /.git/* -x README.md -x package.sh
