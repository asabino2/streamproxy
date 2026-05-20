# Chrome Extension - StreamProxy Quick Add

This extension adds the current tab URL as a StreamServer in StreamProxy.

## What it does

- Opens a popup when you click the extension icon.
- Automatically fills the stream URL and suggests a streamserver name based on the current tab.
- Requests additional information: description, channel number, method, and advanced fields.
- Sends data to the StreamProxy endpoint `POST /api/streamserver`.

## Configuration

1. Open the extension options page.
2. Enter the StreamProxy base URL (example: `http://127.0.0.1:3000`).
3. Optionally provide username and password for Basic Auth.
4. Save.

## Load in Chrome

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the `chrome-extension-streamproxy` folder.

## Usage flow

1. Open the stream page you want to register.
2. Click the extension icon.
3. Review and fill popup fields.
4. Click Add streamserver.

## StreamProxy permission note

The API requires authentication when StreamProxy Basic Auth is enabled.
Use a user account with permission for `POST /api/streamserver` (typically an administrator profile).
