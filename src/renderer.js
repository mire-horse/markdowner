// Import required electron modules
const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

// Variables to track file state
let currentFilePath = null;
let isDocumentModified = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupIpcEvents();
  setupEditorEvents();
});

// Set up IPC event listeners
function setupIpcEvents() {
  // Handle file-new event from main process
  ipcRenderer.on('file-new', () => {
    newDocument();
  });

  // Handle file-save event from main process
  ipcRenderer.on('file-save', () => {
    saveFile();
  });

  // Handle file-save-as event from main process
  ipcRenderer.on('file-save-as', () => {
    saveFileAs();
  });

  // Handle file-opened event from main process
  ipcRenderer.on('file-opened', (event, { filePath, content }) => {
    openFile(filePath, content);
  });

  // Handle file-saved event from main process
  ipcRenderer.on('file-saved', (event, { filePath }) => {
    setCurrentFile(filePath);
    setModified(false);
  });
}

// Set up editor events
function setupEditorEvents() {
  // Add keyboard shortcuts for common operations
  document.addEventListener('keydown', (event) => {
    // Ctrl+S: Save
    if (event.ctrlKey && event.key === 's' && !event.shiftKey) {
      event.preventDefault();
      saveFile();
    }
    
    // Ctrl+Shift+S: Save As
    if (event.ctrlKey && event.key === 'S' && event.shiftKey) {
      event.preventDefault();
      saveFileAs();
    }
    
    // Ctrl+N: New Document
    if (event.ctrlKey && event.key === 'n') {
      event.preventDefault();
      newDocument();
    }
  });
}

// Create a new document
function newDocument() {
  if (isDocumentModified) {
    // In a real app, we would prompt to save changes
    console.log('Document has unsaved changes');
  }
  
  const content = '# New Document\n\nStart typing your markdown here...';
  setEditorContent(content);
  setCurrentFile(null);
  setModified(false);
}

// Open a file
function openFile(filePath, content) {
  setEditorContent(content);
  setCurrentFile(filePath);
  setModified(false);
}

// Save the current file
function saveFile() {
  const content = getEditorContent();
  
  ipcRenderer.send('save-file-dialog', {
    content,
    currentFilePath
  });
}

// Save the current file as a new file
function saveFileAs() {
  const content = getEditorContent();
  
  ipcRenderer.send('save-file-dialog', {
    content,
    currentFilePath: null
  });
}

// Set current file path and update UI
function setCurrentFile(filePath) {
  currentFilePath = filePath;
  
  const currentFileElement = document.getElementById('current-file');
  if (currentFileElement) {
    if (filePath) {
      // Extract filename from path
      const fileName = filePath.split('/').pop();
      currentFileElement.textContent = fileName;
      document.title = `${fileName} - Markdowner`;
    } else {
      currentFileElement.textContent = 'Untitled';
      document.title = 'Untitled - Markdowner';
    }
  }
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

// Get editor content (defined in editor.js)
function getEditorContent() {
  if (typeof window.getEditorContent === 'function') {
    return window.getEditorContent();
  }
  return '';
}

// Set editor content (defined in editor.js)
function setEditorContent(content) {
  if (typeof window.setEditorContent === 'function') {
    window.setEditorContent(content);
  }
}

// Sync scroll between editor and preview
document.querySelector('.editor-container').addEventListener('scroll', () => {
  if (typeof window.syncScrollPreview === 'function') {
    window.syncScrollPreview();
  }
});
