# Markdowner

A simple side-by-side markdown editor for macOS that allows you to edit markdown and see the preview in real-time.

## Features

- Side-by-side markdown editor and preview
- Real-time preview updates as you type
- Switch between editing markdown and editing the preview
- Native macOS app experience with Electron
- File system integration for opening and saving markdown files
- Clean, Mac-like interface
- Support for common markdown syntax:
  - Headings
  - Lists
  - Code blocks
  - Links
  - Images
  - Tables
  - Blockquotes
  - Bold and italic text
- Keyboard shortcuts:
  - Tab for indentation
  - Cmd+S for save
  - Cmd+O for open
  - Cmd+N for new file

## How to Use

1. Launch the Markdowner application
2. Write markdown in the left panel
3. See the rendered preview in the right panel
4. Use the buttons at the top to switch between:
   - **Edit Markdown**: Edit the raw markdown text
   - **Edit Preview**: Make changes directly in the preview (experimental)
5. Use the File menu to open, save, and create new markdown files

## Installation

### Running from Source

1. Clone the repository:
```
git clone https://github.com/yourusername/markdowner.git
cd markdowner
```

2. Install dependencies:
```
npm install
```

3. Run the application:
```
npm start
```

### Building the Application

To build the application as a standalone macOS app:

```
npm run package
```

This will create a packaged application in the `release-builds` directory.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Electron
- [Marked.js](https://marked.js.org/) for markdown parsing

## Limitations

- The HTML to Markdown conversion is simplified and may not handle all edge cases perfectly
- For a production app, a more robust conversion library like [Turndown.js](https://github.com/domchristie/turndown) would be recommended

## Future Improvements

- Implement syntax highlighting for code blocks
- Add dark mode support
- Improve HTML to Markdown conversion
- Add support for custom CSS in the preview
- Add auto-save functionality
- Add spell checking
