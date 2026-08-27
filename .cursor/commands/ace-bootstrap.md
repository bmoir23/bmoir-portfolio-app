# ACE Bootstrap

Initialize your ACE playbook by extracting patterns from your existing codebase.

## Action Required

Use the `ace_bootstrap` MCP tool:

```
ace_bootstrap(mode: "hybrid", thoroughness: "medium")
```

## Parameters

- **mode**: "hybrid" (recommended), "local-files", "git-history", or "docs-only"
- **thoroughness**: "light", "medium" (recommended), or "deep"

## What This Does

1. Analyzes your codebase (docs, source files, git history)
2. Extracts patterns and best practices
3. Sends them to ACE server for processing
4. Initializes your playbook with learned patterns

The tool will stream progress updates as it analyzes your code.