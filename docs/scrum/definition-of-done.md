# Definition of Done — RailBite Sprint 1

A user story is **Done** when ALL of the following are true:

1. **Failing test first** — a RED commit exists (`test(<scope>): ...`) with tests that fail for the right reason before any implementation is written.
2. **All tests pass** — a GREEN commit exists (`feat(<scope>): ...`) where the full test suite (`npm test`) passes with zero failures.
3. **Coverage at or above 70 %** — `jest --coverage` reports ≥ 70 % for Statements, Branches, Functions, and Lines across all files in the story scope.
4. **PR reviewed by a teammate** — at least one teammate has approved the Pull Request on GitHub before merge.
5. **Product Owner verified acceptance criteria** — the PO (Ayaansh Rawat) has confirmed that the story's acceptance criteria are met in the sprint review demo.
6. **Branch merged into `develop`** — the feature branch has been merged into `develop` via a Pull Request; no direct commits to `main` or `develop`.

> **Additional guards (checked before every push):**
> - `git remote -v` shows `origin = https://github.com/Ayaansh08/RailBite_Agile.git`
> - `git config user.name` shows `Gaurav K Verma` (platform stories)
> - No secrets committed; passwords stored as bcrypt hashes only
> - Conventional commit format: `type(scope): message [RB-xxx]`
