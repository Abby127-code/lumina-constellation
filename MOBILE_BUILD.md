# Lumina Constellation — Mobile App Build Guide

## Capacitor (Android + iOS)

### Prerequisites
```bash
# Install Capacitor CLI
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios

# Initialize (already configured in capacitor.config.json)
npx cap init
```

### Build Web Assets
```bash
# Generate static export
next build  # with output: 'export' in next.config.ts

# Copy to native projects
npx cap copy android
npx cap copy ios
```

### Android
```bash
# Add Android platform (first time only)
npx cap add android

# Open in Android Studio
npx cap open android

# In Android Studio:
# 1. Build → Generate Signed Bundle / APK
# 2. Upload to Google Play Console
# 3. Fill store listing (screenshots, description, privacy policy URL)
```

### iOS
```bash
# Add iOS platform (first time only, requires macOS)
npx cap add ios

# Open in Xcode
npx cap open ios

# In Xcode:
# 1. Set signing team (Apple Developer account needed)
# 2. Product → Archive
# 3. Upload to App Store Connect
# 4. Submit for review
```

### Per-Product Standalone Apps (Optional)
To create 7 separate apps (one per product), create 7 capacitor configs:
```bash
# Example: Lumina Spiritual standalone app
npx cap init "Lumina Spiritual" "com.lumina.spiritual" --web-dir=out
npx cap add android
npx cap add ios
```

### App Store Requirements Checklist

#### Google Play
- [ ] App bundle (.aab) signed
- [ ] Privacy policy URL (https://yoursite.com/privacy)
- [ ] Data safety form filled
- [ ] Target audience & content rating
- [ ] Screenshots (phone + tablet)
- [ ] Feature graphic (1024x500)
- [ ] App description (max 80 chars short, 4000 chars full)

#### Apple App Store
- [ ] App archive signed with distribution certificate
- [ ] Privacy policy URL
- [ ] App Tracking Transparency (if tracking used)
- [ ] Screenshots (6.7" + 5.5" + iPad)
- [ ] App description
- [ ] Support URL
- [ ] Copyright notice

### Compliance Checklist (Both Stores)

1. **Privacy Policy** — ✅ Available at `/privacy`
2. **Terms of Service** — ✅ Available at `/terms`
3. **Disclaimer** — ✅ Available at `/disclaimer` (entertainment only, not medical advice)
4. **Data Safety** — Declare what data is collected
5. **Content Rating** — Spiritual content: "Everyone" (no mature content)
6. **In-App Purchase** — LianLian payment integration (declare in store listing)
7. **Cookie Policy** — ✅ Available at `/cookie-policy`
