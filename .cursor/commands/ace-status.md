# ACE Status

Show ACE playbook statistics and pattern counts.

## Action Required

You have two options:

### Option 1: Use MCP Tool (Recommended)
Call the `ace_status` MCP tool to get status information:
```
ace_status()
```

### Option 2: Guide User to UI
Tell the user:
1. Click the ACE status bar item in the bottom-right corner, OR
2. Press `Cmd/Ctrl+Shift+P`, type "ACE: Show Status", press Enter

The status shows:
- Total patterns in playbook
- Average confidence score
- Patterns by section (strategies, snippets, pitfalls, APIs)
- Organization and project information