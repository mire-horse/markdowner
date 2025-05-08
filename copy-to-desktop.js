const fs = require('fs-extra');
const path = require('path');
const os = require('os');

// Get the desktop path
const desktopPath = path.join(os.homedir(), 'Desktop');

// Create the app directory on the desktop
const appName = 'Markdowner';
const appPath = path.join(desktopPath, appName);

// Ensure the directory exists
fs.ensureDirSync(appPath);

// Copy all necessary files
const filesToCopy = [
  'main.js',
  'package.json',
  'src'
];

filesToCopy.forEach(file => {
  const sourcePath = path.join(__dirname, file);
  const destPath = path.join(appPath, file);
  
  if (fs.existsSync(sourcePath)) {
    if (fs.statSync(sourcePath).isDirectory()) {
      fs.copySync(sourcePath, destPath);
      console.log(`Copied directory: ${file}`);
    } else {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied file: ${file}`);
    }
  }
});

// Create a package.json in the app directory
const packageJson = {
  name: "markdowner",
  version: "1.0.0",
  main: "main.js",
  scripts: {
    "start": "electron ."
  },
  dependencies: {
    "codemirror": "^5.65.15",
    "electron": "^36.1.0",
    "electron-pdf": "^25.0.0",
    "electron-store": "^10.0.1",
    "marked": "^15.0.11",
    "turndown": "^7.1.2"
  }
};

fs.writeFileSync(
  path.join(appPath, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

// Create a simple start script
const startScript = `#!/bin/bash
cd "$(dirname "$0")"
npm install
npm start
`;

fs.writeFileSync(path.join(appPath, 'start.sh'), startScript);
fs.chmodSync(path.join(appPath, 'start.sh'), '755');

// Create a README
const readme = `# Markdowner

To start the application:

1. Double-click the 'start.sh' file
2. If it doesn't work, open Terminal and run:
   \`\`\`
   cd "${appPath.replace(/\\/g, '/')}"
   ./start.sh
   \`\`\`

This will install the necessary dependencies and start the application.
`;

fs.writeFileSync(path.join(appPath, 'README.txt'), readme);

console.log(`\nMarkdowner has been copied to your Desktop at: ${appPath}`);
console.log('To start the application, run the start.sh script in that directory.');
