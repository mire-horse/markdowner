# Markdowner

An open-source markdown editor inspired by Typora, built with Electron.

## Features

- Real-time markdown preview
- Clean, distraction-free interface
- File operations (new, open, save, save as)
- Export to PDF functionality
- Customizable font preferences for preview and PDF export
- File directory sidebar for easy navigation
- Tab-based interface for working with multiple files
- Markdown formatting toolbar
- Keyboard shortcuts for common operations
- Cross-platform (Windows, macOS, Linux)
- Drag and drop images directly into the editor
- Edit directly in the preview window (WYSIWYG editing)
- Proper line break handling in preview
- Word-wrapping for long lines of text

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- npm (comes with Node.js)

### Installation

1. Clone the repository or download the source code
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

### Running the Application

To start the application in development mode:

```bash
npm start
```

## Keyboard Shortcuts

- **Ctrl+N**: New document
- **Ctrl+O**: Open file
- **Ctrl+Shift+O**: Open folder
- **Ctrl+S**: Save
- **Ctrl+Shift+S**: Save as
- **Ctrl+E**: Export to PDF
- **Ctrl+Shift+E**: Export to HTML
- **Ctrl+,**: Preferences
- **Ctrl+B**: Bold
- **Ctrl+I**: Italic
- **Ctrl+H**: Heading
- **Ctrl+L**: Link

## Building for Production

To build the application for all platforms:

```bash
npm run build
```

To build for specific platforms:

```bash
# macOS
npm run build:mac

# Windows
npm run build:win

# Linux
npm run build:linux
```

The packaged applications will be available in the `dist` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by [Typora](https://typora.io/)
- Built with [Electron](https://www.electronjs.org/)
- Markdown parsing by [Marked](https://marked.js.org/)
- Editor component by [CodeMirror](https://codemirror.net/)
