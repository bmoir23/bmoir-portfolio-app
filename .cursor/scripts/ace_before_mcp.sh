#!/bin/bash
# ACE Before MCP Hook - Gates MCP tool execution
# Input: tool_name, tool_input

input=$(cat)
ace_dir=".cursor/ace"
mkdir -p "$ace_dir"

tool_name=$(echo "$input" | jq -r '.tool_name // "unknown"')
tool_input=$(echo "$input" | jq -r '.tool_input // "{}"' | head -c 500)

echo "{\"event\": \"before_mcp\", \"tool_name\": \"$tool_name\", \"tool_input\": \"$tool_input\", \"timestamp\": \"$(date -Iseconds)\"}" >> "$ace_dir/mcp_trajectory.jsonl"

echo '{"permission":"allow"}'
