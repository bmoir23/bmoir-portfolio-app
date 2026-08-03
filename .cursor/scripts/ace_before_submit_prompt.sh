#!/bin/bash
# ACE Before Submit Prompt Hook - Injects pattern context + logs injection for task helpfulness
# Input: prompt_text

input=$(cat)
ace_dir=".cursor/ace"
mkdir -p "$ace_dir"

if [ -f "$ace_dir/pattern_cache.json" ]; then
  pattern_count=$(jq -r '.patternCount // 0' "$ace_dir/pattern_cache.json" 2>/dev/null || echo "0")
  if [ "$pattern_count" -gt 0 ] 2>/dev/null; then
    domains=$(jq -r '.domains // [] | join(", ")' "$ace_dir/pattern_cache.json" 2>/dev/null || echo "")
    avg_conf=$(jq -r '.avgConfidence // 0' "$ace_dir/pattern_cache.json" 2>/dev/null || echo "0")
    # Log injection event for task helpfulness tracking
    echo "{\"event\": \"search\", \"patterns_injected\": $pattern_count, \"domains\": [\"$(echo "$domains" | sed 's/, /\", \"/g')\"], \"avg_confidence\": $avg_conf, \"timestamp\": \"$(date -Iseconds)\"}" >> "$ace_dir/ace-relevance.jsonl"
    echo '{"continue": true}'
  else
    echo '{"continue": true}'
  fi
else
  echo '{"continue": true}'
fi
