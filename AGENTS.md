# Development notes

- Keep business logic in services, not controllers.
- Keep the MVP small; add authentication, payments, and advanced inventory only when requested.

## Commit convention

Use Conventional Commits for every commit:

```text
<type>(<scope>): <short imperative description>
```

Allowed types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `build`, `ci`.

Rules:

- Use English, lowercase type/scope, and an imperative subject without a final period.
- Keep the subject at 72 characters or fewer when practical.
- Use one purpose per commit; do not mix unrelated changes.
- Use `BREAKING CHANGE:` in the body/footer when an API or behavior change is incompatible.
- Before every push, inspect the diff, run the relevant checks, and push only commits following this convention.

Examples: `feat(books): add book creation endpoint`, `fix(order): prevent negative stock`.


## UI and language quality

- Check all user-facing Vietnamese text for spelling, accents, punctuation, and natural wording before delivery. Never introduce mojibake or missing Vietnamese diacritics; keep source files saved as UTF-8.
- Keep UI text consistent across pages: use the same names for actions, statuses, buttons, empty states, errors, and confirmations.
- Build interfaces that feel modern and cohesive: clear hierarchy, balanced spacing, readable typography, consistent colors, responsive layouts, visible focus states, and accessible labels. Avoid browser-default controls when a styled component is available.
- For every UI change, inspect the affected screen at desktop and narrow widths, verify loading/empty/error/success states, and run the relevant frontend build and tests before handoff.
