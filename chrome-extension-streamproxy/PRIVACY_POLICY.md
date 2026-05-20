# Privacy Policy

**StreamProxy Quick Add Chrome Extension**

**Last Updated: May 20, 2026**

---

## Overview

StreamProxy Quick Add ("the Extension") is committed to protecting your privacy. This Privacy Policy explains how the Extension handles your information and what data practices are employed.

## What Information We Collect

The Extension only collects and stores information that you explicitly provide:

### User-Provided Data
- **StreamProxy Base URL**: The address of your StreamProxy instance
- **Authentication Credentials**: Username and password (if Basic Auth is enabled)
- **Stream Information**: Details you enter in the form (stream URL, name, description, channel number, metadata)

### Data Automatically Captured
- **Current Tab URL**: Automatically extracted from the browser tab where you activate the Extension
- **Current Tab Title**: Used to generate a suggested streamserver name
- **Timestamp**: Appended to auto-generated streamserver names

## How We Use Information

The Extension uses collected information exclusively for:

1. **Configuration Storage**: Saving your StreamProxy connection details locally in your browser
2. **Stream Server Creation**: Sending stream details to your StreamProxy instance via the `/api/streamserver` endpoint
3. **User Interface Population**: Pre-filling forms with current tab information for convenience

## Data Storage

All data is stored locally on your device:

- Configuration (URL, username, password) is saved in Chrome's `chrome.storage.sync` API
- Data is encrypted using Chrome's built-in security mechanisms
- No information is transmitted to external servers except your specified StreamProxy instance
- No data is backed up to cloud services

## Data Transmission

The Extension only communicates with:

1. **Your StreamProxy Instance**: The URL you configure in Extension settings
2. **Current Browser Tab**: To extract URL and title information

**Important**: All communication with StreamProxy is direct and occurs only to the endpoint you specify. No third-party services, analytics platforms, or external servers receive your data.

## Data Deletion

You can delete all Extension data at any time:

1. Open Chrome Settings → Extensions → StreamProxy Quick Add
2. Click "Remove" to uninstall the Extension
3. All stored data will be automatically deleted

To manually clear only your StreamProxy configuration:
1. Right-click the Extension icon
2. Click "Options"
3. Clear the fields and save (or uninstall the Extension)

## Third-Party Services

This Extension does **NOT**:

- Use analytics services
- Include tracking pixels or tags
- Employ advertising networks
- Share data with third parties
- Collect usage statistics
- Send crash reports
- Use remote logging

## Security

Your credentials and configuration are protected by:

- Chrome's encrypted storage system (`chrome.storage.sync`)
- Local-only processing (no cloud synchronization)
- HTTPS recommendations for your StreamProxy instance
- No caching of sensitive data in browser history or cookies

## Children's Privacy

This Extension is not intended for use by children under 13. We do not knowingly collect information from children. If you believe a child under 13 has provided information through this Extension, please contact us immediately.

## Changes to This Policy

We may update this Privacy Policy from time to time. Changes will be reflected with an updated "Last Updated" date. Continued use of the Extension following any modifications constitutes your acceptance of the new Privacy Policy.

## Your Consent

By using the StreamProxy Quick Add Extension, you consent to this Privacy Policy.

## Contact & Support

For privacy concerns or questions about this policy:

- Visit the Extension's GitHub repository
- Review the Extension documentation
- Refer to the README included with the Extension

## Disclaimer

This Extension is provided "as is" without warranty. Users are solely responsible for:

- Configuring accurate StreamProxy URLs
- Maintaining the security of their StreamProxy instance
- Protecting their authentication credentials
- Complying with applicable laws and terms of service for streaming content

---

## Summary

**StreamProxy Quick Add is a privacy-respecting Extension:**

✓ All data stays on your device  
✓ No tracking or analytics  
✓ No third-party data sharing  
✓ You control what information is stored  
✓ Direct communication only to your StreamProxy instance  
✓ Encrypted local storage  

Your privacy is our priority.
