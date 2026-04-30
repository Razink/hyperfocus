# Deployment

GitHub Actions deploys `master` through `.github/workflows/deploy.yml`.

Required repository secrets:

- `SSH_PRIVATE_KEY`: private SSH key allowed to connect as `root`.

The workflow connects to `root@hyperfocus.kortaix.cloud` and deploys
`/home/claude/workspace/hyperfocus`.

The remote server must already have:

- Docker and Docker Compose.
- Git.
- The Hyperfocus repository checked out at `/home/claude/workspace/hyperfocus`.
- Nginx already configured to route `hyperfocus.kortaix.cloud` to the app ports.

The deploy script runs Prisma migrations only when `backend/prisma/migrations`
exists. The current project has no versioned migrations yet, so deployment keeps
the existing database schema as-is.

Manual deploy on the server:

```bash
cd /home/claude/workspace/hyperfocus
bash scripts/deploy.sh
```
