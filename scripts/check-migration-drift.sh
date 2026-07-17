#!/usr/bin/env bash
# check-migration-drift.sh — exits non-zero if local migration files
# aren't reflected in prod's migration log. Requires SUPABASE_ACCESS_TOKEN
# and the project to be linked (see docs/runbooks/applying-migrations.md).

set -euo pipefail

echo "==> Checking migration parity against linked project"
OUTPUT=$(npx supabase migration list --linked)
echo "$OUTPUT"

if echo "$OUTPUT" | grep -qE '\|\s*$|^\s*[0-9]+\s*\|\s*\|'; then
  echo "FAIL: local migrations missing from remote (drift detected)"
  exit 1
fi

echo "==> No drift detected"
