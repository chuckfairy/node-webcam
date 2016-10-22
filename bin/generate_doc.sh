#!/bin/bash

# Requires yuidoc

_dir=$( dirname "$0" );

yuidoc --outdir $_dir/../doc $_dir/../
