#!/bin/sh

grit 4bpp.png -p! -gB 4 -ftb -fh! -o 4bpp-uncompressed
grit 8bpp.png -p! -gB 8 -ftb -fh! -o 8bpp-uncompressed
grit 4bpp.png -p! -gzl -gB 4 -ftb -fh! -o 4bpp-compressed
