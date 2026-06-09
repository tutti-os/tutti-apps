#!/bin/sh
set -eu

script_dir=$(CDPATH= cd "$(dirname "$0")" && pwd)
app_package_dir="${NEXTOP_APP_PACKAGE_DIR:-$script_dir}"
app_runtime_dir="${NEXTOP_APP_RUNTIME_DIR:-$PWD}"
app_data_dir="${NEXTOP_APP_DATA_DIR:-$app_runtime_dir/data}"
app_host="${NEXTOP_APP_HOST:-127.0.0.1}"
app_port="${NEXTOP_APP_PORT:-3002}"
app_node="${NEXTOP_APP_NODE:-node}"

mkdir -p "$app_data_dir"

export HOST="$app_host"
export PORT="$app_port"
export NEXTOP_APP_PACKAGE_DIR="$app_package_dir"
export NEXTOP_APP_DATA_DIR="$app_data_dir"

exec "$app_node" "$app_package_dir/server.mjs"
