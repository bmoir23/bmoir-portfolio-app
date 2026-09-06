#!/bin/bash
# ACE Session Start Hook - Injects pattern context into new conversations
# Input: session_id, is_background_agent, composer_mode
# Output: additional_context, env

input=$(cat)
session_id=$(echo "$input" | jq -r '.session_id // empty')
is_bg=$(echo "$input" | jq -r '.is_background_agent // false')
ace_dir=".cursor/ace"
mkdir -p "$ace_dir"

# Clear trajectory files from previous session
> "$ace_dir/mcp_trajectory.jsonl" 2>/dev/null
> "$ace_dir/shell_trajectory.jsonl" 2>/dev/null
> "$ace_dir/edit_trajectory.jsonl" 2>/dev/null
> "$ace_dir/response_trajectory.jsonl" 2>/dev/null
> "$ace_dir/ace-relevance.jsonl" 2>/dev/null
rm -f "$ace_dir/ace-review-result.json" 2>/dev/null

# Save session info
echo "{\"session_id\": \"$session_id\", \"started_at\": \"$(date -Iseconds)\", \"is_background\": $is_bg}" > "$ace_dir/current_session.json"

# Read cached pattern info (written by extension preloadPatterns)
pattern_count=0
domains=""
if [ -f "$ace_dir/pattern_cache.json" ]; then
  pattern_count=$(jq -r '.patternCount // 0' "$ace_dir/pattern_cache.json" 2>/dev/null || echo "0")
  domains=$(jq -r '.domains // [] | join(", ")' "$ace_dir/pattern_cache.json" 2>/dev/null || echo "")
fi

# Build additional context for the conversation
context=""
if [ "$pattern_count" -gt 0 ] 2>/dev/null; then
  context="[ACE Pattern Learning] This project has $pattern_count patterns across domains: $domains. Use ace_search MCP tool to retrieve relevant patterns before starting work."
else
  context="[ACE Pattern Learning] ACE is configured. Use ace_search MCP tool to find patterns relevant to your task."
fi

# Return env vars + additional_context
echo "{\"env\": {\"ACE_SESSION_ID\": \"$session_id\"}, \"additional_context\": \"$context\"}"
