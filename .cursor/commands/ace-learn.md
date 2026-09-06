# ACE Learn

Capture learning from a completed task to improve future AI assistance.

## Action Required

Use the `ace_learn` MCP tool to capture what was learned.

**IMPORTANT: All 4 parameters (task, trajectory, success, output) are required. The trajectory MUST be an array of strings.**

**IMPORTANT: Start the output field with `TIME_SAVED: Xm | reason` to report helpfulness.**

**IMPORTANT: Include `summary` — your last response to the user about the completed work.**

```
ace_learn(
  task: "Brief description of what was done",
  trajectory: ["Step 1: what you did first", "Step 2: what you did next"],
  success: true,
  output: "TIME_SAVED: Xm | one-line reason\nImportant lessons, patterns, or insights discovered",
  summary: "What you built, why you made key decisions, and what you learned"
)
```

## Example

After implementing a feature:
```
ace_learn(
  task: "Implemented JWT authentication",
  trajectory: ["Added auth middleware to Express app", "Created login endpoint with bcrypt", "Added token refresh with httpOnly cookies"],
  success: true,
  output: "TIME_SAVED: 15m | Auth patterns avoided OAuth docs research\nAlways use httpOnly cookies for refresh tokens. Access tokens should be short-lived (15min).",
  summary: "Implemented JWT auth with HS256 signing. Switched from RS256 because no key rotation infra. Used httpOnly cookies after playbook warned against localStorage. Server on port 3007 with /login, /protected, /health."
)
```

## When to Use

- After completing a significant task
- When you discovered something important
- After fixing a tricky bug
- When a pattern worked well (or didn't)