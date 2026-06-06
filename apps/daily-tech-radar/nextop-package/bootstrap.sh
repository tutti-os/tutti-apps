#!/bin/sh
set -eu

: "${NEXTOP_APP_PACKAGE_DIR:?}"
: "${NEXTOP_APP_HOST:?}"
: "${NEXTOP_APP_PORT:?}"
: "${NEXTOP_APP_DATA_DIR:?}"

export HOST="$NEXTOP_APP_HOST"
export PORT="$NEXTOP_APP_PORT"
export NEXTOP_APP_DATA_DIR

exec node "$NEXTOP_APP_PACKAGE_DIR/server.mjs"
