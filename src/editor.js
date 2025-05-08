// Initialize CodeMirror editor
let editor;
let isDocumentModified = false;

// Initialize the editor when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initEditor();
  setupEditorEvents();
  setupDragAndDrop();
});

// Initialize CodeMirror editor
function initEditor() {
  editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
    mode: 'markdown',
    theme: 'github',
    lineNumbers: true,
    lineWrapping: true,
    styleActiveLine: true,
    extraKeys: {
      'Enter': 'newlineAndIndentContinueMarkdownList',
      'Ctrl-B': () => insertFormatting('**', '**'),
      'Ctrl-I': () => insertFormatting('*', '*'),
      'Ctrl-H': insertHeading,
      'Ctrl-L': () => insertFormatting('[', '](url)')
    }
  });

  // Set initial content
  editor.setValue('# Welcome to Markdowner\n\nStart typing your markdown here...');
  
  // Initial preview update
  updatePreview();
}

// Set up editor events
function setupEditorEvents() {
  // Update preview on change
  editor.on('change', () => {
    updatePreview();
    setModified(true);
  });

  // Set up toolbar buttons
  document.getElementById('btn-bold').addEventListener('click', () => insertFormatting('**', '**'));
  document.getElementById('btn-italic').addEventListener('click', () => insertFormatting('*', '*'));
  document.getElementById('btn-heading').addEventListener('click', insertHeading);
  document.getElementById('btn-link').addEventListener('click', () => insertFormatting('[', '](url)'));
  document.getElementById('btn-image').addEventListener('click', () => insertFormatting('![alt text](', ')'));
  document.getElementById('btn-code').addEventListener('click', () => insertFormatting('```\n', '\n```'));
  document.getElementById('btn-list').addEventListener('click', () => insertList());
  document.getElementById('btn-quote').addEventListener('click', () => insertFormatting('> ', ''));
}

// Insert formatting around selected text or at cursor position
function insertFormatting(prefix, suffix) {
  const selection = editor.getSelection();
  
  if (selection.length > 0) {
    editor.replaceSelection(prefix + selection + suffix);
  } else {
    const cursor = editor.getCursor();
    editor.replaceRange(prefix + suffix, cursor);
    editor.setCursor({
      line: cursor.line,
      ch: cursor.ch + prefix.length
    });
  }
  
  editor.focus();
}

// Insert heading based on current line
function insertHeading() {
  const cursor = editor.getCursor();
  const line = editor.getLine(cursor.line);
  const headingMatch = line.match(/^(#{1,6})\s/);
  
  if (headingMatch) {
    // Increase heading level or remove if already at h6
    const level = headingMatch[1].length;
    if (level < 6) {
      editor.replaceRange('#', { line: cursor.line, ch: 0 }, { line: cursor.line, ch: level });
    } else {
      editor.replaceRange('', { line: cursor.line, ch: 0 }, { line: cursor.line, ch: 7 });
    }
  } else {
    // Add h1 if no heading exists
    editor.replaceRange('# ', { line: cursor.line, ch: 0 });
  }
  
  editor.focus();
}

// Insert a list item
function insertList() {
  const cursor = editor.getCursor();
  editor.replaceRange('- ', { line: cursor.line, ch: 0 });
  editor.setCursor({ line: cursor.line, ch: 2 });
  editor.focus();
}

// Get editor content
function getEditorContent() {
  return editor.getValue();
}

// Set editor content
function setEditorContent(content) {
  editor.setValue(content);
  updatePreview();
}

// Set document modified state
function setModified(modified) {
  isDocumentModified = modified;
  const indicator = document.getElementById('modified-indicator');
  
  if (indicator) {
    if (modified) {
      indicator.classList.remove('hidden');
    } else {
      indicator.classList.add('hidden');
    }
  }
}

// Update the preview with the current editor content
function updatePreview() {
  if (!editor) return;
  
  const content = editor.getValue();
  const previewElement = document.getElementById('preview');
  
  if (previewElement) {
    // Parse markdown and update preview
    previewElement.innerHTML = marked.parse(content);
  }
}

// Sync scroll between editor and preview
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

// Set up drag and drop for images
function setupDragAndDrop() {
  const editorElement = document.querySelector('.CodeMirror');
  
  if (!editorElement) return;
  
  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    editorElement.addEventListener(eventName, e => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });
  
  // Highlight drop area when item is dragged over it
  ['dragenter', 'dragover'].forEach(eventName => {
    editorElement.addEventListener(eventName, () => {
      editorElement.classList.add('drag-active');
    }, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    editorElement.addEventListener(eventName, () => {
      editorElement.classList.remove('drag-active');
    }, false);
  });
  
  // Handle dropped files
  editorElement.addEventListener('drop', e => {
    const files = e.dataTransfer.files;
    
    if (files.length === 0) return;
    
    // Process each dropped file
    Array.from(files).forEach(file => {
      // Check if the file is an image
      if (file.type.startsWith('image/')) {
        handleImageDrop(file);
      }
    });
  }, false);
}

// Handle dropped image files
function handleImageDrop(file) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const imageData = e.target.result;
    
    // Insert the image at the cursor position
    const cursor = editor.getCursor();
    const imageMarkdown = `![${file.name}](${imageData})`;
    editor.replaceRange(imageMarkdown, cursor);
    
    // Update preview
    updatePreview();
    setModified(true);
  };
  
  reader.readAsDataURL(file);
}

// Export editor functions to make them available globally
window.getEditorContent = getEditorContent;
window.setEditorContent = setEditorContent;
window.setModified = setModified;
window.syncScrollPreview = syncScrollPreview;
