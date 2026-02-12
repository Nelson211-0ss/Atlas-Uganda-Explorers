# Quick Setup - Add GitHub Secrets

Your Cloudflare Account ID: `f624070c3a55e6217189fda7ae8d4454`

## Step 1: Create Cloudflare API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Click **"Use template"** next to "Edit Cloudflare Workers"
4. Scroll down and click **"Continue to summary"**
5. Click **"Create Token"**
6. **COPY THE TOKEN** (you won't see it again!)

## Step 2: Add Secrets to GitHub

1. Go to: https://github.com/Nelson211-0ss/Atlas-Uganda-Explorers/settings/secrets/actions
2. Click **"New repository secret"**

### Add First Secret:
- Name: `CLOUDFLARE_API_TOKEN`
- Value: [Paste the token you copied in Step 1]
- Click **"Add secret"**

### Add Second Secret:
- Click **"New repository secret"** again
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Value: `f624070c3a55e6217189fda7ae8d4454`
- Click **"Add secret"**

## Step 3: Push to GitHub

Run these commands:

```bash
git add .
git commit -m "Add CI/CD workflow for automatic deployment"
git push origin main
```

## Step 4: Watch It Deploy! 🚀

Go to: https://github.com/Nelson211-0ss/Atlas-Uganda-Explorers/actions

You'll see your deployment running automatically!

---

## That's It!

From now on, every time you push to `main`, your site will automatically deploy to:
- https://atlas-uganda-explorers.pages.dev
- https://atlasugandaexplorers.com

Pull requests will get preview deployments too!
