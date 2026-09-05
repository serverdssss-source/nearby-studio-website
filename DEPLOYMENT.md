# Deployment Guide

This project deploys in two separate pieces. Frontend and backend do **not**
deploy together — each has its own trigger.

| Part | Hosted on | Deploys when... | How |
|---|---|---|---|
| Frontend (`src/`, `public/`, `index.html`, etc.) | Vercel | any push to `master` | Vercel's own GitHub integration, automatic |
| Backend (`server/`) | Hostinger VPS (PM2) | push to `master` that touches `server/**` | [.github/workflows/deploy.yml](.github/workflows/deploy.yml) via GitHub Actions → SSH |

## Backend deploy — what actually happens

On a push to `master` under `server/**`, GitHub Actions SSHes into the VPS and runs:

```bash
cd /var/www/ssstudio
git fetch origin master
git reset --hard origin/master
cd server
npm ci || npm install
pm2 restart ssstudio-backend || pm2 start index.js --name "ssstudio-backend"
```

Takes ~30s. Runs automatically — **you do not need to SSH in for a normal backend
code change.** Just:

```bash
git add server/
git commit -m "describe the change"
git push origin master
```

### Checking a deploy went through
```bash
gh run list --workflow=deploy.yml --limit 5    # recent runs
gh run watch <run-id> --exit-status             # watch one live
```
Or check the **Actions** tab on GitHub. Green check ≈ 30s after push.

### Forcing a redeploy with no real code change
If you need to trigger a backend restart without changing any actual logic
(e.g. after editing `.env` on the VPS, or just to be safe), touch the trigger
file — that's what it's for:

```bash
echo "Redeploy: $(date +%F)" >> server/deploy_trigger.txt
git add server/deploy_trigger.txt
git commit -m "Trigger backend redeploy"
git push origin master
```

## VPS access

- SSH alias `hostinger-vps` is configured in `~/.ssh/config` on the dev machine
  (`ssh hostinger-vps` or `ssh root@<vps-ip>` — ask if you don't have the IP/password saved).
- App directory: `/var/www/ssstudio` (git clone of this repo)
- Backend subdir: `/var/www/ssstudio/server`
- PM2 process name: `ssstudio-backend`
- Other PM2 apps on the same box — **do not touch these**: `renovaahair.com`, `sripada-billing`

Useful PM2 commands once SSHed in:
```bash
pm2 status                                   # see all apps + status
pm2 logs ssstudio-backend --lines 50 --nostream
pm2 restart ssstudio-backend --update-env    # restart, reload env if .env changed
pm2 show ssstudio-backend                    # script path, cwd, uptime, etc.
```

## Secrets / `.env`

`server/.env` is **gitignored** — it is never touched by a git push/deploy.
It lives only on the VPS at `/var/www/ssstudio/server/.env` and holds live
credentials (Razorpay live keys, Neon DB URL, Resend API key, admin email).

To change a secret:
1. SSH into the VPS
2. Edit `/var/www/ssstudio/server/.env` directly
3. `pm2 restart ssstudio-backend --update-env`

`server/.env.example` in the repo shows which variables are expected, with
placeholder values — keep it in sync when you add a new one, but never put
real values there.

## Troubleshooting

**Symptom: GitHub Actions shows a green ✅ but the live site doesn't reflect
your latest push.**

This happened once (Sept 2026) — the VPS's `/var/www/ssstudio` had lost its
`.git` folder, so `git fetch`/`git reset --hard` in the workflow were failing
silently (the script doesn't stop on that error), while `npm ci`/`pm2 restart`
still ran against whatever stale code was already on disk. The job reported
success the whole time.

To check if this has happened again:
```bash
ssh hostinger-vps
cd /var/www/ssstudio && git status
```
If that errors with `fatal: not a git repository`, re-clone it:
```bash
pm2 stop ssstudio-backend
cd /var/www
cp -r ssstudio ssstudio.bak                                   # safety backup
cp ssstudio/server/.env ssstudio_env_backup                   # save real secrets
mv ssstudio ssstudio.old
git clone https://github.com/serverdssss-source/nearby-studio-website.git ssstudio
cp ssstudio_env_backup ssstudio/server/.env
cd ssstudio/server && npm ci
pm2 delete ssstudio-backend
pm2 start index.js --name "ssstudio-backend"
pm2 save
```
Then verify:
```bash
pm2 status                          # ssstudio-backend should be "online"
pm2 logs ssstudio-backend --lines 30 --nostream   # look for "Neon PostgreSQL connected"
cd /var/www/ssstudio && git log -1 --oneline      # should match latest master
curl -s http://localhost:5000/      # any response (even 404) proves it's up
```
Once confirmed stable, clean up: `rm -rf /var/www/ssstudio.old /var/www/ssstudio.bak /var/www/ssstudio_env_backup`.

**`npm ci` fails with "Missing: X from lock file"** — `server/package-lock.json`
is out of sync with `server/package.json`. Fix locally and commit:
```bash
cd server
npm install          # regenerates the lock file
rm -rf node_modules && npm ci   # verify it now installs cleanly
git add package-lock.json
git commit -m "Regenerate server/package-lock.json"
git push origin master
```
