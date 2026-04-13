# Learnings

Corrections, insights, and knowledge gaps captured during development.

**Categories**: correction | insight | knowledge_gap | best_practice

---

## [LRN-20260413-001] correction

**Logged**: 2026-04-13T23:25:35+08:00
**Priority**: high
**Status**: pending
**Area**: docs

### Summary
For this repository, push completed code changes to GitHub automatically unless the user explicitly says not to.

### Details
The user corrected the workflow expectation and asked not to have to repeat that GitHub pushes should happen automatically. This project already deploys from pushes to `main`, so holding local changes after completing a requested change creates avoidable extra turns.

### Suggested Action
After completing requested code changes and local validation in this repo, commit and push to GitHub by default. Only hold changes locally when the user explicitly asks not to push or asks for review before pushing.

### Metadata
- Source: user_feedback
- Related Files: .github/workflows/deploy.yml
- Tags: git, github, deployment, workflow

---
