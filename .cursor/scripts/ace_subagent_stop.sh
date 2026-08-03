#!/bin/bash
# ACE Subagent Stop Hook - Tracks subagent completion for AI-Trail
# Input: subagent_type, status, result, duration, agent_transcript_path

input=$(cat)
ace_dir=".cursor/ace"
mkdir -p "$ace_dir"

subagent_type=$(echo "$input" | jq -r '.subagent_type // "unknown"')
status=$(echo "$input" | jq -r '.status // "unknown"')
duration=$(echo "$input" | jq -r '.duration // 0')
transcript=$(echo "$input" | jq -r '.agent_transcript_path // empty')

echo "{\"event\": \"subagent_stop\", \"type\": \"$subagent_type\", \"status\": \"$status\", \"duration_ms\": $duration, \"has_transcript\": $([ -n \"$transcript\" ] && echo true || echo false), \"timestamp\": \"$(date -Iseconds)\"}" >> "$ace_dir/mcp_trajectory.jsonl"

# Save subagent transcript path if available
if [ -n "$transcript" ]; then
  echo "{\"subagent_type\": \"$subagent_type\", \"transcript_path\": \"$transcript\", \"status\": \"$status\", \"duration_ms\": $duration, \"saved_at\": \"$(date -Iseconds)\"}" >> "$ace_dir/subagent_transcripts.jsonl"
fi

exit 0
