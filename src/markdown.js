// Configure marked options
document.addEventListener('DOMContentLoaded', () => {
  configureMarked();
  // Initial preview update
  updatePreview();
});

// Configure marked options
function configureMarked() {
  // Create a custom renderer
  const renderer = new marked.Renderer();
  
  // Override the paragraph renderer to add word-wrapping and handle line breaks
  renderer.paragraph = function(text) {
    // Replace line breaks with <br> tags
    text = text.replace(/<br>/g, '<br>\n');
    return '<p class="markdown-paragraph">' + text + '</p>';
  };
  
  // Override the code renderer to add word-wrapping
  renderer.code = function(code, language) {
    return '<pre><code class="markdown-code">' + code + '</code></pre>';
  };
  
  // Set options for marked
  marked.setOptions({
    renderer: renderer,
    highlight: function(code, lang) {
      return code;
    },
    pedantic: false,
    gfm: true,
    breaks: true,
    sanitize: false,
    smartLists: true,
    smartypants: true,
    xhtml: false
  });
  
  // Override the lexer to handle line breaks better
  const originalLexer = marked.Lexer.prototype.lex;
  marked.Lexer.prototype.lex = function(src) {
    // Replace single newlines with <br> tags
    src = src.replace(/(?<!\n)\n(?!\n)/g, '\n<br>\n');
    return originalLexer.call(this, src);
  };
}

// Update the preview with the current editor content
function updatePreview() {
  if (!editor) return;
  
  const content = editor.getValue();
  const previewElement = document.getElementById('preview');
  
  if (previewElement) {
    // Parse markdown and update preview
    previewElement.innerHTML = marked.parse(content);
    
    // Process any code blocks for syntax highlighting
    // In a full implementation, we would add a syntax highlighter like Prism.js here
    
    // Process any math expressions
    // In a full implementation, we would add MathJax or KaTeX here
    
    // Make the preview editable
    makePreviewEditable(previewElement);
  }
}

// Make the preview editable
function makePreviewEditable(previewElement) {
  // Make the preview contenteditable
  previewElement.contentEditable = true;
  
  // Add event listener for input events
  previewElement.addEventListener('input', handlePreviewEdit);
  
  // Prevent default behavior for some keys to avoid unexpected behavior
  previewElement.addEventListener('keydown', function(e) {
    // Allow basic text editing keys
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 
      'ArrowUp', 'ArrowDown', 'Home', 'End'
    ];
    
    // If it's not an allowed key and not a character key, prevent default
    if (!allowedKeys.includes(e.key) && e.key.length > 1 && !e.ctrlKey) {
      e.preventDefault();
    }
  });
}

// Handle edits made in the preview
function handlePreviewEdit() {
  // Get the HTML content from the preview
  const previewElement = document.getElementById('preview');
  const htmlContent = previewElement.innerHTML;
  
  // Convert HTML back to markdown (this is a simplified approach)
  // In a real implementation, you would use a library like turndown.js
  // to properly convert HTML back to markdown
  const markdownContent = convertHtmlToMarkdown(htmlContent);
  
  // Update the editor with the new markdown content
  // We need to temporarily disable the editor's change event to avoid a loop
  if (editor) {
    const currentValue = editor.getValue();
    if (markdownContent !== currentValue) {
      // Temporarily disable the change event
      const changeHandler = editor.on('change', () => {});
      
      // Update the editor content
      editor.setValue(markdownContent);
      
      // Re-enable the change event
      editor.off('change', changeHandler);
      
      // Set modified flag
      setModified(true);
    }
  }
}

// Convert HTML to Markdown using TurndownJS
function convertHtmlToMarkdown(html) {
  // Create a new TurndownService instance
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    bulletListMarker: '-'
  });
  
  // Add rules for handling line breaks
  turndownService.addRule('lineBreaks', {
    filter: ['br'],
    replacement: function() {
      return '\n';
    }
  });
  
  // Convert HTML to Markdown
  return turndownService.turndown(html);
}

// Scroll the preview to match editor position (approximate)
function syncScrollPreview() {
  if (!editor) return;
  
  const editorInfo = editor.getScrollInfo();
  const previewElement = document.querySelector('.preview-container');
  
  if (previewElement) {
    const ratio = editorInfo.top / (editorInfo.height - editorInfo.clientHeight);
    const previewScroll = ratio * (previewElement.scrollHeight - previewElement.clientHeight);
    
    previewElement.scrollTop = previewScroll;
  }
}

// Export markdown to HTML
function exportToHtml() {
  if (!editor) return;
  
  const content = editor.getValue();
  const htmlContent = marked.parse(content);
  
  // In a full implementation, we would add proper HTML document structure
  const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Markdown</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    /* Add more styles from markdown-body class in styles.css */
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>
  `;
  
  return fullHtml;
}
