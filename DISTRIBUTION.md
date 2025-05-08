# Building and Distributing Markdowner

This guide explains how to build Markdowner as a standalone application that can be distributed to users.

## Prerequisites

Before building the application, make sure you have:

1. Node.js installed (v14 or later)
2. All dependencies installed (`npm install`)

## Building the Application

### Step 1: Create an Icon

For a proper application, you need an icon. Create a PNG file at `src/assets/icon.png` (at least 512x512 pixels).

### Step 2: Build the Application

To build the application for your current platform:

```bash
npm run build
```

This will create distributable files in the `dist` directory.

### Platform-Specific Builds

If you want to build for a specific platform:

```bash
# For macOS
npm run build:mac

# For Windows
npm run build:win

# For Linux
npm run build:linux
```

## Distribution Files

After building, you'll find the following in the `dist` directory:

### macOS
- `.dmg` file - A disk image that users can mount to install the app
- `.zip` file - A compressed version of the app

### Windows
- `.exe` installer - An installer that users can run to install the app
- `.exe` portable - A portable version that can run without installation

### Linux
- `.AppImage` - A portable package that runs on most Linux distributions
- `.deb` - For Debian-based distributions (Ubuntu, etc.)
- `.rpm` - For Red Hat-based distributions (Fedora, etc.)

## Distributing Your App

1. **Website**: Upload the distribution files to your website for download
2. **GitHub Releases**: Create a release on GitHub and attach the distribution files
3. **App Stores**: For more official distribution, you can submit to:
   - Mac App Store (requires Apple Developer account)
   - Microsoft Store (requires Microsoft Developer account)
   - Linux app stores (Snap Store, Flathub, etc.)

## Code Signing

For production applications, you should sign your code:

- **macOS**: Requires an Apple Developer account and certificate
- **Windows**: Requires a code signing certificate from a Certificate Authority
- **Linux**: Varies by distribution

To enable code signing, add the appropriate configuration to the `build` section in `package.json`.

## Automatic Updates

For automatic updates, consider using:
- [electron-updater](https://www.npmjs.com/package/electron-updater)

Add it to your project with:
```bash
npm install electron-updater
```

Then configure it in your main process code.
