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
