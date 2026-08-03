#!/bin/bash
# ACE Pre-Tool Use Hook (v0.5.0-dev.4) — XML-wrapped pattern injection + ROI +
# silent updated_input rewrite for ace_get_playbook / ace_learn (belt+suspenders
# behind the MCP proxy).

input=$(cat)
ace_dir=".cursor/ace"
mkdir -p "$ace_dir"

tool_name=$(echo "$input" | jq -r '.tool_name // "unknown"')
conv_id=$(echo "$input" | jq -r '.conversation_id // ""')
gen_id=$(echo "$input" | jq -r '.generation_id // ""')
transcript=$(echo "$input" | jq -r '.transcript_path // ""')

# v0.5.0-dev.20 Task A — per-conv trajectory rotation. Same fallback logic
# as ace_track_mcp.sh (dev.19): write to .cursor/ace/tasks/<conv>/
# mcp_trajectory.jsonl when conv_id present; top-level when missing.
# v0.5.0-dev.24 — folder renamed sessions/ → tasks/.
pre_event_line="{\"event\": \"pre_tool_use\", \"tool_name\": \"$tool_name\", \"conv_id\": \"$conv_id\", \"gen_id\": \"$gen_id\", \"timestamp\": \"$(date -Iseconds)\"}"
if [ -n "$conv_id" ] && [ "$conv_id" != "null" ]; then
  per_conv_dir="$ace_dir/tasks/$conv_id"
  mkdir -p "$per_conv_dir"
  echo "$pre_event_line" >> "$per_conv_dir/mcp_trajectory.jsonl"
else
  echo "$pre_event_line" >> "$ace_dir/mcp_trajectory.jsonl"
fi

# v0.5.0-dev.4 TASK 2: silent rewrite for ace_get_playbook + ace_learn.
# Cursor preToolUse output supports `updated_input` (per docs) which REWRITES
# the tool call before forwarding to MCP. AI sees no error and no redirect
# nudge — call simply ran with different args.
case "$tool_name" in
  MCP:ace_search)
    # v0.5.0-dev.10 — Cursor known bug 150043: `arguments` field is dropped
    # from tools/call when the agent invokes ace_search. The MCP server then
    # returns missing_required_arguments and the AI gives up. Detect empty/
    # missing query and rewrite via `updated_input` (same trick as the
    # ace_get_playbook branch below).
    query_arg=$(echo "$input" | jq -r '.tool_input.query // ""' 2>/dev/null)
    if [ -z "$query_arg" ] || [ "$query_arg" = "null" ]; then
      prompt=""
      if [ -n "$transcript" ] && [ -f "$transcript" ]; then
        prompt=$(grep '"role":"user"' "$transcript" 2>/dev/null | tail -1 | jq -r '
          if .message.content and (.message.content | type == "array") then
            [.message.content[] | select(.type=="text") | .text] | join(" ")
          elif .content then .content
          else empty end
        ' 2>/dev/null | head -c 500)
      fi
      [ -z "$prompt" ] && prompt="continue current task"
      prompt_json=$(printf '%s' "$prompt" | jq -Rs .)
      cat <<REWRITE_SEARCH_EOF
{"permission":"allow","updated_input":{"name":"ace_search","arguments":{"query":$prompt_json}},"tool_input":{"name":"ace_search","arguments":{"query":$prompt_json}}}
REWRITE_SEARCH_EOF
      echo "{\"event\": \"rewrote_empty_ace_search\", \"timestamp\": \"$(date -Iseconds)\"}" >> "$ace_dir/ace-relevance.jsonl"
      exit 0
    fi
    # Args look fine — allow as-is.
    echo '{"permission":"allow"}'
    exit 0
    ;;
  MCP:ace_get_playbook|ace_get_playbook)
    # Rewrite to ace_search using user's prompt as query. Read last user
    # message from transcript; fallback to "continue current task".
    prompt=""
    if [ -n "$transcript" ] && [ -f "$transcript" ]; then
      prompt=$(grep '"role":"user"' "$transcript" 2>/dev/null | tail -1 | jq -r '
        if .message.content and (.message.content | type == "array") then
          [.message.content[] | select(.type=="text") | .text] | join(" ")
        elif .content then .content
        else empty end
      ' 2>/dev/null | head -c 500)
    fi
    [ -z "$prompt" ] && prompt="continue current task"
    prompt_json=$(printf '%s' "$prompt" | jq -Rs .)
    # Caveman: per Cursor hooks docs, output uses `updated_input` to swap the
    # entire tool invocation. Some hook surfaces use `tool_input` — emit both
    # for forward-compat. Cursor will use whichever it recognizes.
    cat <<REWRITE_PLAYBOOK_EOF
{"permission":"allow","updated_input":{"name":"ace_search","arguments":{"query":$prompt_json}},"tool_input":{"name":"ace_search","arguments":{"query":$prompt_json}}}
REWRITE_PLAYBOOK_EOF
    echo "{\"event\": \"rewrote_get_playbook_to_search\", \"timestamp\": \"$(date -Iseconds)\"}" >> "$ace_dir/ace-relevance.jsonl"
    exit 0
    ;;
  MCP:ace_learn|ace_learn)
    # v0.5.0-dev.10+ HOTFIX: Stop hook is the PRIMARY path (server-side
    # storeExecutionTrace via learn helper), but it can fail silently when
    # Cursor strips PATH and `command -v node` misses the install. ALLOW
    # the AI's manual ace_learn as a fallback so server-side learn happens
    # even when the Stop hook can't run the helper. The MCP proxy also no
    # longer hides ace_learn for the same reason.
    echo '{"permission":"allow"}'
    echo "{\"event\": \"allowed_ace_learn_fallback\", \"timestamp\": \"$(date -Iseconds)\"}" >> "$ace_dir/ace-relevance.jsonl"
    exit 0
    ;;
  MCP:ace_*)
    echo '{"permission":"allow"}'
    exit 0
    ;;
esac

# Fail-open if missing IDs
[ -z "$conv_id" ] || [ -z "$gen_id" ] && echo '{"permission":"allow"}' && exit 0

# Per-generation flag
# v0.5.0-dev.24 — folder renamed sessions/ → tasks/.
flag_file="$ace_dir/tasks/$conv_id/$gen_id.patterns-injected"
mkdir -p "$ace_dir/tasks/$conv_id"
if [ -f "$flag_file" ]; then
  echo '{"permission":"allow"}'; exit 0
fi

# v0.5.0 TASK 6 — runtime-settings.json privacy gate (replaces share-raw-prompts.optin).
# Falls back to allow-injection only if explicitly enabled in JSON.
opt_in=0
settings_file="$ace_dir/runtime-settings.json"
if [ -f "$settings_file" ]; then
  raw=$(jq -r '.shareRawPromptsForRetrievalAnalysis // false' "$settings_file" 2>/dev/null || echo "false")
  if [ "$raw" = "true" ]; then opt_in=1; fi
fi
if [ "$opt_in" = "0" ]; then
  # Caveman: opt-in OFF → no injection, no flag, no helper call.
  echo '{"permission":"allow"}'; exit 0
fi

# Mark flag IMMEDIATELY (atomic) — if helper takes long or fails, we don't
# loop forever. AI gets fallback "no patterns" but workflow proceeds.
touch "$flag_file"

# v0.5.0 TASK 4 — ROI feedback. Read prior task's review result if present, render
# <ace-roi/> tag, then rename file to -consumed so we don't re-inject.
roi_xml=""
review_file="$ace_dir/ace-review-result.json"
if [ -f "$review_file" ]; then
  time_saved_min=$(jq -r '.time_saved_min // 0' "$review_file" 2>/dev/null || echo "0")
  reason=$(jq -r '.reason // ""' "$review_file" 2>/dev/null || echo "")
  if [ -n "$time_saved_min" ] && [ "$time_saved_min" != "0" ] && [ "$time_saved_min" != "null" ]; then
    # Caveman: jq @xml escapes attribute values safely.
    reason_xml=$(printf '%s' "$reason" | jq -Rr @xml 2>/dev/null || echo "$reason")
    roi_xml="<ace-roi prev-task-saved-min=\"$time_saved_min\" reason=\"$reason_xml\"/>"
  fi
  # Always rename (consumed marker) so we don't re-inject even when 0 minutes
  mv -f "$review_file" "$ace_dir/ace-review-result-consumed.json" 2>/dev/null || true
fi

# Read user prompt from transcript (last user message).
prompt=""
if [ -n "$transcript" ] && [ -f "$transcript" ]; then
  prompt=$(grep '"role":"user"' "$transcript" 2>/dev/null | tail -1 | jq -r '
    if .message.content and (.message.content | type == "array") then
      [.message.content[] | select(.type=="text") | .text] | join(" ")
    elif .content then .content
    else empty end
  ' 2>/dev/null | head -c 500)
fi

# Fail-open if no prompt (rare — first turn before user input parsed)
[ -z "$prompt" ] && echo '{"permission":"allow"}' && exit 0

# Spawn helper script
helper="$ace_dir/../scripts/ace_search_helper.js"
[ ! -f "$helper" ] && echo '{"permission":"allow"}' && exit 0

# Run helper, capture FULL SearchResponse JSON (not just patterns array).
patterns=""
if command -v node >/dev/null 2>&1; then
  if command -v gtimeout >/dev/null 2>&1; then
    patterns=$(gtimeout 8 node "$helper" "$prompt" 2>/dev/null)
  elif command -v timeout >/dev/null 2>&1; then
    patterns=$(timeout 8 node "$helper" "$prompt" 2>/dev/null)
  else
    patterns=$(perl -e 'alarm 8; exec @ARGV' -- node "$helper" "$prompt" 2>/dev/null)
  fi
fi

# Empty/null/no-results → fail-open
if [ -z "$patterns" ] || [ "$patterns" = "{}" ] || [ "$patterns" = "null" ]; then
  echo '{"permission":"allow"}'; exit 0
fi

# Sanity check: must have at least 1 similar_pattern.
n=$(echo "$patterns" | jq -r '(.similar_patterns // []) | length' 2>/dev/null || echo "0")
if [ "$n" = "0" ] || [ -z "$n" ]; then
  echo '{"permission":"allow"}'; exit 0
fi

# v0.5.0 TASK 2 — wrap as <ace-patterns agent-type="main">{full JSON}</ace-patterns>.
patterns_wrapped=$(printf '<ace-patterns agent-type="main">%s</ace-patterns>' "$patterns")

# Compose final agent_message: optional <ace-roi/> first, then patterns wrapper.
if [ -n "$roi_xml" ]; then
  agent_msg="$roi_xml
$patterns_wrapped"
else
  agent_msg="$patterns_wrapped"
fi

agent_msg_json=$(printf '%s' "$agent_msg" | jq -Rs .)

# Inject via deny + agent_message; AI sees patterns, retries tool, flag exists, allowed
cat <<EOF
{"permission":"deny","user_message":"📚 ACE patterns retrieved","agent_message":$agent_msg_json}
EOF
