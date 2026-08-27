#!/usr/bin/env bash
# Pipeline проверок PuppeDo в Firecracker microVM.
# Маркеры PROJECT_CHECK_STEP_* используются исполнителями project-check.

set -euo pipefail

project_check_step() {
  local name="$1"
  local started_at_ns
  local finished_at_ns
  local duration_ms
  shift
  started_at_ns="$(date +%s%N)"
  echo "PROJECT_CHECK_STEP_START=$name"
  set +e
  "$@"
  local rc=$?
  set -e
  finished_at_ns="$(date +%s%N)"
  duration_ms=$(( (finished_at_ns - started_at_ns) / 1000000 ))
  echo "PROJECT_CHECK_STEP_EXIT=$name:$rc"
  echo "PROJECT_CHECK_STEP_DURATION_MS=$name:$duration_ms"
  if [ "$rc" -ne 0 ]; then
    exit "$rc"
  fi
}

export CI=1
export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-$HOME/.cache/ms-playwright}"
export PUPPETEER_EXECUTABLE_PATH="${PUPPETEER_EXECUTABLE_PATH:-$PLAYWRIGHT_BROWSERS_PATH/chromium-1200/chrome-linux64/chrome}"
if [[ ! -x "$PUPPETEER_EXECUTABLE_PATH" ]]; then
  export PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"
fi
if [[ ! -x "$PLAYWRIGHT_BROWSERS_PATH/chromium-1200/chrome-linux64/chrome" ]]; then
  export PLAYWRIGHT_EXECUTABLE_PATH="${PLAYWRIGHT_EXECUTABLE_PATH:-/usr/bin/chromium}"
fi
project_check_runtime_lib_dir="${PROJECT_CHECK_RUNTIME_LIB_DIR:-$HOME/.local/lib/project-check}"
if [[ -d "$project_check_runtime_lib_dir" ]]; then
  export LD_LIBRARY_PATH="$project_check_runtime_lib_dir${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
fi

project_check_step install bash -lc '
  npm ci --ignore-scripts
  playwright_executable="$(node -e "process.stdout.write(require(\"playwright\").chromium.executablePath())")"
  if [[ -x "$playwright_executable" && -x "$PUPPETEER_EXECUTABLE_PATH" ]] && command -v Xvfb >/dev/null 2>&1; then
    exit 0
  fi

  system_chromium="$(command -v chromium 2>/dev/null || true)"
  if [[ -z "$system_chromium" ]] || ! command -v Xvfb >/dev/null 2>&1; then
    apt-get update
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends chromium xvfb
    system_chromium="$(command -v chromium 2>/dev/null || true)"
  fi

  if [[ -z "$system_chromium" || ! -x "$system_chromium" ]]; then
    echo "Chromium executable was not found after installation" >&2
    exit 1
  fi

  export PLAYWRIGHT_EXECUTABLE_PATH="$system_chromium"
  export PUPPETEER_EXECUTABLE_PATH="$system_chromium"
'

if [[ -z "${DISPLAY:-}" ]] && command -v Xvfb >/dev/null 2>&1; then
  Xvfb :99 -screen 0 1280x1024x24 -ac >/dev/null 2>&1 &
  xvfb_pid=$!
  export DISPLAY=:99
  trap 'kill "$xvfb_pid" 2>/dev/null || true' EXIT
fi

project_check_step lint npm run lint -- --vcs-use-ignore-file=false
project_check_step build npm run build
project_check_step test npm run test
project_check_step docs npm run docs
project_check_step e2e npm run e2e
