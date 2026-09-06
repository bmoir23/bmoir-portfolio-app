#!/bin/bash
# ACE After Tab File Edit Hook - Tracks tab edits
# Input: file_path

input=$(cat)
ace_dir=".cursor/ace"
mkdir -p "$ace_dir"

file_path=$(echo "$input" | jq -r '.file_path // ""')

echo "{\"event\": \"tab_edit\", \"file_path\": \"$file_path\", \"timestamp\": \"$(date -Iseconds)\"}" >> "$ace_dir/edit_trajectory.jsonl"
