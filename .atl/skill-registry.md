# Skill Registry

This registry tracks available skills and project standards.

## Skills

| Name | Trigger | Path |
|------|---------|------|
| `branch-pr` | When creating a pull request, opening a PR, or preparing changes for review. | C:\Users\Jhony\.gemini\antigravity\skills\branch-pr\SKILL.md |
| `go-testing` | When writing Go tests, using teatest, or adding test coverage. | C:\Users\Jhony\.gemini\antigravity\skills\go-testing\SKILL.md |
| `issue-creation` | When creating a GitHub issue, reporting a bug, or requesting a feature. | C:\Users\Jhony\.gemini\antigravity\skills\issue-creation\SKILL.md |
| `judgment-day` | When user says "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen". | C:\Users\Jhony\.gemini\antigravity\skills\judgment-day\SKILL.md |
| `skill-creator` | When user asks to create a new skill, add agent instructions, or document patterns for AI. | C:\Users\Jhony\.gemini\antigravity\skills\skill-creator\SKILL.md |
| `cortezaweb-ui` | When modifying UI components, buttons, forms, or layouts. | .gemini\antigravity\skills\cortezaweb-ui\SKILL.md |

## Compact Rules

### cortezaweb-ui
- Every button, link, and interactive card MUST have the `cursor-pointer` class.
- Avoid redundant forms if direct WhatsApp contact is available.
- Use rounded-2xl or rounded-[24px] for buttons.
- Match primary and accent color conventions.

### branch-pr
- Every PR MUST link an approved issue.
- Every PR MUST have exactly one `type:*` label.
- Branch naming: `type/description` (e.g., `feat/user-login`).
- Use conventional commits: `type(scope): description`.
- No `Co-Authored-By` or AI attribution in commits.

### go-testing
- Use table-driven tests for multiple inputs.
- Use `teatest` for Bubbletea TUI component testing.
- Use golden file testing for visual output comparisons.

### issue-creation
- No blank issues; use standard templates (bug report, feature request).
- Issues get `status:needs-review` on creation.
- Maintainer must add `status:approved` before PR starts.
- Use Discussions for general questions.

### judgment-day
- Launch two independent blind judge sub-agents in parallel via `delegate`.
- Synthesize findings into Confirmed, Suspect, Contradiction.
- Classify warnings as `real` (blocks) or `theoretical` (info).
- Fixed issues require re-judgment (at most 2 iterations before escalation).

### skill-creator
- Create skills for repeating patterns or specific project conventions.
- SKILL.md structure: Name, Description (with trigger), License, Metadata, Rules, Patterns, Examples.
- References must be to LOCAL files.
