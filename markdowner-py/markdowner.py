import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext
import markdown
import os
from tkinter import ttk
import webbrowser
import tempfile

class MarkdownEditor:
    def __init__(self, root):
        self.root = root
        self.root.title("Markdowner - Python Markdown Editor")
        self.root.geometry("1000x600")
        
        self.current_file = None
        self.setup_ui()
        
    def setup_ui(self):
        # Create menu bar
        menubar = tk.Menu(self.root)
        
        # File menu
        file_menu = tk.Menu(menubar, tearoff=0)
        file_menu.add_command(label="New", command=self.new_file)
        file_menu.add_command(label="Open", command=self.open_file)
        file_menu.add_command(label="Save", command=self.save_file)
        file_menu.add_command(label="Save As", command=self.save_as)
        file_menu.add_separator()
        file_menu.add_command(label="Exit", command=self.root.quit)
        menubar.add_cascade(label="File", menu=file_menu)
        
        # Help menu
        help_menu = tk.Menu(menubar, tearoff=0)
        help_menu.add_command(label="About", command=self.show_about)
        menubar.add_cascade(label="Help", menu=help_menu)
        
        self.root.config(menu=menubar)
        
        # Create main frame
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Create paned window for editor and preview
        paned_window = ttk.PanedWindow(main_frame, orient=tk.HORIZONTAL)
        paned_window.pack(fill=tk.BOTH, expand=True)
        
        # Editor frame
        editor_frame = ttk.LabelFrame(paned_window, text="Markdown Editor")
        paned_window.add(editor_frame, weight=1)
        
        # Preview frame
        preview_frame = ttk.LabelFrame(paned_window, text="Preview")
        paned_window.add(preview_frame, weight=1)
        
        # Editor text area
        self.editor = scrolledtext.ScrolledText(editor_frame, wrap=tk.WORD, font=("Courier New", 12))
        self.editor.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        self.editor.bind("<<Modified>>", self.on_text_change)
        
        # Preview area
        self.preview = scrolledtext.ScrolledText(preview_frame, wrap=tk.WORD, font=("Arial", 12))
        self.preview.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        self.preview.config(state=tk.DISABLED)
        
        # Status bar
        self.status_bar = ttk.Label(self.root, text="Ready", anchor=tk.W)
        self.status_bar.pack(side=tk.BOTTOM, fill=tk.X)
        
        # Toolbar frame
        toolbar_frame = ttk.Frame(self.root)
        toolbar_frame.pack(side=tk.TOP, fill=tk.X)
        
        # Markdown formatting buttons
        bold_btn = ttk.Button(toolbar_frame, text="Bold", command=lambda: self.insert_markdown("**", "**"))
        bold_btn.pack(side=tk.LEFT, padx=2, pady=2)
        
        italic_btn = ttk.Button(toolbar_frame, text="Italic", command=lambda: self.insert_markdown("*", "*"))
        italic_btn.pack(side=tk.LEFT, padx=2, pady=2)
        
        h1_btn = ttk.Button(toolbar_frame, text="H1", command=lambda: self.insert_markdown("# ", ""))
        h1_btn.pack(side=tk.LEFT, padx=2, pady=2)
        
        h2_btn = ttk.Button(toolbar_frame, text="H2", command=lambda: self.insert_markdown("## ", ""))
        h2_btn.pack(side=tk.LEFT, padx=2, pady=2)
        
        h3_btn = ttk.Button(toolbar_frame, text="H3", command=lambda: self.insert_markdown("### ", ""))
        h3_btn.pack(side=tk.LEFT, padx=2, pady=2)
        
        link_btn = ttk.Button(toolbar_frame, text="Link", command=self.insert_link)
        link_btn.pack(side=tk.LEFT, padx=2, pady=2)
        
        image_btn = ttk.Button(toolbar_frame, text="Image", command=self.insert_image)
        image_btn.pack(side=tk.LEFT, padx=2, pady=2)
        
        list_btn = ttk.Button(toolbar_frame, text="List", command=lambda: self.insert_markdown("- ", ""))
        list_btn.pack(side=tk.LEFT, padx=2, pady=2)
        
        code_btn = ttk.Button(toolbar_frame, text="Code", command=lambda: self.insert_markdown("```\n", "\n```"))
        code_btn.pack(side=tk.LEFT, padx=2, pady=2)
        
        # Add some sample text
        self.editor.insert(tk.END, "# Welcome to Markdowner\n\nThis is a simple **Markdown** editor built with Python and Tkinter.\n\n## Features\n\n- Edit Markdown text\n- See live preview\n- Save and open Markdown files\n\n### How to use\n\nJust start typing in the editor pane, and see the preview update in real-time!")
        self.update_preview()
    
    def on_text_change(self, event=None):
        if self.editor.edit_modified():
            self.update_preview()
            self.editor.edit_modified(False)
    
    def update_preview(self):
        # Get the markdown text
        markdown_text = self.editor.get("1.0", tk.END)
        
        # Convert to HTML
        html = markdown.markdown(markdown_text, extensions=['tables', 'fenced_code'])
        
        # Update preview
        self.preview.config(state=tk.NORMAL)
        self.preview.delete("1.0", tk.END)
        
        # Insert HTML content
        self.preview.insert(tk.END, html)
        
        # Make it read-only again
        self.preview.config(state=tk.DISABLED)
        
        # Update status bar
        char_count = len(markdown_text) - 1  # Subtract 1 for the extra newline
        word_count = len(markdown_text.split())
        self.status_bar.config(text=f"Characters: {char_count} | Words: {word_count}")
    
    def insert_markdown(self, prefix, suffix):
        # Get selected text
        try:
            selected_text = self.editor.get(tk.SEL_FIRST, tk.SEL_LAST)
            self.editor.delete(tk.SEL_FIRST, tk.SEL_LAST)
            self.editor.insert(tk.INSERT, f"{prefix}{selected_text}{suffix}")
        except tk.TclError:
            # No selection, just insert at cursor
            self.editor.insert(tk.INSERT, f"{prefix}{suffix}")
            # Move cursor between tags if there's a suffix
            if suffix:
                self.editor.mark_set(tk.INSERT, f"{tk.INSERT} - {len(suffix)}c")
        
        self.on_text_change()
    
    def insert_link(self):
        try:
            selected_text = self.editor.get(tk.SEL_FIRST, tk.SEL_LAST)
            self.editor.delete(tk.SEL_FIRST, tk.SEL_LAST)
            self.editor.insert(tk.INSERT, f"[{selected_text}](url)")
        except tk.TclError:
            self.editor.insert(tk.INSERT, "[link text](url)")
            self.editor.mark_set(tk.INSERT, f"{tk.INSERT} - 5c")  # Position cursor at "url"
        
        self.on_text_change()
    
    def insert_image(self):
        self.editor.insert(tk.INSERT, "![alt text](image_url)")
        self.editor.mark_set(tk.INSERT, f"{tk.INSERT} - 11c")  # Position cursor at "image_url"
        self.on_text_change()
    
    def new_file(self):
        if messagebox.askyesno("New File", "Do you want to create a new file? Any unsaved changes will be lost."):
            self.editor.delete("1.0", tk.END)
            self.current_file = None
            self.root.title("Markdowner - Python Markdown Editor")
            self.update_preview()
    
    def open_file(self):
        file_path = filedialog.askopenfilename(
            filetypes=[("Markdown Files", "*.md"), ("Text Files", "*.txt"), ("All Files", "*.*")]
        )
        
        if file_path:
            try:
                with open(file_path, "r", encoding="utf-8") as file:
                    content = file.read()
                    self.editor.delete("1.0", tk.END)
                    self.editor.insert(tk.END, content)
                    self.current_file = file_path
                    self.root.title(f"Markdowner - {os.path.basename(file_path)}")
                    self.update_preview()
            except Exception as e:
                messagebox.showerror("Error", f"Could not open file: {e}")
    
    def save_file(self):
        if self.current_file:
            try:
                content = self.editor.get("1.0", tk.END)
                with open(self.current_file, "w", encoding="utf-8") as file:
                    file.write(content)
                messagebox.showinfo("Saved", f"File saved: {self.current_file}")
            except Exception as e:
                messagebox.showerror("Error", f"Could not save file: {e}")
        else:
            self.save_as()
    
    def save_as(self):
        file_path = filedialog.asksaveasfilename(
            defaultextension=".md",
            filetypes=[("Markdown Files", "*.md"), ("Text Files", "*.txt"), ("All Files", "*.*")]
        )
        
        if file_path:
            try:
                content = self.editor.get("1.0", tk.END)
                with open(file_path, "w", encoding="utf-8") as file:
                    file.write(content)
                self.current_file = file_path
                self.root.title(f"Markdowner - {os.path.basename(file_path)}")
                messagebox.showinfo("Saved", f"File saved: {file_path}")
            except Exception as e:
                messagebox.showerror("Error", f"Could not save file: {e}")
    
    def show_about(self):
        messagebox.showinfo(
            "About Markdowner",
            "Markdowner - A simple Markdown editor\n\n"
            "Created with Python and Tkinter\n\n"
            "© 2025 Markdowner"
        )

if __name__ == "__main__":
    root = tk.Tk()
    app = MarkdownEditor(root)
    root.mainloop()
