# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repository.

The canonical, tool-agnostic agent brief lives in **[AGENTS.md](./AGENTS.md)** — it is imported below,
so its full content applies here. The deep references are [`ARCHITECTURE.md`](./ARCHITECTURE.md),
[`docs/DEVELOPER_GUIDE.md`](./docs/DEVELOPER_GUIDE.md), and [`CONTRIBUTING.md`](./CONTRIBUTING.md).

@AGENTS.md

## Must-dos (do not skip)

- Run `npm run validate` (typecheck + lint + tests, **0 warnings**) before AND after every change.
- Scaffold features with `npm run new:feature -- <name> [Entity]` — never hand-create the layer tree.
- Honor the layering and the non-negotiables in AGENTS.md; the linter enforces most of them, so a
  failing rule means the code is wrong, not the rule.
- This is a Windows + PowerShell environment; prefer the project's npm scripts over ad-hoc shell.
