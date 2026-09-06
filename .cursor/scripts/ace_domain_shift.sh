#!/bin/bash
# ACE Domain-Shift Inject Hook (v0.5.0-dev.10+) — fires on Read/Edit.
# Detects domain mismatch vs last_domain marker and injects fresh patterns
# wrapped as <ace-patterns-domain-shift domain="..."> ... </ace-patterns-domain-shift>.
#
# v0.5.0-dev.10+ HOTFIX (Bug A clone): Cursor strips PATH on hook invocation,
# so bare `command -v node` misses Homebrew/nvm. Extend PATH up front so
# both jq and node lookups succeed even on minimal Cursor PATH.

# Caveman: search helper baked at write time from extensionContext.extensionPath.
HELPER="/Users/bmoir/.cursor/extensions/ce-dot-net.cursor-ace-extension-0.5.2-universal/scripts/ace_search_helper.js"

# Bug A fix — extend PATH before any binary lookup.
export PATH="/opt/homebrew/bin:/usr/local/bin:/opt/local/bin:$HOME/.nvm/current/bin:$HOME/.nvm/versions/node/current/bin:$HOME/.local/bin:$HOME/bin:$PATH"

input=$(cat)
ace_dir=".cursor/ace"
mkdir -p "$ace_dir"

if ! command -v jq >/dev/null 2>&1; then echo '{}'; exit 0; fi

tool_name=$(echo "$input" | jq -r '.tool_name // ""')
file_path=$(echo "$input" | jq -r '.tool_input.file_path // .file_path // ""')
conv_id=$(echo "$input" | jq -r '.conversation_id // ""')
gen_id=$(echo "$input" | jq -r '.generation_id // ""')

# Only fire on Read/Edit-style tools (not on bash, mcp, etc.)
case "$tool_name" in
  Read|Edit|Write|MultiEdit|edit|read|write) ;;
  *) echo '{}'; exit 0;;
esac

[ -z "$file_path" ] && echo '{}' && exit 0
[ -z "$conv_id" ] || [ -z "$gen_id" ] && echo '{}' && exit 0

# Privacy gate (same as pre-tool-use): only inject when opt-in true.
opt_in=0
settings_file="$ace_dir/runtime-settings.json"
if [ -f "$settings_file" ]; then
  raw=$(jq -r '.shareRawPromptsForRetrievalAnalysis // false' "$settings_file" 2>/dev/null || echo "false")
  if [ "$raw" = "true" ]; then opt_in=1; fi
fi
[ "$opt_in" = "0" ] && echo '{}' && exit 0

# Caveman: derive domain from file path.
# Quick heuristic mirroring inferDomain() — keep in sync with TS.
lc=$(echo "$file_path" | tr '[:upper:]' '[:lower:]')
domain=""
case "$lc" in
  *docker*|*.yml|*.yaml|*.github/workflows*) domain="devops-infrastructure" ;;
  *.test.*|*.spec.*|*__tests__*|*/tests/*|*/test/*) domain="testing-strategies" ;;
  */migrations/*|*.sql) domain="database-migrations" ;;
  */components/*|*.tsx|*.jsx) domain="react-components" ;;
  */auth/*|*login*|*session*|*jwt*|*oauth*) domain="auth-development" ;;
  */api/*|*/routes/*|*/route/*|*/controllers/*|*/handlers/*|*/endpoints/*) domain="api-development" ;;
  *)
    domain=$(echo "$file_path" | cut -d/ -f1)
    [ -z "$domain" ] && domain="general"
    ;;
esac

# Track last-domain per conv/gen.
# v0.5.0-dev.24 — folder renamed sessions/ → tasks/.
session_dir="$ace_dir/tasks/$conv_id"
mkdir -p "$session_dir"
last_domain_file="$session_dir/$gen_id.last-domain"
last_domain=""
[ -f "$last_domain_file" ] && last_domain=$(cat "$last_domain_file" 2>/dev/null)

# Same domain → no shift, no injection.
if [ "$domain" = "$last_domain" ]; then
  echo '{}'; exit 0
fi

# Update last-domain marker BEFORE network call (single inject per domain change).
echo "$domain" > "$last_domain_file"

# Helper exists?
[ ! -f "$HELPER" ] && echo '{}' && exit 0

# Bug A fix — explicit node binary resolver (PATH already extended above).
NODE_BIN=""
if command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
else
  for candidate in \
    "/opt/homebrew/bin/node" \
    "/usr/local/bin/node" \
    "/opt/local/bin/node" \
    "$HOME/.nvm/current/bin/node" \
    "$HOME/.nvm/versions/node/current/bin/node" \
    "$HOME/.local/bin/node" \
    "$HOME/bin/node"; do
    if [ -x "$candidate" ]; then NODE_BIN="$candidate"; break; fi
  done
fi
[ -z "$NODE_BIN" ] && echo '{}' && exit 0

# Build a query from filename + domain hint.
basename=$(basename "$file_path" 2>/dev/null | sed 's/\.[^.]*$//')
query="$domain $basename"

# Fetch patterns (8s timeout).
patterns=""
if command -v gtimeout >/dev/null 2>&1; then
  patterns=$(gtimeout 8 "$NODE_BIN" "$HELPER" "$query" 2>/dev/null)
elif command -v timeout >/dev/null 2>&1; then
  patterns=$(timeout 8 "$NODE_BIN" "$HELPER" "$query" 2>/dev/null)
else
  patterns=$(perl -e 'alarm 8; exec @ARGV' -- "$NODE_BIN" "$HELPER" "$query" 2>/dev/null)
fi

[ -z "$patterns" ] || [ "$patterns" = "{}" ] && echo '{}' && exit 0

# Sanity: require at least 1 pattern.
n=$(echo "$patterns" | jq -r '(.similar_patterns // []) | length' 2>/dev/null || echo "0")
[ "$n" = "0" ] && echo '{}' && exit 0

# Wrap as <ace-patterns-domain-shift domain="..."> ... </ace-patterns-domain-shift>.
wrapped=$(printf '<ace-patterns-domain-shift domain="%s">%s</ace-patterns-domain-shift>' "$domain" "$patterns")
ctx_json=$(printf '%s' "$wrapped" | jq -Rs .)

cat <<EOF
{"additional_context":$ctx_json}
EOF
