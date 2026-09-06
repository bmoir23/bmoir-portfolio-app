# ACE Search

Search for relevant patterns in your ACE playbook.

## Action Required

Use the `ace_search` MCP tool with the user's query:

```
ace_search(query: "<user's search terms>")
```

## Examples

If user types `/ace-search authentication`:
```
ace_search(query: "authentication")
```

If user types `/ace-search error handling`:
```
ace_search(query: "error handling")
```

The MCP tool will return matching patterns from the playbook that you can share with the user.