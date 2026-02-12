# CI/CD Setup for Cloudflare Pages

This repository is configured to automatically deploy to Cloudflare Pages on every push to the `main` branch.

## Setup Instructions

### 1. Get Your Cloudflare Credentials

**Cloudflare Account ID:**
- Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
- Select your account
- Copy the Account ID from the right sidebar

**Cloudflare API Token:**
- Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
- Click "Create Token"
- Use the "Edit Cloudflare Workers" template or create a custom token with:
  - Permissions: `Account > Cloudflare Pages > Edit`
- Click "Continue to summary" and "Create Token"
- Copy the token (you won't see it again!)

### 2. Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret** and add:

   - Name: `CLOUDFLARE_API_TOKEN`
     Value: [Your API token from step 1]

   - Name: `CLOUDFLARE_ACCOUNT_ID`
     Value: [Your Account ID from step 1]

### 3. Update Project Name (if needed)

In `.github/workflows/deploy.yml`, update the `projectName` field to match your Cloudflare Pages project name:

```yaml
projectName: atlas-uganda-explorers  # Change this if your project has a different name
```

### 4. Push to GitHub

```bash
git add .
git commit -m "Add CI/CD workflow"
git push origin main
```

### 5. Monitor Deployment

- Go to the **Actions** tab in your GitHub repository
- You'll see the deployment workflow running
- Once complete, your site will be live on Cloudflare Pages!

## How It Works

- **On push to `main`**: Automatically deploys to production
- **On pull request**: Creates a preview deployment for testing
- Uses the official Cloudflare Pages GitHub Action
- No build step needed (static HTML site)

## Manual Deployment (Alternative)

You can still deploy manually using Wrangler CLI:

```bash
npx wrangler pages deploy . --project-name=atlas-uganda-explorers
```
