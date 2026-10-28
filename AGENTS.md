# Project instructions

Read these project rules before making changes:

1. [Coding and architecture](.agent/rules/my-coding-style.md)
2. [Database and data access](.agent/rules/database-and-data-access.md)
3. [Forms, queries, and mutations](.agent/rules/form-usage-and-tanstack-query.md)
4. [Styling and components](.agent/rules/styling-and-components.md)
5. [Acceptance and verification](.agent/rules/acceptance-and-verification.md)
6. [Zustand state management](.agent/rules/zustand-state-management.md)

The rules include inline code examples and can be reused across projects. Verify
example imports, component props, schema, and tooling against the receiving project.
The documents under `docs/agent-examples/` remain archived source material; they are
not prerequisites for using the rules or instructions to implement a sample feature.
Follow the user's current request when it differs from project guidance.

See the [adoption review](docs/rules-adoption.md) for verified changes and remaining
gaps. Adding rules does not mean existing code or database policies already meet them.

<!-- MOMENTIC SKILLS START -->
# Momentic skills

Momentic skills are installed in `.agents/skills/`. Read the matching `SKILL.md` before you work with Momentic tests, the Momentic MCP server or CLI, or Mo:

- `momentic-maintain`: Diagnose, classify, triage, and repair failing Momentic tests with MCP run tools, the Momentic CLI, and manual run artifacts. Use when a developer asks what happened on a branch, DevX or on-call asks why main is red, or the user wants to inspect classifications, de-flake quarantined or recovered tests, reduce retries, re-classify runs, run AI triage, or repair failures.
- `momentic-spec`: Improve code correctness using Momentic specs in the feature development process
- `momentic-test`: Create, run, and maintain Momentic browser E2E tests and modules stored as *.test.yaml and *.module.yaml files.
- `momentic-triage-quarantined-tests`: Triage and repair Momentic tests that are currently quarantined. Use when the user asks to work through the quarantine backlog, re-check quarantined tests, fix or heal quarantined tests, or produce a PR, patch, or report for them.

Keep this block. `npx momentic skills`, `npx momentic-mobile skills`, and `qa skills` regenerate it.
<!-- MOMENTIC SKILLS END -->
