#!/bin/bash
# ACE Pre-Compact Hook - Preserves trajectory before context compaction
# Input: trigger, context_usage_percent, context_tokens, message_count, messages_to_compact

input=$(cat)
ace_dir=".cursor/ace"
mkdir -p "$ace_dir"

trigger=$(echo "$input" | jq -r '.trigger // "auto"')
usage_pct=$(echo "$input" | jq -r '.context_usage_percent // 0')
tokens=$(echo "$input" | jq -r '.context_tokens // 0')
msg_count=$(echo "$input" | jq -r '.message_count // 0')
to_compact=$(echo "$input" | jq -r '.messages_to_compact // 0')

# Count current trajectory entries
mcp_count=$(wc -l < "$ace_dir/mcp_trajectory.jsonl" 2>/dev/null | tr -d ' ' || echo "0")
shell_count=$(wc -l < "$ace_dir/shell_trajectory.jsonl" 2>/dev/null | tr -d ' ' || echo "0")
edit_count=$(wc -l < "$ace_dir/edit_trajectory.jsonl" 2>/dev/null | tr -d ' ' || echo "0")
response_count=$(wc -l < "$ace_dir/response_trajectory.jsonl" 2>/dev/null | tr -d ' ' || echo "0")

# Save compaction snapshot
echo "{\"trigger\": \"$trigger\", \"context_usage_percent\": $usage_pct, \"context_tokens\": $tokens, \"message_count\": $msg_count, \"messages_to_compact\": $to_compact, \"trajectory\": {\"mcp\": $mcp_count, \"shell\": $shell_count, \"edits\": $edit_count, \"responses\": $response_count}, \"timestamp\": \"$(date -Iseconds)\"}" >> "$ace_dir/compaction_log.jsonl"

# Notify user about compaction with trajectory counts
msg="Context compacting (${usage_pct}% used). AI-Trail preserved: MCP:$mcp_count Shell:$shell_count Edits:$edit_count Responses:$response_count"
echo "{\"user_message\": \"$msg\"}"
