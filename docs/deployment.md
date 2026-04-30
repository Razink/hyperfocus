# Deployment

GitHub Actions deploys `master` through `.github/workflows/deploy.yml`.

Required repository secrets:

- `DEPLOY_SSH_KEY`: private SSH key allowed to connect as `root`.
- `DEPLOY_PATH`: absolute path to the checked out repo on the server, for example `/home/claude/workspace/hyperfocus`.

The workflow connects to `root@hyperfocus.kortaix.cloud`.

The remote server must already have:

- Docker and Docker Compose.
- Git.
- The Hyperfocus repository checked out at `DEPLOY_PATH`.
- Nginx already configured to route `hyperfocus.kortaix.cloud` to the app ports.

The deploy script runs Prisma migrations only when `backend/prisma/migrations`
exists. The current project has no versioned migrations yet, so deployment keeps
the existing database schema as-is.

Manual deploy on the server:

```bash
cd /home/claude/workspace/hyperfocus
bash scripts/deploy.sh
```
