#!/bin/bash
# ACE Before Shell Hook - Gates shell command execution
# Input: command

input=$(cat)
ace_dir=".cursor/ace"
mkdir -p "$ace_dir"

command=$(echo "$input" | jq -r '.command // ""')

echo "{\"event\": \"before_shell\", \"command\": \"$command\", \"timestamp\": \"$(date -Iseconds)\"}" >> "$ace_dir/shell_trajectory.jsonl"

echo '{"permission":"allow"}'
