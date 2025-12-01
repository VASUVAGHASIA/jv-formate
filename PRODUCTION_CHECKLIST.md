# 🚀 Production Deployment Checklist

This checklist ensures your Word AI Assistant Add-in is production-ready.

## Pre-Deployment Checklist

### 🔐 Security & Authentication

- [ ] **OAuth Configuration**
  - [ ] Production Client ID configured in `.env`
  - [ ] OAuth consent screen verified and published
  - [ ] Authorized domains added for production URLs
  - [ ] Scopes properly configured (`generative-language`)
  - [ ] Desktop app type used for OAuth credentials

- [ ] **Environment Variables**
  - [ ] Production `.env` file created (separate from development)
  - [ ] All sensitive data in environment variables (not hardcoded)
  - [ ] `.env` file NOT committed to version control
  - [ ] `.gitignore` includes `.env`, `*.key`, `*.crt`, `*.pem`

- [ ] **SSL/TLS**
  - [ ] Valid SSL certificate obtained (not self-signed)
  - [ ] Certificate from trusted CA (Let's Encrypt, Digicert, etc.)
  - [ ] Certificate covers your domain
  - [ ] Auto-renewal configured for certificate

### 📦 Build & Bundle

- [ ] **Production Build**
  - [ ] Run `npm run build` successfully
  - [ ] No build errors or warnings
  - [ ] Bundle size optimized
  - [ ] Source maps generated (for debugging)
  - [ ] Output in `dist/` folder verified

- [ ] **Code Quality**
  - [ ] All TypeScript errors resolved
  - [ ] ESLint warnings fixed
  - [ ] No console.log statements in production code
  - [ ] Error boundaries implemented
  - [ ] Loading states for all async operations

### 📝 Manifest Configuration

- [ ] **Update manifest.xml**
  - [ ] Change all URLs from `localhost:3000` to production domain
  - [ ] Update `<Id>` with production GUID
  - [ ] Verify `<Version>` is correct
  - [ ] Update `<ProviderName>` with your organization
  - [ ] Update `<DisplayName>` and `<Description>`
  - [ ] Add production icon URLs
  - [ ] Update `<SupportUrl>` to your support page
  - [ ] Verify all `<AppDomain>` entries

Example production URLs:
```xml
<SourceLocation DefaultValue="https://your-domain.com/taskpane.html"/>
<bt:Url id="Commands.Url" DefaultValue="https://your-domain.com/commands.html"/>
<bt:Url id="Taskpane.Url" DefaultValue="https://your-domain.com/taskpane.html"/>
```

### 🌐 Hosting & Deployment

- [ ] **Web Server Setup**
  - [ ] HTTPS enabled and enforced
  - [ ] HTTP to HTTPS redirect configured
  - [ ] CORS headers configured (if needed)
  - [ ] Compression enabled (gzip/brotli)
  - [ ] Caching headers set appropriately
  - [ ] CDN configured (optional but recommended)

- [ ] **Domain & DNS**
  - [ ] Production domain configured
  - [ ] DNS records pointing to server
  - [ ] SSL certificate matches domain
  - [ ] WWW and non-WWW redirects configured

- [ ] **Deployment Process**
  - [ ] CI/CD pipeline configured (optional)
  - [ ] Backup strategy in place
  - [ ] Rollback plan documented
  - [ ] Version tagging in git

### 🧪 Testing

- [ ] **Functionality Testing**
  - [ ] Test on Word Desktop (Windows)
  - [ ] Test on Word Desktop (Mac) - if supporting
  - [ ] Test on Word Online
  - [ ] Test all tabs (Ask, Agent, Format)
  - [ ] Test all context menu commands
  - [ ] Test OAuth login flow
  - [ ] Test Gemini API integration
  - [ ] Test document formatting features
  - [ ] Test error handling

- [ ] **Browser Compatibility**
  - [ ] Chrome/Edge (latest)
  - [ ] Firefox (latest)
  - [ ] Safari (latest) - if supporting Mac

- [ ] **Performance Testing**
  - [ ] Large documents (100+ pages)
  - [ ] Multiple simultaneous users
  - [ ] API rate limit handling
  - [ ] Network error handling
  - [ ] Slow connection simulation

### 📊 Monitoring & Analytics

- [ ] **Error Tracking**
  - [ ] Error logging service configured (Sentry, LogRocket, etc.)
  - [ ] Client-side errors captured
  - [ ] API errors logged
  - [ ] User feedback mechanism

- [ ] **Analytics** (Optional)
  - [ ] Usage analytics configured
  - [ ] Feature usage tracking
  - [ ] Performance metrics

### 📄 Documentation

- [ ] **User Documentation**
  - [ ] Installation guide
  - [ ] User manual
  - [ ] FAQ document
  - [ ] Video tutorials (optional)
  - [ ] Support contact information

- [ ] **Technical Documentation**
  - [ ] API documentation
  - [ ] Deployment guide
  - [ ] Troubleshooting guide
  - [ ] Architecture diagram
  - [ ] Change log

### 🔒 Compliance & Legal

- [ ] **Privacy & Data**
  - [ ] Privacy policy published
  - [ ] Terms of service published
  - [ ] GDPR compliance (if applicable)
  - [ ] Data retention policy
  - [ ] User consent mechanisms

- [ ] **API Terms**
  - [ ] Google Cloud terms accepted
  - [ ] Gemini API terms reviewed
  - [ ] Rate limits understood
  - [ ] Billing configured

### 🎯 Office Store Submission (Optional)

If publishing to Microsoft AppSource:

- [ ] **Submission Requirements**
  - [ ] Add-in tested with Office Validation Tool
  - [ ] Privacy policy URL provided
  - [ ] Terms of use URL provided
  - [ ] Support URL provided
  - [ ] Screenshots prepared (1280x800 minimum)
  - [ ] Video demo (optional)
  - [ ] App description (up to 4000 characters)
  - [ ] Search keywords defined
  - [ ] Age rating assigned

- [ ] **Branding**
  - [ ] Professional icons (16x16, 32x32, 64x64, 80x80)
  - [ ] App logo (96x96 minimum)
  - [ ] Consistent branding across assets

---

## Deployment Steps

### 1. Prepare Production Build

```powershell
# Clean previous builds
Remove-Item dist -Recurse -Force -ErrorAction SilentlyContinue

# Build for production
npm run build

# Verify build output
Test-Path dist/taskpane/taskpane.html
Test-Path dist/commands/commands.html
```

### 2. Update Manifest

```powershell
# Create production manifest
Copy-Item manifest.xml manifest-prod.xml

# Update URLs in manifest-prod.xml
# Replace https://localhost:3000 with your production URL
```

### 3. Upload to Server

```powershell
# Example using SCP (adjust for your hosting)
scp -r dist/* user@your-server.com:/var/www/html/

# Or use FTP, rsync, or your hosting provider's tools
```

### 4. Configure Web Server

**Example Nginx configuration**:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    root /var/www/html;
    index taskpane.html;
    
    # Enable gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 5. Test Production Deployment

```powershell
# Test URLs
curl https://your-domain.com/taskpane.html
curl https://your-domain.com/commands.html

# Validate SSL
openssl s_client -connect your-domain.com:443

# Test add-in in Word
# Upload manifest-prod.xml to Word
```

### 6. Monitor & Maintain

- Check error logs daily (first week)
- Monitor API usage and quotas
- Review user feedback
- Plan regular updates
- Keep dependencies updated

---

## Post-Deployment

### Immediate (Day 1)

- [ ] Verify add-in loads in Word
- [ ] Test complete user flow
- [ ] Monitor error logs
- [ ] Check SSL certificate
- [ ] Verify OAuth flow works

### Short-term (Week 1)

- [ ] Gather user feedback
- [ ] Monitor performance metrics
- [ ] Check API quota usage
- [ ] Review error reports
- [ ] Update documentation based on feedback

### Long-term (Monthly)

- [ ] Security updates
- [ ] Dependency updates
- [ ] Feature improvements
- [ ] Performance optimization
- [ ] User satisfaction survey

---

## Rollback Plan

If issues arise:

1. **Immediate Rollback**:
   ```powershell
   # Restore previous version
   scp -r backup/* user@your-server.com:/var/www/html/
   ```

2. **Manifest Rollback**:
   - Revert manifest.xml to previous version
   - Redistribute to users

3. **Communication**:
   - Notify users of issues
   - Provide timeline for fix
   - Update status page

---

## Support & Maintenance

### User Support

- Support email: support@your-domain.com
- Response time: 24-48 hours
- Documentation: https://your-domain.com/docs
- Known issues: https://your-domain.com/issues

### Maintenance Windows

- Schedule regular maintenance
- Notify users in advance
- Keep downtime minimal
- Test updates in staging first

---

## Version Control

Use semantic versioning:

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes

Example: `1.2.3`

Update version in:
- `package.json`
- `manifest.xml`
- `README.md`
- Release notes

---

## Additional Resources

- [Office Add-ins Validation](https://docs.microsoft.com/en-us/office/dev/add-ins/testing/troubleshoot-manifest)
- [AppSource Submission Guide](https://docs.microsoft.com/en-us/office/dev/store/submit-to-appsource-via-partner-center)
- [Office Add-ins Best Practices](https://docs.microsoft.com/en-us/office/dev/add-ins/concepts/best-practices)

---

**Production Status**: ⬜ Not Ready | 🟨 In Progress | ✅ Ready

Update this checklist as you complete each item!
