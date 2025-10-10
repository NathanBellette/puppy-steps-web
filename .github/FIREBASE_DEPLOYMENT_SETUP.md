# Firebase Hosting Deployment Setup

This guide will help you complete the setup for deploying to Firebase Hosting via GitHub Actions.

## Prerequisites

- A Firebase project (you can use your existing `puppy-steps-demo` project)
- Access to your GitHub repository settings

## Setup Steps

### 1. Generate Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`puppy-steps-demo`)
3. Go to **Project Settings** (gear icon) > **Service Accounts**
4. Click **Generate New Private Key**
5. Save the downloaded JSON file securely (you'll need it in the next step)

### 2. Add GitHub Secrets

Go to your GitHub repository settings and add the following secrets:

**Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

1. **`FIREBASE_SERVICE_ACCOUNT`**
   - Paste the entire contents of the service account JSON file you downloaded
   
2. **`FIREBASE_API_KEY`** (without VITE_ prefix)
   - Get from Firebase Console → Project Settings → General → Web API Key
   - The workflow will add the VITE_ prefix automatically

3. **`FIREBASE_AUTH_DOMAIN`** (without VITE_ prefix)
   - Format: `your-project-id.firebaseapp.com`
   - Example: `puppy-steps-demo.firebaseapp.com`

4. **`FIREBASE_PROJECT_ID`** (without VITE_ prefix)
   - Your Firebase project ID (e.g., `puppy-steps-demo`)

5. **`FIREBASE_STORAGE_BUCKET`** (without VITE_ prefix)
   - Format: `your-project-id.appspot.com`
   - Example: `puppy-steps-demo.appspot.com`

6. **`FIREBASE_MESSAGING_SENDER_ID`** (without VITE_ prefix)
   - Get from Firebase Console → Project Settings → General → Messaging Sender ID

7. **`FIREBASE_APP_ID`** (without VITE_ prefix)
   - Get from Firebase Console → Project Settings → General → App ID

> **Important:** Store these secrets WITHOUT the `VITE_` prefix in GitHub Secrets. The workflow automatically adds the prefix during the build process.

> **Note:** `GITHUB_TOKEN` is automatically provided by GitHub Actions, no need to add it.

### 3. Update Firebase Project ID (if needed)

If your Firebase project ID is different from `puppy-steps-demo`, update it in these files:

- `.firebaserc` - Update the `"default"` project name
- `.github/workflows/ci-cd.yml` - Update the `projectId` field in the deploy step
- `src/lib/firebase.ts` - Update the default values (optional, for local development)

### 4. Enable Firebase Hosting

1. Go to Firebase Console → Hosting
2. Click **Get Started** if you haven't enabled Hosting yet
3. Follow the prompts to set up hosting for your project

### 5. Test Local Deployment (Optional)

To test Firebase Hosting locally:

```bash
# Install dependencies (including firebase-tools)
npm install

# Build your application
npm run build

# Log in to Firebase
npx firebase login

# Test deployment locally
npx firebase serve

# Deploy manually (to test)
npm run firebase:deploy
```

### 6. Verify GitHub Actions

Once you've added all the secrets:

1. Push your changes to the `main` branch
2. Go to **Actions** tab in your GitHub repository
3. Watch the **CI/CD Pipeline** workflow run
4. If successful, your app will be deployed to: `https://puppy-steps-demo.web.app`

## Troubleshooting

### Build Fails

- Verify all Firebase environment variables are set correctly in GitHub Secrets
- Check that your service account JSON is valid and properly formatted

### Deployment Fails

- Ensure Firebase Hosting is enabled in your Firebase Console
- Verify the service account has the necessary permissions
- Check that the project ID in `.firebaserc` matches your Firebase project

### Environment Variables Not Working

- Make sure the secret names match exactly (they're case-sensitive)
- Rebuild after adding/updating secrets

## Additional Configuration

### Custom Domain

To add a custom domain:

1. Go to Firebase Console → Hosting → Add Custom Domain
2. Follow the instructions to verify ownership and add DNS records

### Preview Channels

To enable preview deployments for pull requests, add this job to your workflow:

```yaml
deploy-preview:
  name: Deploy Preview
  runs-on: ubuntu-latest
  needs: build
  if: github.event_name == 'pull_request'
  
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm ci
    - run: npm run build
    - uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: ${{ secrets.GITHUB_TOKEN }}
        firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
        projectId: puppy-steps-demo
        expires: 30d
```

## Files Changed

The following files were created or modified:

- ✅ Created `firebase.json` - Firebase Hosting configuration
- ✅ Created `.firebaserc` - Firebase project configuration
- ✅ Updated `.github/workflows/ci-cd.yml` - GitHub Actions workflow
- ✅ Updated `package.json` - Added Firebase scripts and tools
- ✅ Created this setup guide

## Next Steps

After completing the setup:

1. Run `npm install` to install `firebase-tools`
2. Add the GitHub secrets as described above
3. Push your changes to trigger the deployment
4. Monitor the GitHub Actions workflow
5. Visit your deployed site at `https://puppy-steps-demo.web.app`

