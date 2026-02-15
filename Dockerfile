# =============================================================================
# Test-only Dockerfile for CI/CD
# NOT for production — the app deploys to Firebase Hosting.
#
# Based on the official Playwright image, which includes:
#   - Node.js
#   - Chromium, Firefox, and WebKit browsers (pre-installed)
#   - All system dependencies needed by those browsers
#
# Keep this version in sync with @playwright/test in package.json.
# =============================================================================

FROM mcr.microsoft.com/playwright:v1.58.2-noble

# The Playwright image defaults to 'pwuser', but we need root to write to
# /app and install dependencies. Fine for a test-only container in CI.
USER root

WORKDIR /app

# --- Layer 1: Dependencies ---
# Copy only the dependency manifests first. Docker caches this layer
# so npm ci is skipped entirely when package*.json haven't changed.
COPY package.json package-lock.json ./
RUN npm ci

# --- Layer 2: Source code ---
# Copied after npm ci so that source changes don't bust the dependency cache.
COPY . .

# Playwright config reads CI to enable retries, single worker, and forbidOnly.
ENV CI=true
