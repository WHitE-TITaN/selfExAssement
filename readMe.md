# AI Document Processor - ChatGPT Style

A modern web application that processes documents and text to generate AI-powered summary cards. Features a ChatGPT-like interface with fast processing capabilities.

## 🚀 Features

- **📄 File Upload**: Support for TXT and PDF files (up to 5MB)
- **✍️ Text Input**: Direct text input (up to 50,000 characters)
- **⚡ Fast Processing**: Instant text analysis with smart card generation
- **🤖 AI Integration**: Optional AI processing for small inputs using Llama.cpp
- **🎨 Modern UI**: ChatGPT-style interface with blue cards and smooth animations
- **📱 Responsive Design**: Works on desktop and mobile devices

## 🛠️ Technology Stack

- **Backend**: Node.js with Express
- **Frontend**: HTML, CSS, JavaScript
- **AI Model**: Llama.cpp integration (optional)
- **File Processing**: pdf-parse for PDF extraction
- **File Upload**: Multer with memory storage

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- CMake (for building C++ components)
- Visual Studio Build Tools (Windows) or GCC (Linux/Mac)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shelfExAssement
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```
**IMPORTANT - Additionaly**

---

download a llama.gguf model for the project the efficiency and accuricy might vary accordingly.<br>
example link - https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF

3. **Build the C++ AI model (optional)**
   ```bash
   # Windows
   cd Neural-Network
   mkdir build
   cd build
   cmake ..
   cmake --build . --config Release
   cd ../..
   
   # Linux/Mac
   cd Neural-Network
   mkdir build
   cd build
   cmake ..
   make
   cd ../..
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   Open your browser and go to `http://localhost:3000`

## 🎯 How It Works

### Processing Modes

1. **Fast Processing (Default)**
   - Used for most content (>200 characters)
   - Instant text analysis and card generation
   - Smart sentence extraction and chunking
   - No AI model required

2. **AI Processing (Optional)**
   - Used for small inputs (<200 characters)
   - Requires built C++ executable
   - 30-second timeout with fallback
   - Llama.cpp integration

### File Support

- **TXT Files**: Direct text extraction
- **PDF Files**: Text extraction using pdf-parse
- **Text Input**: Direct processing from textarea

### Card Generation

The system generates informative cards using:
- Sentence-based extraction for natural summaries
- Word chunking for longer documents
- Multiple fallback strategies for reliability

## 📁 Project Structure

```
shelfExAssement/
├── index.js                 # Main server file
├── package.json            # Node.js dependencies
├── public/                 # Frontend files
│   ├── index.html         # Main HTML interface
│   └── style.css          # CSS styles
├── Neural-Network/         # C++ AI model (optional)
│   ├── src/
│   │   └── main.cpp       # C++ implementation
│   ├── headers/
│   │   └── model.h        # Model header
│   └── build/             # Build output (after building)
└── uploads/               # Temporary upload directory
```

## 🔧 Configuration

### File Size Limits
- **PDF/TXT Files**: 5MB maximum
- **Text Input**: 50,000 characters maximum

### Processing Limits
- **AI Processing**: 200 characters maximum
- **Fast Processing**: No practical limit
- **Timeout**: 30 seconds for AI processing

## 🚀 Usage

1. **Upload a File**
   - Click the upload area
   - Select a TXT or PDF file
   - Click "Process Content"

2. **Enter Text**
   - Type or paste text in the textarea
   - Click "Process Content"

3. **View Results**
   - Cards will appear with processing information
   - Each card contains key insights from your content

## 🐛 Troubleshooting

### Common Issues

1. **PDF Parsing Errors**
   - Try a different PDF file
   - Ensure the PDF contains text (not just images)
   - Check if the PDF is password-protected

2. **AI Model Not Working**
   - Ensure the C++ project is built correctly
   - Check that the executable exists in `Neural-Network/build/Release/`
   - The system will use fast processing as fallback

3. **File Upload Issues**
   - Check file size (max 5MB)
   - Ensure file type is TXT or PDF
   - Try refreshing the page

### Performance Tips

- **Large Documents**: Use fast processing (automatic for >200 chars)
- **Small Inputs**: AI processing available for detailed analysis
- **Multiple Files**: Process one at a time for best results

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the console logs for errors
3. Ensure all dependencies are installed
4. Verify the C++ build if using AI features
