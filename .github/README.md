# GitHub Actions Workflows

This project includes comprehensive GitHub Actions workflows for automated CI/CD, testing, and code quality checks. All workflows are designed to work with free GitHub Actions minutes.

## 🚀 Workflows Overview

### 1. **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)
- **Triggers**: Push to `main`/`develop`, Pull Requests to `main`
- **Features**:
  - Automated testing with Vitest
  - ESLint code quality checks
  - TypeScript compilation
  - Build verification
  - **Free GitHub Pages deployment** (when pushing to main)
- **Benefits**: 
  - Automatic deployment to `https://yourusername.github.io/puppy-steps-web`
  - No hosting costs
  - Instant feedback on code changes

### 2. **Code Quality & Security** (`.github/workflows/code-quality.yml`)
- **Triggers**: Push/PR to main branches, Weekly schedule
- **Features**:
  - ESLint analysis
  - TypeScript type checking
  - Dependency audit for security vulnerabilities
  - Unused dependency detection
  - Dependency review for PRs
- **Benefits**:
  - Catches security issues early
  - Maintains code quality standards
  - Prevents dependency-related vulnerabilities

### 3. **Automated Testing** (`.github/workflows/testing.yml`)
- **Triggers**: Push/PR to main branches
- **Features**:
  - Cross-platform testing (Ubuntu, Windows, macOS)
  - Multiple Node.js versions (18, 20)
  - Test coverage reporting
  - Optional Codecov integration
- **Benefits**:
  - Ensures compatibility across platforms
  - Comprehensive test coverage tracking
  - Early detection of breaking changes

### 4. **Performance & Bundle Analysis** (`.github/workflows/performance.yml`)
- **Triggers**: Push/PR to main branches
- **Features**:
  - Bundle size analysis
  - Lighthouse performance audits
  - Core Web Vitals monitoring
  - Performance regression detection
- **Benefits**:
  - Maintains optimal performance
  - Tracks bundle size growth
  - Ensures good user experience

### 5. **Dependency Updates** (`.github/workflows/dependency-updates.yml`)
- **Triggers**: Weekly schedule (Mondays), Manual dispatch
- **Features**:
  - Automated dependency updates
  - Security fix application
  - Outdated package detection
  - Automatic PR creation
- **Benefits**:
  - Keeps dependencies current
  - Reduces manual maintenance
  - Improves security posture

## 🛠️ Setup Instructions

### 1. **Enable GitHub Pages** (Free)
```bash
# Go to your repository settings
# Navigate to Pages section
# Select "GitHub Actions" as source
```

### 2. **Optional: Code Coverage Integration**
```bash
# Sign up for free Codecov account
# Add CODECOV_TOKEN to repository secrets
# Get token from: https://codecov.io/
```

### 3. **Repository Secrets** (Optional)
- `CODECOV_TOKEN`: For test coverage reporting
- `FIREBASE_TOKEN`: If you want to deploy to Firebase (not included in free setup)

## 📊 Workflow Benefits

### **Free Features You Get:**
- ✅ **2,000 minutes/month** of GitHub Actions (free tier)
- ✅ **GitHub Pages hosting** (completely free)
- ✅ **Dependency security scanning**
- ✅ **Cross-platform testing**
- ✅ **Performance monitoring**
- ✅ **Automated dependency updates**

### **Cost Savings:**
- **Hosting**: $0/month (vs $5-20/month for other services)
- **CI/CD**: $0/month (vs $10-50/month for other platforms)
- **Security scanning**: $0/month (vs $20-100/month for security tools)
- **Performance monitoring**: $0/month (vs $10-30/month for monitoring)

## 🔧 Customization

### **Modify Workflow Triggers**
```yaml
# In any workflow file, change the 'on' section:
on:
  push:
    branches: [ main, develop, feature/* ]  # Add your branches
  pull_request:
    branches: [ main ]
```

### **Adjust Performance Thresholds**
```javascript
// In lighthouse.config.js:
assertions: {
  'categories:performance': ['warn', { minScore: 0.9 }], // Increase threshold
}
```

### **Customize Dependency Update Schedule**
```yaml
# In dependency-updates.yml:
schedule:
  - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC
```

## 📈 Monitoring & Alerts

### **Workflow Status**
- Check the "Actions" tab in your GitHub repository
- Green ✅ = All checks passed
- Red ❌ = Issues detected (check logs)

### **Performance Tracking**
- Lighthouse reports available in workflow artifacts
- Bundle size trends tracked over time
- Performance regression alerts

### **Security Monitoring**
- Weekly security audits
- Dependency vulnerability alerts
- Automated security fix PRs

## 🚨 Troubleshooting

### **Common Issues:**

1. **Workflow fails on dependency install**
   ```bash
   # Solution: Clear npm cache
   npm cache clean --force
   ```

2. **GitHub Pages not deploying**
   ```bash
   # Check: Repository settings > Pages > Source = "GitHub Actions"
   ```

3. **Tests failing in CI but passing locally**
   ```bash
   # Solution: Check Node.js version compatibility
   # Update workflow to use same version as local
   ```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vitest Testing Guide](https://vitest.dev/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [GitHub Pages Guide](https://pages.github.com/)

---

**Note**: All workflows are optimized for free GitHub Actions usage. They're designed to run efficiently and provide maximum value within the free tier limits.
