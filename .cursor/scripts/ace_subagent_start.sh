#!/bin/bash
# ACE Subagent Start Hook - Tracks subagent spawning for AI-Trail
# Input: subagent_type, prompt, model

input=$(cat)
ace_dir=".cursor/ace"
mkdir -p "$ace_dir"

subagent_type=$(echo "$input" | jq -r '.subagent_type // "unknown"')
model=$(echo "$input" | jq -r '.model // "unknown"')
prompt_preview=$(echo "$input" | jq -r '.prompt // ""' | head -c 200)

echo "{\"event\": \"subagent_start\", \"type\": \"$subagent_type\", \"model\": \"$model\", \"prompt_preview\": \"$prompt_preview\", \"timestamp\": \"$(date -Iseconds)\"}" >> "$ace_dir/mcp_trajectory.jsonl"

# Allow all subagents (no blocking)
echo '{"permission":"allow"}'
