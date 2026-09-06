#!/bin/bash
# ACE Post-Tool Use Hook - Tracking + v0.4.1 helper.js pattern injection.
# Spawns node "$HELPER" "<prompt>" with HELPER baked at extension-activation
# time from context.extensionPath (TRUSTED — not workspace-controlled).

# Caveman: helper path baked here as a literal. No workspace input on this line.
HELPER="/Users/bmoir/.cursor/extensions/ce-dot-net.cursor-ace-extension-0.5.2-universal/scripts/ace_search_helper.js"

input=$(cat)
ace_dir=".cursor/ace"
mkdir -p "$ace_dir"

tool_type=$(echo "$input" | jq -r '.tool_type // "unknown"')
tool_name=$(echo "$input" | jq -r '.tool_name // "unknown"')
# v0.4.0: jq char-based slice (UTF-8 safe). Old `head -c 500` chopped multibyte chars.
tool_input=$(echo "$input" | jq -r '.tool_input // "{}" | tostring | .[0:500]')
tool_output=$(echo "$input" | jq -r '.tool_output // "" | tostring | .[0:500]')
duration=$(echo "$input" | jq -r '.duration // 0')
conv_id=$(echo "$input" | jq -r '.conversation_id // ""')
gen_id=$(echo "$input" | jq -r '.generation_id // ""')
transcript=$(echo "$input" | jq -r '.transcript_path // ""')

# v0.5.0-dev.20 Task A — per-conv trajectory rotation. Mirror ace_track_mcp.sh.
post_event_line="{\"event\": \"post_tool_use\", \"tool_type\": \"$tool_type\", \"tool_name\": \"$tool_name\", \"tool_input\": \"$tool_input\", \"tool_output\": \"$tool_output\", \"duration\": $duration, \"timestamp\": \"$(date -Iseconds)\"}"
if [ -n "$conv_id" ] && [ "$conv_id" != "null" ]; then
  per_conv_dir="$ace_dir/tasks/$conv_id"
  mkdir -p "$per_conv_dir"
  echo "$post_event_line" >> "$per_conv_dir/mcp_trajectory.jsonl"
else
  echo "$post_event_line" >> "$ace_dir/mcp_trajectory.jsonl"
fi

# v0.3.1 injection: only on first non-search tool of generation
[ -z "$conv_id" ] || [ -z "$gen_id" ] && echo '{}' && exit 0
flag_file="$ace_dir/tasks/$conv_id/$gen_id.patterns-injected"
mkdir -p "$ace_dir/tasks/$conv_id"
[ -f "$flag_file" ] && echo '{}' && exit 0

# v0.5.0-dev.4 TASK 6 — privacy opt-in via runtime-settings.json. Legacy
# marker file (share-raw-prompts.optin) was removed in v0.5.0-dev.4 cleanup.
opt_in=0
settings_file="$ace_dir/runtime-settings.json"
if [ -f "$settings_file" ]; then
  raw=$(jq -r '.shareRawPromptsForRetrievalAnalysis // false' "$settings_file" 2>/dev/null || echo "false")
  if [ "$raw" = "true" ]; then opt_in=1; fi
fi
if [ "$opt_in" = "0" ]; then
  echo '{}'
  exit 0
fi

# If AI already called ace_search, mark flag and skip (don't double-inject).
# ace_get_playbook is hidden by the MCP proxy (v0.5.0-dev.4) so we no longer
# need to handle it here.
case "$tool_name" in
  MCP:ace_search|ace_search)
    touch "$flag_file"; echo '{}'; exit 0;;
esac

# Read user prompt from transcript. v0.4.0: jq char-based truncation (UTF-8 safe).
prompt=""
if [ -n "$transcript" ] && [ -f "$transcript" ]; then
  prompt=$(grep '"role":"user"' "$transcript" 2>/dev/null | tail -1 | jq -r '
    (if .message.content and (.message.content | type == "array") then
      [.message.content[] | select(.type=="text") | .text] | join(" ")
    elif .content then .content
    else empty end) | .[0:500]
  ' 2>/dev/null)
fi
[ -z "$prompt" ] && echo '{}' && exit 0

# Helper file must exist (extension writes it at activation). Otherwise fail-open.
[ ! -f "$HELPER" ] && echo '{}' && exit 0
command -v node >/dev/null 2>&1 || { echo '{}'; exit 0; }

# v0.4.0 plan §5 — synchronous timeout. macOS lacks GNU timeout; use perl alarm.
# Capture stdout (JSON), stderr separately (debug only — exit code drives logic).
stderr_file=$(mktemp -t ace-helper-stderr.XXXXXX 2>/dev/null || echo "/tmp/ace-helper-stderr.$$")
patterns_json=""
rc=0
if command -v gtimeout >/dev/null 2>&1; then
  patterns_json=$(gtimeout 8 node "$HELPER" "$prompt" 2>"$stderr_file"); rc=$?
elif command -v timeout >/dev/null 2>&1; then
  patterns_json=$(timeout 8 node "$HELPER" "$prompt" 2>"$stderr_file"); rc=$?
else
  patterns_json=$(perl -e 'alarm 8; exec @ARGV' -- node "$HELPER" "$prompt" 2>"$stderr_file"); rc=$?
fi
rm -f "$stderr_file" 2>/dev/null

# v0.4.1 — helper exit code taxonomy (SDK team contract).
#   2 = TokenExpiredError, 3 = AceApiError 5xx, 4 = network/timeout, 5 = unknown.
if [ "$rc" = "2" ]; then
  # Caveman: write marker for the extension's watcher → showWarningMessage.
  echo "auth_expired" > "$ace_dir/auth-status.txt"
  warn_msg=$(echo "ACE: session expired. Run /ace-login. Pattern injection paused until you re-authenticate." | jq -Rs .)
  cat <<EOF
{"additional_context":$warn_msg}
EOF
  # Caveman: do NOT touch flag — let next tool call retry once user re-logs in.
  exit 0
fi

# Network/server/unknown (rc 3/4/5 or any non-0): silently fail-open, no flag.
if [ "$rc" != "0" ] || [ -z "$patterns_json" ] || [ "$patterns_json" = "{}" ]; then
  echo '{}'
  exit 0
fi

# Parse similar_patterns array. Helper emits SearchResponseWithMetadata JSON.
patterns_text=$(echo "$patterns_json" | jq -r '
  (.similar_patterns // []) |
  map("- [" + (.section // "?") + "/" + (.domain // "?") + "] " + ((.content // "?") | .[0:200])) |
  .[]
' 2>/dev/null)
[ -z "$patterns_text" ] && echo '{}' && exit 0

context_msg="📚 ACE patterns retrieved for: $prompt

$patterns_text

(Patterns auto-fetched by ACE extension. Do NOT call ace_search unless you need fresh patterns mid-task.)"
context_json=$(echo "$context_msg" | jq -Rs .)

cat <<EOF
{"additional_context":$context_json}
EOF

# v0.4.0 plan §5.3 — flag-after-success. Old code touched the flag before the
# helper ran, so a transient failure would suppress retries. Only mark when the
# additional_context payload was actually emitted.
touch "$flag_file"
