#!/usr/bin/env bash
# Fix Android emulator network for environments where Google's captive-portal
# probe (connectivitycheck.gstatic.com/generate_204) is unreachable.
#
# After 3 failed probes, Android marks AndroidWifi as PERMANENTLY_DISABLED
# (NO_INTERNET_PERMANENT) and the emulator ends up with no default network —
# apps can no longer reach 10.0.2.2:8081, so Metro/dev server is unreachable.
#
# This script:
#   1. Disables captive-portal detection (persisted in /data, survives reboot).
#   2. If there's no active default network, clears poisoned wifi configs
#      and reconnects AndroidWifi.
#
# Idempotent — safe to run multiple times. Run it once per fresh AVD.
set -euo pipefail

ADB="${ADB:-}"
if [ -z "$ADB" ]; then
  if command -v adb >/dev/null 2>&1; then
    ADB="adb"
  elif [ -x "$HOME/Library/Android/sdk/platform-tools/adb" ]; then
    ADB="$HOME/Library/Android/sdk/platform-tools/adb"
  else
    echo "error: adb not found. Install Android Platform Tools or set ADB=/path/to/adb" >&2
    exit 1
  fi
fi

if ! "$ADB" get-state >/dev/null 2>&1; then
  echo "error: no Android device/emulator connected" >&2
  echo "       start one first (e.g. \`yarn android:emulator\`)" >&2
  exit 1
fi

boot="$("$ADB" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)"
if [ "$boot" != "1" ]; then
  echo "waiting for emulator boot..."
  for _ in $(seq 1 60); do
    sleep 2
    boot="$("$ADB" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)"
    [ "$boot" = "1" ] && break
  done
  if [ "$boot" != "1" ]; then
    echo "error: emulator did not finish booting in 120s" >&2
    exit 1
  fi
fi

current="$("$ADB" shell settings get global captive_portal_detection_enabled 2>/dev/null | tr -d '\r')"
if [ "$current" != "0" ]; then
  "$ADB" shell settings put global captive_portal_detection_enabled 0 >/dev/null
  "$ADB" shell settings put global captive_portal_mode 0 >/dev/null
  echo "[fix] disabled captive portal detection"
else
  echo "[ok]  captive portal detection already disabled"
fi

read_default_net() {
  "$ADB" shell dumpsys connectivity 2>/dev/null \
    | awk -F: '/Active default network/ {gsub(/^ +| +$/, "", $2); print $2; exit}'
}

default_net="$(read_default_net)"
if [ "$default_net" = "none" ] || [ -z "$default_net" ]; then
  echo "[fix] no active default network — repairing AndroidWifi"

  if "$ADB" shell dumpsys wifi 2>/dev/null | grep -q "NETWORK_SELECTION_DISABLED_NO_INTERNET_PERMANENT"; then
    echo "      - clearing poisoned wifi config"
    ids="$("$ADB" shell cmd wifi list-networks 2>/dev/null | awk 'NR>1 && $1 ~ /^[0-9]+$/ {print $1}' | sort -u)"
    for id in $ids; do
      "$ADB" shell cmd wifi forget-network "$id" >/dev/null 2>&1 || true
    done
  fi

  "$ADB" shell cmd wifi connect-network AndroidWifi open >/dev/null 2>&1 || true

  for _ in $(seq 1 15); do
    sleep 1
    default_net="$(read_default_net)"
    if [ -n "$default_net" ] && [ "$default_net" != "none" ]; then
      break
    fi
  done

  if [ -z "$default_net" ] || [ "$default_net" = "none" ]; then
    echo "error: default network still inactive — try cold-booting the emulator" >&2
    exit 1
  fi
  echo "[ok]  default network active: $default_net"
else
  echo "[ok]  default network active: $default_net"
fi

echo "done."
