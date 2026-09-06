#!/bin/bash
# ACE Session End Hook - Logs session analytics
# Input: session_id, reason, duration_ms, is_background_agent, final_status
# Output: none (fire-and-forget)

input=$(cat)
ace_dir=".cursor/ace"
mkdir -p "$ace_dir"

# Count trajectory entries for this session
mcp_count=$(wc -l < "$ace_dir/mcp_trajectory.jsonl" 2>/dev/null | tr -d ' ' || echo "0")
shell_count=$(wc -l < "$ace_dir/shell_trajectory.jsonl" 2>/dev/null | tr -d ' ' || echo "0")
edit_count=$(wc -l < "$ace_dir/edit_trajectory.jsonl" 2>/dev/null | tr -d ' ' || echo "0")
response_count=$(wc -l < "$ace_dir/response_trajectory.jsonl" 2>/dev/null | tr -d ' ' || echo "0")

# Append session info + trajectory counts to session log
session_id=$(echo "$input" | jq -r '.session_id // empty')
reason=$(echo "$input" | jq -r '.reason // "unknown"')
duration_ms=$(echo "$input" | jq -r '.duration_ms // 0')

echo "{\"session_id\": \"$session_id\", \"reason\": \"$reason\", \"duration_ms\": $duration_ms, \"trajectory\": {\"mcp\": $mcp_count, \"shell\": $shell_count, \"edits\": $edit_count, \"responses\": $response_count}, \"ended_at\": \"$(date -Iseconds)\"}" >> "$ace_dir/session_log.jsonl"

exit 0
