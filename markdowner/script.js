// Global variables
let currentFilePath = null;
let isDocumentModified = false;

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const markdownEditor = document.getElementById('markdown-editor');
    const preview = document.getElementById('preview');
    const editModeBtn = document.getElementById('edit-mode');
    const previewModeBtn = document.getElementById('preview-mode');
    const editorContainer = document.getElementById('editor-container');
    const previewContainer = document.getElementById('preview-container');
    
    // Set up Electron IPC listeners if running in Electron
    setupElectronListeners();

    // Initialize with some sample markdown
    const sampleMarkdown = `# Welcome to Markdowner

## A simple side-by-side markdown editor

This is a simple markdown editor where you can:

- Write markdown on the left side
- See the preview on the right side
- Switch between editing markdown and editing the preview

### Basic Markdown Examples

**Bold text** and *italic text*

\`\`\`javascript
// Code block example
function helloWorld() {
    console.log("Hello, world!");
}
\`\`\`

> This is a blockquote

[Link example](https://example.com)

![Image placeholder](https://via.placeholder.com/150)

#### Table Example

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`;

    markdownEditor.value = sampleMarkdown;

    // Function to convert markdown to HTML
    function renderMarkdown() {
        const markdownText = markdownEditor.value;
        preview.innerHTML = marked.parse(markdownText);
    }

    // Function to convert HTML to markdown (simplified version)
    function htmlToMarkdown() {
        // This is a simplified conversion and won't handle all cases perfectly
        // For a production app, you'd want to use a library like turndown.js
        const html = preview.innerHTML;
        markdownEditor.value = html
            .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
            .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
            .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
            .replace(/<h4>(.*?)<\/h4>/g, '#### $1\n\n')
            .replace(/<h5>(.*?)<\/h5>/g, '##### $1\n\n')
            .replace(/<h6>(.*?)<\/h6>/g, '###### $1\n\n')
            .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
            .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
            .replace(/<em>(.*?)<\/em>/g, '*$1*')
            .replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)')
            .replace(/<code>(.*?)<\/code>/g, '`$1`')
            .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, '```\n$1\n```\n\n')
            .replace(/<blockquote>([\s\S]*?)<\/blockquote>/g, '> $1\n\n')
            .replace(/<ul>([\s\S]*?)<\/ul>/g, '$1\n')
            .replace(/<ol>([\s\S]*?)<\/ol>/g, '$1\n')
            .replace(/<li>(.*?)<\/li>/g, '- $1\n')
            .replace(/<br>/g, '\n')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');
    }

    // Initial render
    renderMarkdown();

    // Update preview as user types in the markdown editor
    markdownEditor.addEventListener('input', renderMarkdown);

    // Toggle between edit and preview modes
    editModeBtn.addEventListener('click', () => {
        if (!editModeBtn.classList.contains('active')) {
            // Switch to edit mode
            editModeBtn.classList.add('active');
            previewModeBtn.classList.remove('active');
            
            // Make preview not editable
            preview.contentEditable = false;
            preview.classList.remove('editable');
            
            // Convert any changes from preview back to markdown
            htmlToMarkdown();
            
            // Re-render markdown to ensure consistency
            renderMarkdown();
        }
    });

    previewModeBtn.addEventListener('click', () => {
        if (!previewModeBtn.classList.contains('active')) {
            // Switch to preview mode
            previewModeBtn.classList.add('active');
            editModeBtn.classList.remove('active');
            
            // Make preview editable
            preview.contentEditable = true;
            preview.classList.add('editable');
        }
    });

    // Handle changes in the preview when in edit preview mode
    preview.addEventListener('blur', () => {
        if (previewModeBtn.classList.contains('active')) {
            // Convert edited HTML back to markdown
            htmlToMarkdown();
        }
    });

    // Prevent tab key from moving focus out of the editor
    markdownEditor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            
            // Insert tab at cursor position
            const start = markdownEditor.selectionStart;
            const end = markdownEditor.selectionEnd;
            
            markdownEditor.value = markdownEditor.value.substring(0, start) + 
                                  '    ' + 
                                  markdownEditor.value.substring(end);
            
            // Move cursor after the inserted tab
            markdownEditor.selectionStart = markdownEditor.selectionEnd = start + 4;
            
            // Update preview
            renderMarkdown();
        }
    });

    // Mark document as modified when content changes
    markdownEditor.addEventListener('input', () => {
        isDocumentModified = true;
        renderMarkdown();
    });

    // Save with Ctrl+S / Cmd+S (for web version)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            
            // If running in Electron, use the Electron save functionality
            if (window.api) {
                saveMarkdownContent();
            } else {
                // For web version, show an alert
                alert('Markdown content saved! (Demo only)');
            }
        }
    });

    // Setup Electron IPC listeners
    function setupElectronListeners() {
        // Check if running in Electron
        if (window.api) {
            // Listen for new file command
            window.api.receive('new-file', () => {
                if (isDocumentModified) {
                    if (confirm('You have unsaved changes. Do you want to create a new file anyway?')) {
                        createNewFile();
                    }
                } else {
                    createNewFile();
                }
            });

            // Listen for save file command
            window.api.receive('save-file', () => {
                saveMarkdownContent();
            });

            // Listen for save file as command
            window.api.receive('save-file-as', () => {
                saveMarkdownContentAs();
            });

            // Listen for file opened event
            window.api.receive('file-opened', (data) => {
                currentFilePath = data.filePath;
                markdownEditor.value = data.content;
                renderMarkdown();
                isDocumentModified = false;
            });

            // Listen for file saved event
            window.api.receive('file-saved', (filePath) => {
                currentFilePath = filePath;
                isDocumentModified = false;
            });
        }
    }

    // Create a new file
    function createNewFile() {
        currentFilePath = null;
        markdownEditor.value = '';
        renderMarkdown();
        isDocumentModified = false;
    }

    // Save markdown content
    function saveMarkdownContent() {
        if (window.api) {
            if (currentFilePath) {
                // If we already have a file path, use it
                window.api.send('save-file-dialog', markdownEditor.value);
            } else {
                // Otherwise, show the save dialog
                saveMarkdownContentAs();
            }
        }
    }

    // Save markdown content as a new file
    function saveMarkdownContentAs() {
        if (window.api) {
            window.api.send('save-file-dialog', markdownEditor.value);
        }
    }
});
