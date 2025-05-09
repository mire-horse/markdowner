#!/usr/bin/env python3
import sys
import subprocess
import importlib.util

def check_module(module_name):
    """Check if a Python module is installed."""
    return importlib.util.find_spec(module_name) is not None

def main():
    """Main function to run the Markdown editor."""
    # Check for required modules
    required_modules = ['markdown', 'tkinter']
    missing_modules = []
    
    for module in required_modules:
        if not check_module(module):
            missing_modules.append(module)
    
    if missing_modules:
        print("Missing required modules:", ", ".join(missing_modules))
        install = input("Would you like to install them now? (y/n): ")
        
        if install.lower() == 'y':
            try:
                subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'])
                print("Dependencies installed successfully!")
            except subprocess.CalledProcessError:
                print("Failed to install dependencies. Please install them manually:")
                print("pip install -r requirements.txt")
                return
        else:
            print("Please install the required modules and try again.")
            return
    
    # Import and run the markdown editor
    try:
        import markdowner
        print("Starting Markdowner...")
        import tkinter as tk
        root = tk.Tk()
        app = markdowner.MarkdownEditor(root)
        root.mainloop()
    except Exception as e:
        print(f"Error starting Markdowner: {e}")

if __name__ == "__main__":
    main()
