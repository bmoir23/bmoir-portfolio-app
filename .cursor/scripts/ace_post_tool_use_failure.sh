#!/bin/bash
# ACE Post-Tool Use Failure Hook - Tracks tool failures
# Input: tool_type, tool_name, error_type, error_message

input=$(cat)
ace_dir=".cursor/ace"
mkdir -p "$ace_dir"

tool_type=$(echo "$input" | jq -r '.tool_type // "unknown"')
tool_name=$(echo "$input" | jq -r '.tool_name // "unknown"')
error_type=$(echo "$input" | jq -r '.error_type // "unknown"')
error_message=$(echo "$input" | jq -r '.error_message // ""' | head -c 500)

echo "{\"event\": \"tool_failure\", \"tool_type\": \"$tool_type\", \"tool_name\": \"$tool_name\", \"error_type\": \"$error_type\", \"error_message\": \"$error_message\", \"timestamp\": \"$(date -Iseconds)\"}" >> "$ace_dir/mcp_trajectory.jsonl"

echo '{}'
