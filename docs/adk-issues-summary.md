# ADK + Claude Integration Issues Summary

A summary of issues encountered when using Claude to build Botpress ADK projects, compiled from internal Slack discussions.

---

## 1. Documentation & Explanation Gaps

### Actions vs Tools Confusion
- When asked to explain the difference between actions and tools, Claude's explanation is unclear
- Shows code with different function signatures but lacks insight into **when to use each**
- Missing: practical use cases, decision criteria for choosing one over the other

### Studio to ADK Mental Model Gap
- Users coming from Botpress Studio may be confused: **Studio "actions" = ADK "tools"**
- The LLM should be aware of this naming discrepancy and proactively clarify it

### ADK Folder Structure Explanations
- Explanations of what each `src/` folder is used for need **more context and less code**
- Should focus on purpose and use cases rather than implementation details

---

## 2. ADK CLI Issues

### `adk init` Fails with Non-Empty Directories
- `adk init <folder> --template blank` throws an error if `<folder>` is not completely empty
- **Problem**: If a user wants to use Claude within their project directory, the `.claude/` folder triggers the error and prevents initialization

### Non-Interactive Mode Not Supported
- Claude cannot run `adk link` and `adk dev` in non-interactive mode
- These commands require user input that Claude cannot provide programmatically

### Claude Bypasses CLI, Creates Files Manually
- Instead of using `adk init`, Claude generates the folder structure and files manually (using `touch`, etc.)
- **Problem**: Never created `agent.json` — assumed `adk dev` would generate it automatically
- **Resolution**: After receiving the error message, Claude correctly instructed to run `adk link` first

### Wrong Command Order: `adk dev` Before `adk link`
- Claude told the user to run `adk dev` before `adk link`
- Correct order: `adk link` first (to link project to workspace and generate `agent.json`), then `adk dev`

### Missing `adk install` Usage
- When given context about creating a Slack bot, Claude wrote an erroneous Slack dependency in `agent.config.ts` manually
- **Should have used**: `adk install slack` to properly add the integration

### Multiple Config Keys Bug (ADK Bug)
- Cannot set multiple `adk config` keys at once with `adk deploy`
- When you hit submit after the first key, it attempts to validate all keys before you can populate them, causing an error

---

## 3. Configuration & Setup Issues

### Slack Integration Configuration
- Claude doesn't know how to properly configure Slack integration (refresh token, client keys)
- **Wrong**: Tells user to configure in the Botpress UI
- **Correct**: Should be configured in source code with ADK using `adk config` command

### `adk config` Command Discovery
- Claude had to be prompted to use the `adk config` command
- Currently located in `skills/references/cli.md` but Claude seems unable to find it
- **Recommendation**: Add `adk config` as its own dedicated skill

### Configuration Prerequisites Not Known
- LLM needs to know that to use `adk config:set` and `adk config:get`, you must first create `configuration: {}` in `agent.config.ts`
- Need to show LLM how to access configuration variables in code

### Hallucinated UI Paths
- Claude hallucinated a non-existent path: "Botpress > Dashboard > Bot > Integrations > Slack"
- This path doesn't exist on the Botpress website
- **Need**: Better grounding to prevent hallucination of UI navigation instructions

---

## 4. Table Schema Issues

### Reserved Column Names Unknown
- Claude doesn't know what table column names are reserved/not allowed
- Reserved names: `id`, `createdAt`, `updatedAt`, `computed`, `stale`
- This causes runtime errors when Claude creates tables with these column names

---

## 5. Best Practice Recommendations

### Prefer `actions.asTool()` Over Direct Tools
- Claude should prefer using `actions.asTool()` pattern over creating standalone tools
- Actions provide reusable business logic that can be called from anywhere AND converted to tools

### Tool Creation Guidance
- Claude should prefer to create tools when appropriate for AI-callable functionality
- Need clearer guidance on when to use actions vs tools vs actions-as-tools

---

## Action Items

| Priority | Issue | Suggested Fix |
|----------|-------|---------------|
| High | `adk init` fails with `.claude/` folder | Update ADK to ignore common config directories |
| High | Non-interactive CLI commands | Add `--yes` or `--non-interactive` flags to `adk link`/`adk dev` |
| High | Wrong command order guidance | Update skill docs to emphasize `adk link` before `adk dev` |
| High | Missing `adk install` usage | Add prominent examples in skills showing `adk install <integration>` |
| Medium | Actions vs Tools explanation | Add dedicated section with use cases and decision tree |
| Medium | `adk config` discoverability | Create dedicated `adk config` skill |
| Medium | Configuration prerequisites | Document that `configuration: {}` must exist in `agent.config.ts` first |
| Medium | Reserved table columns | Add to skills/CLAUDE.md with full list of reserved names |
| Low | Hallucinated UI paths | Add grounding that config is code-based, not UI-based |
| Low | Studio naming confusion | Add explicit mapping: "Studio actions = ADK tools" |

---

*Last updated: 2026-01-29*
