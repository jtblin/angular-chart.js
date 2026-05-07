# Project Rules: Workflow Enforcer

To ensure project stability and maintain a transparent, human-in-the-loop development process, all AI interactions MUST follow these rules:

## 1. Planning First
- **Every task** (except trivially simple one-file fixes) **MUST** start with an `implementation_plan.md`.
- **GATE**: Do not begin implementation until the user explicitly approves the plan.

## 2. Git Permission Gates
- **GATE (Commit)**: Before running `git commit`, show the `git diff --staged` and ask for explicit permission.
- **GATE (Push)**: Always ask for turn-by-turn permission before running `git push`.
- **NO FORCE PUSH**: Force pushing is strictly prohibited. Resolve divergences via merge or standard pull.

## 3. GitHub Issue Hygiene
- **STRICT RULE**: Never use the `issue_write` tool to add comments to an issue. This tool overwrites the original issue description.
- **Action**: Always use `add_issue_comment` for adding feedback, progress updates, or closing remarks.

## 4. Skill Integration
- This project follows the standards defined in the global `workflow-enforcer` skill.
- Use `planning-and-task-breakdown` for all architectural changes.

---
*These rules are designed to prevent accidental regressions and ensure the human developer retains full control over the repository state.*
