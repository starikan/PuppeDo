#!/usr/bin/env bash
set -euo pipefail

if [[ -f /app/.container-runtime.env ]]; then
  set -a
  # shellcheck disable=SC1091
  source /app/.container-runtime.env
  set +a
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "$FIRECRACKER_DIR/scripts/run-firecracker-project-check.sh" \
  "$script_dir/project.check.json" "$@"
