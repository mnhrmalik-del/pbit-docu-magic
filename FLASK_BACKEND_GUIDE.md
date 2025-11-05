# Flask Backend Implementation Guide

This guide will help you set up the Flask backend that works with your React frontend for the AI Documentation Generator.

## Project Structure

```
AI-DocGen-main/
├── app.py                # Flask web app (create this)
├── test.py               # Your existing backend pipeline
├── uploads/              # Temporary file storage (auto-created)
├── result/               # Generated documentation files (auto-created)
└── frontend/             # Your React app (this Lovable project)
```

## Installation

Install required Python packages:

```bash
pip install flask flask-cors pypandoc
```

## Flask Backend Code (`app.py`)

Create this file in your `AI-DocGen-main` directory:

```python
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import subprocess
import pypandoc
from pathlib import Path
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
UPLOAD_FOLDER = 'uploads'
RESULT_FOLDER = 'result'
ALLOWED_EXTENSIONS = {'pbit'}

# Create folders if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload and trigger processing"""
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        # Save uploaded file
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)
        
        try:
            # Run your existing test.py script
            # This assumes test.py looks for .pbit files in the same directory
            # Adjust the command if needed
            result = subprocess.run(
                ['python', 'test.py'],
                cwd=os.getcwd(),  # Run in current directory
                capture_output=True,
                text=True,
                timeout=600  # 10 minute timeout
            )
            
            if result.returncode != 0:
                return jsonify({
                    'error': 'Processing failed',
                    'details': result.stderr
                }), 500
            
            # Convert markdown to PDF and DOCX
            markdown_file = os.path.join(RESULT_FOLDER, 'documentation_result.md')
            
            if os.path.exists(markdown_file):
                # Convert to PDF
                pdf_output = os.path.join(RESULT_FOLDER, 'documentation.pdf')
                pypandoc.convert_file(
                    markdown_file,
                    'pdf',
                    outputfile=pdf_output,
                    extra_args=['--pdf-engine=pdflatex']
                )
                
                # Convert to DOCX
                docx_output = os.path.join(RESULT_FOLDER, 'documentation.docx')
                pypandoc.convert_file(
                    markdown_file,
                    'docx',
                    outputfile=docx_output
                )
            
            return jsonify({
                'status': 'success',
                'message': 'Documentation generated successfully'
            }), 200
            
        except subprocess.TimeoutExpired:
            return jsonify({'error': 'Processing timeout'}), 500
        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            # Clean up uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/download/<filetype>', methods=['GET'])
def download_file(filetype):
    """Download generated documentation"""
    
    if filetype not in ['pdf', 'docx']:
        return jsonify({'error': 'Invalid file type'}), 400
    
    filename = f'documentation.{filetype}'
    filepath = os.path.join(RESULT_FOLDER, filename)
    
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404
    
    # Send file and schedule cleanup
    response = send_file(
        filepath,
        as_attachment=True,
        download_name=filename
    )
    
    # Clean up files after sending (optional - you can keep them if needed)
    # Uncomment the following lines to enable auto-cleanup:
    # @response.call_on_close
    # def cleanup():
    #     time.sleep(1)  # Wait a bit before cleanup
    #     if os.path.exists(filepath):
    #         os.remove(filepath)
    
    return response

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)
```

## Running the Backend

1. **Navigate to your project directory:**
   ```bash
   cd "C:\Users\Charish\Desktop\AI-DocGen-main (1)"
   ```

2. **Run the Flask server:**
   ```bash
   python app.py
   ```

   The server will start on `http://localhost:5000`

3. **In a separate terminal, run your React frontend:**
   - Your React app is already configured to make API calls to `localhost:5000`

## Important Notes

### Adjustments for Your Setup

1. **test.py Integration:**
   - The current implementation assumes `test.py` looks for `.pbit` files in the current directory
   - If your `test.py` expects files in a specific location, modify the upload path or copy the file to where `test.py` expects it

2. **PDF Conversion:**
   - Install `pandoc` and LaTeX for PDF generation:
     - Download pandoc: https://pandoc.org/installing.html
     - For LaTeX (Windows): Install MiKTeX from https://miktex.org/download
   
   - Alternatively, use a simpler PDF library like `markdown2` + `pdfkit`:
     ```bash
     pip install markdown2 pdfkit
     ```

3. **Confluence Upload:**
   - Your `test.py` already handles Confluence upload via `app.py` (different from Flask app.py)
   - Make sure your Confluence credentials are configured in your existing setup

4. **File Cleanup:**
   - The code automatically removes uploaded `.pbit` files after processing
   - Generated PDF/DOCX files are kept by default (uncomment cleanup code if you want auto-deletion)

## Testing the Integration

1. Start Flask backend: `python app.py`
2. Open your React frontend (Lovable preview)
3. Upload a `.pbit` file
4. Watch the progress indicator
5. Download PDF or DOCX when complete

## Troubleshooting

- **CORS errors:** Make sure `flask-cors` is installed and CORS is enabled
- **Processing timeout:** Increase the `timeout` value in `subprocess.run()` if your pipeline takes longer
- **PDF generation fails:** Install pandoc and LaTeX, or switch to alternative PDF library
- **File not found:** Check that `test.py` outputs to `result/documentation_result.md`

## API Endpoints

- `POST /upload` - Upload .pbit file and trigger processing
- `GET /download/pdf` - Download PDF documentation
- `GET /download/docx` - Download DOCX documentation
- `GET /health` - Health check

---

Your React frontend is now ready! Just implement this Flask backend and you'll have a complete working system.
