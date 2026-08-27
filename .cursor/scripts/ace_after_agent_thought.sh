#!/bin/bash
# ACE After Agent Thought Hook - Captures agent thinking
# Input: text, duration_ms

input=$(cat)
ace_dir=".cursor/ace"
mkdir -p "$ace_dir"

text=$(echo "$input" | jq -r '.text // ""' | head -c 300)
duration_ms=$(echo "$input" | jq -r '.duration_ms // 0')

echo "{\"event\": \"agent_thought\", \"text\": \"$text\", \"duration_ms\": $duration_ms, \"timestamp\": \"$(date -Iseconds)\"}" >> "$ace_dir/response_trajectory.jsonl"

echo '{}'
