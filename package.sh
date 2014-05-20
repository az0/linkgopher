#!/bin/sh
rm link-gopher-1.3.3.xpi
zip -r  link-gopher-1.3.3.xpi . -x /.git/* -x README.md -x package.sh
