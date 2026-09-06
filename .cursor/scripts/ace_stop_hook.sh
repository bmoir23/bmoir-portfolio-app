#!/bin/bash
# ACE Stop Hook (v0.5.0-dev.10+) — delegate ace_learn to node helper.
# Replaces v0.4.x stop hook that nudged AI to call ace_learn manually.
# Helper writes ace-review-result.json with time_saved_min for next-prompt ROI.
#
# v0.5.0-dev.10+ HOTFIX (Bugs A + C):
#  - Cursor invokes hooks with a stripped PATH (often /usr/bin:/bin only),
#    so bare `command -v node` misses Homebrew/nvm installs. We now extend
#    PATH to include the common node install dirs BEFORE any node lookup.
#  - Every gate exit writes a labelled breadcrumb to ace-stop-debug.log so
#    silent failures become diagnosable. Helper stderr is captured to the
#    same log instead of being swallowed by /dev/null.

# Caveman: HELPER baked at write time from extensionContext.extensionPath.
HELPER="/Users/bmoir/.cursor/extensions/ce-dot-net.cursor-ace-extension-0.5.2-universal/scripts/ace_learn_helper.js"

input=$(cat)
ace_dir=".cursor/ace"
mkdir -p "$ace_dir"
debug_log="$ace_dir/ace-stop-debug.log"

# Bug A fix — extend PATH with common node install dirs BEFORE any node probe.
# Cursor often hands hooks PATH=/usr/bin:/bin. Homebrew, /usr/local, and nvm
# installs aren't on that minimal PATH, so node disappears. Prepend the usual
# suspects so `command -v node` and `node` calls succeed.
export PATH="/opt/homebrew/bin:/usr/local/bin:/opt/local/bin:$HOME/.nvm/current/bin:$HOME/.nvm/versions/node/current/bin:$HOME/.local/bin:$HOME/bin:$PATH"

# v0.5.0-dev.10: extract status/conv_id/loop_count BEFORE any gate so we can
# write a breadcrumb proving the hook fired regardless of which gate exits.
if command -v jq >/dev/null 2>&1; then
  status=$(echo "$input" | jq -r '.status // empty')
  loop_count=$(echo "$input" | jq -r '.loop_count // 0')
  transcript=$(echo "$input" | jq -r '.transcript_path // empty')
  conv_id=$(echo "$input" | jq -r '.conversation_id // empty')
else
  status=$(echo "$input" | grep -oE '"status"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"//' | sed 's/"$//')
  loop_count=$(echo "$input" | grep -oE '"loop_count"[[:space:]]*:[[:space:]]*[0-9]*' | head -1 | grep -oE '[0-9]+$' || echo "0")
  transcript=$(echo "$input" | grep -oE '"transcript_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"//' | sed 's/"$//')
  conv_id=$(echo "$input" | grep -oE '"conversation_id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"//' | sed 's/"$//')
fi

# Unconditional breadcrumb — proves the hook fired and shows what Cursor sent us.
printf '%s STOP_FIRED status=%s conv=%s loop=%s\n' "$(date -Iseconds)" "$status" "$conv_id" "$loop_count" >> "$debug_log" 2>/dev/null

# Bug C fix — every gate exit now writes a LABELLED reason to debug_log
# instead of silently `exit 0`. Easier to diagnose what's blocking learn.
log_skip() {
  printf '%s STOP_SKIP reason=%s status=%s conv=%s loop=%s\n' "$(date -Iseconds)" "$1" "$status" "$conv_id" "$loop_count" >> "$debug_log" 2>/dev/null
}

# Only fire on completed top-of-stack stops
if [ "$status" != "completed" ]; then log_skip status_not_completed; echo '{}'; exit 0; fi
if [ "$loop_count" != "0" ] && [ -n "$loop_count" ]; then log_skip loop_count_nonzero; echo '{}'; exit 0; fi
if [ -z "$conv_id" ]; then log_skip no_conv_id; echo '{}'; exit 0; fi

# Skip if no real work — count ANY trajectory activity for THIS conversation.
# v0.5.0-dev.5: also count mcp_trajectory + shell_trajectory because AI may
# write files via MCP tools (filesystem/serena) which don't fire afterFileEdit.
# v0.5.0-dev.19 Task A: also count per-conversation trajectory file lines (no
# grep filter needed — per-conv file by definition only holds this conv's data).
work_count=0
per_conv_dir="$ace_dir/tasks/$conv_id"
if [ -f "$per_conv_dir/mcp_trajectory.jsonl" ]; then
  pn=$(wc -l < "$per_conv_dir/mcp_trajectory.jsonl" 2>/dev/null | tr -cd '0-9')
  [ -z "$pn" ] && pn=0
  work_count=$((work_count + pn))
fi
for traj in edit_trajectory.jsonl mcp_trajectory.jsonl shell_trajectory.jsonl; do
  if [ -f "$ace_dir/$traj" ]; then
    # grep -c always prints a number; exit 1 means 0 matches, NOT error.
    # Do NOT add: || echo 0 — it concatenates with grep's own "0" output.
    n=$(grep -c "\"conversation_id\":\"$conv_id\"" "$ace_dir/$traj" 2>/dev/null)
    [ -z "$n" ] && n=0
    n=$(echo "$n" | head -1 | tr -cd '0-9')
    [ -z "$n" ] && n=0
    work_count=$((work_count + n))
  fi
done
if [ "$work_count" -lt 1 ]; then log_skip no_work_count_zero; echo '{}'; exit 0; fi

if [ ! -f "$HELPER" ]; then
  printf '%s STOP_SKIP reason=helper_missing path=%s\n' "$(date -Iseconds)" "$HELPER" >> "$debug_log" 2>/dev/null
  echo '{}'; exit 0
fi

# Bug A fix — explicit node binary resolver. PATH extension above usually
# does the trick, but on truly minimal environments we still probe known
# candidate paths so we can log a clear node_missing diagnostic if all
# candidates fail.
NODE_BIN=""
if command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
else
  for candidate in \
    "/opt/homebrew/bin/node" \
    "/usr/local/bin/node" \
    "/opt/local/bin/node" \
    "$HOME/.nvm/current/bin/node" \
    "$HOME/.nvm/versions/node/current/bin/node" \
    "$HOME/.local/bin/node" \
    "$HOME/bin/node"; do
    if [ -x "$candidate" ]; then NODE_BIN="$candidate"; break; fi
  done
fi
if [ -z "$NODE_BIN" ]; then
  printf '%s STOP_SKIP reason=node_missing path=%s\n' "$(date -Iseconds)" "$PATH" >> "$debug_log" 2>/dev/null
  echo '{}'; exit 0
fi

# v0.5.0-dev.19 Task A — prefer per-conv trajectory if it exists, else fall
# back to legacy top-level path. Per-conv path keeps cross-tab data isolated.
# v0.5.0-dev.24 — folder renamed sessions/ → tasks/.
per_conv_jsonl="$ace_dir/tasks/$conv_id/mcp_trajectory.jsonl"
if [ -f "$per_conv_jsonl" ]; then
  jsonl="$per_conv_jsonl"
else
  jsonl="$ace_dir/mcp_trajectory.jsonl"
fi

printf '%s helper_start node=%s helper=%s jsonl=%s\n' "$(date -Iseconds)" "$NODE_BIN" "$HELPER" "$jsonl" >> "$debug_log" 2>/dev/null

# Run helper (synchronous, 30s budget — server side may stream a learning
# response). Bug C fix: capture helper stderr to debug log instead of
# silencing with >/dev/null 2>&1. stdout still piped to /dev/null since the
# helper writes ace-review-result.json on its own.
if command -v gtimeout >/dev/null 2>&1; then
  gtimeout 30 "$NODE_BIN" "$HELPER" "$conv_id" "$jsonl" "$transcript" >/dev/null 2>>"$debug_log"
  rc=$?
elif command -v timeout >/dev/null 2>&1; then
  timeout 30 "$NODE_BIN" "$HELPER" "$conv_id" "$jsonl" "$transcript" >/dev/null 2>>"$debug_log"
  rc=$?
else
  perl -e 'alarm 30; exec @ARGV' -- "$NODE_BIN" "$HELPER" "$conv_id" "$jsonl" "$transcript" >/dev/null 2>>"$debug_log"
  rc=$?
fi

printf '%s helper_done rc=%s\n' "$(date -Iseconds)" "$rc" >> "$debug_log" 2>/dev/null

echo '{}'
