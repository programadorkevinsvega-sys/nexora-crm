# CI/CD production release gates

## Independent validation jobs

Every workflow run on `main`, `master`, `develop`, and every pull request targeting those branches runs five independent required jobs:

- **Database migrations:** apply all migrations and apply them a second time to verify idempotency.
- **Lint:** run ESLint for every workspace package. Each package invokes ESLint with `--max-warnings=0`; any warning or error fails the job.
- **Type checking:** run workspace TypeScript checks and the frontend `tsc --noEmit`.
- **Tests:** run unit and integration tests with PostgreSQL and NATS JetStream available.
- **Build:** compile the production workspace.

Deployment depends on every validation job. A failed, cancelled, or skipped validation cannot authorize production.

## Production deployment policy

A push to `main` runs validation only. It does **not** deploy to the VM.

A release must be started manually from the `main` branch using **Actions → CI Pipeline → Run workflow**, with `confirm_production: yes`. The job targets the GitHub Environment named `production`.

The repository owner must configure the Environment protection rule once:

1. Open **Settings → Environments → production**.
2. Under **Environment protection rules**, enable **Required reviewers**.
3. Add the designated production approver, preferably someone other than the person initiating the release.
4. Save the environment.

The workflow also queries the Environment configuration and fails closed unless a `required_reviewers` protection rule exists. If the API cannot confirm the rule, deployment stops before connecting to the VM. When configured, GitHub pauses the environment job until a reviewer approves it.

## Zero-warning policy

Existing lint debt is intentionally blocking. It must not be hidden by warning suppression, relaxed thresholds, or `continue-on-error`. ESLint distinguishes Node.js, Jest, and browser environments; TypeScript's compiler handles undefined TypeScript identifiers. Real violations, including `any` and unused symbols, must be fixed in source before the PR can pass.

Do not merge while strict lint is red. Do not deploy until every required job is green and the production Environment approval has been granted.
