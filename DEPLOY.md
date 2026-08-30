# 🚀 Angel Fireworks — Free Deployment Guide

A low-traffic, **₹0/month** setup. Later you can attach a custom domain without any code change.

| Part | Service | Free tier |
|------|---------|-----------|
| Database | MongoDB Atlas | M0, 512 MB (forever) |
| Images | Cloudinary | Generous free CDN |
| Backend API | Render (Web Service) | Free (sleeps when idle) |
| Customer site | Vercel | Free static |
| Admin site | Vercel (2nd project) | Free static |

---

## 0) Put the code on GitHub
The app is **3 deploys from one repo**: `backend/`, `frontend/`, `admin/`.
```bash
cd "angel fireworks"
git init && git add . && git commit -m "Angel Fireworks"
# create an empty GitHub repo, then:
git remote add origin https://github.com/<you>/angel-fireworks.git
git push -u origin main
```
`.env` files are git-ignored — you'll set secrets in each host's dashboard.

---

## 1) MongoDB Atlas (DB)
1. Atlas → your cluster → **Network Access** → Add IP → **Allow from anywhere** (`0.0.0.0/0`).
2. **Database Access** → confirm a user + password.
3. Copy the connection string → this is your `MONGO_URI` (end it with `/angelfireworks`).

## 2) Cloudinary (images)
1. Sign up at cloudinary.com (free).
2. Dashboard → copy **Cloud name**, **API Key**, **API Secret**.
3. These become `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
   > When these are set, uploads go to Cloudinary and return permanent CDN URLs. If unset (local dev), uploads save to `backend/uploads/` instead.

## 3) Backend → Render
1. Render → **New → Blueprint** and pick this repo (it reads `render.yaml`), **or** New → Web Service with:
   - Root directory: `backend`  ·  Build: `npm install`  ·  Start: `npm start`
2. Add env vars (Environment tab):
   - `MONGO_URI`, `JWT_SECRET` (run `openssl rand -hex 32`), `ADMIN_USERNAME`, `ADMIN_PASSWORD`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `CLIENT_URL`, `ADMIN_URL` → your two Vercel URLs (fill after step 4; can leave blank first, then update)
3. Deploy → note the URL, e.g. `https://angel-fireworks-api.onrender.com`.
4. Create the Super Admin once — Render → **Shell** tab:
   ```bash
   npm run create-admin
   ```
   > ⚠️ Do **not** run `npm run seed` on real data — it only adds samples to an *empty* catalog now, but `seed:reset` wipes everything.
   > 💤 Free Render sleeps after ~15 min idle → first request is slow (~30-50s). Fine for low traffic.

## 4) Frontends → Vercel (two projects, same repo)
**Customer site:**
1. Vercel → New Project → import the repo.
2. **Root Directory: `frontend`** (Framework: Vite, auto-detected).
3. Env var: `VITE_API_URL = https://angel-fireworks-api.onrender.com` (your Render URL).
4. Deploy → e.g. `https://angel-fireworks.vercel.app`.

**Admin site:** repeat with **Root Directory: `admin`**, same `VITE_API_URL`.
→ e.g. `https://angel-admin.vercel.app`.

## 5) Close the loop (CORS)
Back in Render env vars, set:
- `CLIENT_URL = https://angel-fireworks.vercel.app`
- `ADMIN_URL  = https://angel-admin.vercel.app`

Redeploy the backend. Done — go to the admin URL, log in, add products & gallery images.

---

## 🌐 Later: your own domain (no code change)
Buy a domain (~₹700-1000/yr). Then:
- **Vercel** (customer/admin): Project → Settings → Domains → add `angelfireworks.com` / `admin.angelfireworks.com` (Vercel gives free SSL; just add the DNS records at your registrar).
- **Render** (API): Settings → Custom Domain → add `api.angelfireworks.com`.
- Update `VITE_API_URL` (Vercel) + `CLIENT_URL`/`ADMIN_URL` (Render) to the new URls → redeploy.

Everything is env-driven, so swapping domains is just changing variables.

---

## 🧪 Local dev (unchanged)
```bash
# terminal 1
cd backend && npm install && npm run dev      # :5001  (Cloudinary blank → images saved to disk)
# terminal 2
cd frontend && npm install && npm run dev     # :3000  (VITE_API_URL blank → proxy to :5001)
# terminal 3
cd admin && npm install && npm run dev        # :3001
```
