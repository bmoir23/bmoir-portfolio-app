#!/bin/bash
# ACE MCP Tracking Hook - Captures tool executions for AI-Trail
# Also detects ace_learn calls and extracts task helpfulness (TIME_SAVED)
# Input: tool_name, tool_input, result_json, duration
# Requires: jq (checked at extension activation)

input=$(cat)
ace_dir=".cursor/ace"
mkdir -p "$ace_dir"

# v0.5.0-dev.19 Task A — per-conversation trajectory rotation. The legacy
# top-level mcp_trajectory.jsonl grew unbounded across all chat tabs in a
# Cursor session. Writes now go to .cursor/ace/tasks/<conv_id>/
# mcp_trajectory.jsonl when conv_id is present, else fall back to the
# top-level path (older Cursor versions / malformed input).
# v0.5.0-dev.24 — folder renamed sessions/ → tasks/ (one conv_id = one task).
conv_id_for_traj=""
if command -v jq >/dev/null 2>&1; then
  conv_id_for_traj=$(echo "$input" | jq -r '.conversation_id // .conv_id // ""' 2>/dev/null || echo "")
fi
if [ -n "$conv_id_for_traj" ] && [ "$conv_id_for_traj" != "null" ]; then
  per_conv_dir="$ace_dir/tasks/$conv_id_for_traj"
  mkdir -p "$per_conv_dir"
  echo "$input" >> "$per_conv_dir/mcp_trajectory.jsonl"
else
  echo "$input" >> "$ace_dir/mcp_trajectory.jsonl"
fi

# Bail if jq is not available
if ! command -v jq >/dev/null 2>&1; then exit 0; fi

# Detect ace_learn call — extract helpfulness from tool_input.output
tool_name=$(echo "$input" | jq -r '.tool_name // ""' 2>/dev/null || echo "")

# Per-prompt ace_search gate: when ace_search completes, write a flag
# file so the preToolUse gate unblocks subsequent tool calls within the
# same generation_id. afterMCPExecution delivers bare tool_name (no
# "MCP:" prefix), so compare against "ace_search" directly.
if [ "$tool_name" = "ace_search" ]; then
  conv_id=$(echo "$input" | jq -r '.conversation_id // "unknown"')
  gen_id=$(echo "$input" | jq -r '.generation_id // "unknown"')
  # v0.5.0-dev.24 — folder renamed sessions/ → tasks/.
  flag_dir="$ace_dir/tasks/$conv_id"
  mkdir -p "$flag_dir"
  touch "$flag_dir/$gen_id.search-done"
fi

# Cursor known bug 150043: agent sometimes calls MCP tools without arguments.
# Detect empty/no-args ace_search and ace_learn for observability.
if [ "$tool_name" = "ace_search" ] || [ "$tool_name" = "ace_learn" ]; then
  tool_input_str=$(echo "$input" | jq -r '.tool_input // ""')
  is_empty=0
  if [ -z "$tool_input_str" ] || [ "$tool_input_str" = "{}" ] || [ "$tool_input_str" = "null" ]; then
    is_empty=1
  else
    # Check object with all empty/null values: jq returns true if every value is null or empty string
    all_empty=$(echo "$tool_input_str" | jq -r 'try (if type == "object" then ([.[] | (. == null or . == "")] | all) else false end) catch false' 2>/dev/null || echo "false")
    if [ "$all_empty" = "true" ]; then is_empty=1; fi
  fi
  if [ "$is_empty" = "1" ]; then
    echo "{\"event\": \"schema_violation_detected\", \"tool\": \"$tool_name\", \"reason\": \"empty_arguments_likely_cursor_callmcptool_bug_150043\", \"timestamp\": \"$(date -Iseconds)\"}" >> "$ace_dir/ace-relevance.jsonl"
  fi
fi

if echo "$tool_name" | grep -qi "ace_learn"; then
  # tool_input is a JSON string — parse it to get the output field
  tool_input_raw=$(echo "$input" | jq -r '.tool_input // ""' 2>/dev/null || echo "")
  # tool_input may be a string or object; try parsing as JSON
  output_field=$(echo "$tool_input_raw" | jq -r '.output // ""' 2>/dev/null || echo "")
  if [ -z "$output_field" ]; then
    # Fallback: tool_input might be a JSON string that needs double-parse
    output_field=$(echo "$tool_input_raw" | jq -r '. | fromjson? | .output // ""' 2>/dev/null || echo "")
  fi

  # Look for TIME_SAVED: Xm | reason on the first line of output
  if echo "$output_field" | head -1 | grep -q "TIME_SAVED:"; then
    first_line=$(echo "$output_field" | head -1)
    # Extract time (e.g., "15m", "2m", "30s")
    time_saved=$(echo "$first_line" | sed 's/TIME_SAVED:[[:space:]]*//' | sed 's/[[:space:]]*|.*//' | sed 's/[[:space:]]*$//')
    # Extract reason (after the first pipe only)
    reason=""
    if echo "$first_line" | grep -q '|'; then
      reason=$(echo "$first_line" | sed 's/^[^|]*|[[:space:]]*//' | head -c 200)
    fi
    # Sanitize reason — remove quotes that would break JSON
    reason=$(echo "$reason" | sed 's/"/\\"/g')
    # Extract numeric minutes for helpful_pct
    minutes=$(echo "$time_saved" | grep -oE '[0-9]+' | head -1)
    minutes=${minutes:-0}
    # Map time to helpful %: 0m=0%, 1-4m=15%, 5-14m=30%, 15-29m=60%, 30m+=80%
    if [ "$minutes" -ge 30 ] 2>/dev/null; then helpful_pct=80
    elif [ "$minutes" -ge 15 ] 2>/dev/null; then helpful_pct=60
    elif [ "$minutes" -ge 5 ] 2>/dev/null; then helpful_pct=30
    elif [ "$minutes" -gt 0 ] 2>/dev/null; then helpful_pct=15
    else helpful_pct=0; fi

    # Write review result (overwrites previous)
    echo "{\"helpful_pct\": $helpful_pct, \"time_saved\": \"$time_saved\", \"reason\": \"$reason\", \"timestamp\": \"$(date -Iseconds)\"}" > "$ace_dir/ace-review-result.json"
  fi
fi

exit 0
