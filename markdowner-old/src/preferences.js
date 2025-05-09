// Preferences management for Markdowner

// Default preferences
const defaultPreferences = {
  font: {
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    size: '16px'
  },
  theme: 'light'
};

// Current preferences
let currentPreferences = JSON.parse(JSON.stringify(defaultPreferences));

// Available font options
const availableFonts = [
  { name: 'System Default', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { name: 'Courier New', value: '"Courier New", Courier, monospace' },
  { name: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { name: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
  { name: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
  { name: 'Palatino', value: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }
];

// Available font sizes
const availableSizes = [
  { name: 'Small', value: '14px' },
  { name: 'Medium', value: '16px' },
  { name: 'Large', value: '18px' },
  { name: 'X-Large', value: '20px' }
];

// Initialize preferences
function initPreferences() {
  // Load preferences from localStorage
  const savedPreferences = localStorage.getItem('markdowner-preferences');
  
  if (savedPreferences) {
    try {
      const parsedPreferences = JSON.parse(savedPreferences);
      currentPreferences = parsedPreferences;
    } catch (e) {
      console.error('Error parsing saved preferences:', e);
      // Use defaults if there's an error
      currentPreferences = JSON.parse(JSON.stringify(defaultPreferences));
    }
  }
  
  // Apply preferences
  applyPreferences();
  
  // Listen for show preferences event from main process
  const { ipcRenderer } = require('electron');
  ipcRenderer.on('show-preferences', () => {
    showPreferencesDialog();
  });
  
  // Add keyboard shortcut for preferences
  document.addEventListener('keydown', (event) => {
    // Ctrl+, (comma): Preferences
    if (event.ctrlKey && event.key === ',') {
      event.preventDefault();
      showPreferencesDialog();
    }
  });
}

// Apply current preferences to the UI
function applyPreferences() {
  // Apply font to preview
  const previewElement = document.getElementById('preview');
  if (previewElement) {
    previewElement.style.fontFamily = currentPreferences.font.family;
    previewElement.style.fontSize = currentPreferences.font.size;
  }
  
  // Apply theme if implemented
  if (currentPreferences.theme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
}

// Show preferences dialog
function showPreferencesDialog() {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  // Create modal dialog
  const modal = document.createElement('div');
  modal.className = 'preferences-modal';
  
  // Create modal header
  const header = document.createElement('div');
  header.className = 'modal-header';
  header.innerHTML = '<h2>Preferences</h2>';
  
  // Create close button
  const closeButton = document.createElement('button');
  closeButton.className = 'modal-close';
  closeButton.textContent = '×';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  header.appendChild(closeButton);
  
  // Create modal content
  const content = document.createElement('div');
  content.className = 'modal-content';
  
  // Font family selection
  const fontFamilyGroup = document.createElement('div');
  fontFamilyGroup.className = 'preference-group';
  fontFamilyGroup.innerHTML = '<label>Font Family:</label>';
  
  const fontSelect = document.createElement('select');
  fontSelect.id = 'font-family-select';
  
  availableFonts.forEach(font => {
    const option = document.createElement('option');
    option.value = font.value;
    option.textContent = font.name;
    option.selected = font.value === currentPreferences.font.family;
    fontSelect.appendChild(option);
  });
  
  fontFamilyGroup.appendChild(fontSelect);
  content.appendChild(fontFamilyGroup);
  
  // Font size selection
  const fontSizeGroup = document.createElement('div');
  fontSizeGroup.className = 'preference-group';
  fontSizeGroup.innerHTML = '<label>Font Size:</label>';
  
  const sizeSelect = document.createElement('select');
  sizeSelect.id = 'font-size-select';
  
  availableSizes.forEach(size => {
    const option = document.createElement('option');
    option.value = size.value;
    option.textContent = size.name;
    option.selected = size.value === currentPreferences.font.size;
    sizeSelect.appendChild(option);
  });
  
  fontSizeGroup.appendChild(sizeSelect);
  content.appendChild(fontSizeGroup);
  
  // Preview section
  const previewGroup = document.createElement('div');
  previewGroup.className = 'preference-group';
  previewGroup.innerHTML = '<label>Preview:</label>';
  
  const previewText = document.createElement('div');
  previewText.className = 'font-preview';
  previewText.textContent = 'The quick brown fox jumps over the lazy dog.';
  previewText.style.fontFamily = currentPreferences.font.family;
  previewText.style.fontSize = currentPreferences.font.size;
  
  previewGroup.appendChild(previewText);
  content.appendChild(previewGroup);
  
  // Create modal footer with buttons
  const footer = document.createElement('div');
  footer.className = 'modal-footer';
  
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  
  const saveButton = document.createElement('button');
  saveButton.className = 'primary';
  saveButton.textContent = 'Save';
  saveButton.addEventListener('click', () => {
    // Update preferences
    const fontFamily = fontSelect.value;
    const fontSize = sizeSelect.value;
    
    currentPreferences.font.family = fontFamily;
    currentPreferences.font.size = fontSize;
    
    // Save preferences to localStorage
    localStorage.setItem('markdowner-preferences', JSON.stringify(currentPreferences));
    
    // Apply preferences
    applyPreferences();
    
    // Close dialog
    document.body.removeChild(overlay);
  });
  
  footer.appendChild(cancelButton);
  footer.appendChild(saveButton);
  
  // Add event listeners for live preview
  fontSelect.addEventListener('change', () => {
    previewText.style.fontFamily = fontSelect.value;
  });
  
  sizeSelect.addEventListener('change', () => {
    previewText.style.fontSize = sizeSelect.value;
  });
  
  // Assemble modal
  modal.appendChild(header);
  modal.appendChild(content);
  modal.appendChild(footer);
  overlay.appendChild(modal);
  
  // Add to document
  document.body.appendChild(overlay);
}

// Get current preferences for PDF export
function getPreferences() {
  return currentPreferences;
}

// Export functions
window.initPreferences = initPreferences;
window.applyPreferences = applyPreferences;
window.showPreferencesDialog = showPreferencesDialog;
window.getPreferences = getPreferences;
