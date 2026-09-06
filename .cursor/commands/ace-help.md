# ACE Help

Available ACE commands and MCP tools.

## Slash Commands

- `/ace-status` - Show playbook statistics
- `/ace-search <query>` - Search for patterns
- `/ace-configure` - Configure ACE connection (opens UI)
- `/ace-bootstrap` - Initialize playbook from codebase
- `/ace-learn` - Capture learning from completed task
- `/ace-help` - Show this help

## MCP Tools (Use These Directly)

- `ace_get_playbook()` - Get ALL patterns (only for export/backup, prefer ace_search)
- `ace_search(query)` - Search for specific patterns
- `ace_learn(task, trajectory, output, success)` - Capture learning (call AFTER tasks)
- `ace_bootstrap(mode, thoroughness)` - Initialize playbook
- `ace_status()` - Get playbook statistics

## Automatic Features

The MCP tools are designed for automatic invocation:
- **ace_search**: Called automatically before every task (5-10 relevant patterns)
- **ace_learn**: Called automatically after substantial work

## UI Commands (Command Palette)

Press `Cmd/Ctrl+Shift+P` and type "ACE" to see:
- ACE: Login / Logout
- ACE: Configure Connection
- ACE: Show Status
- ACE: Manage Devices