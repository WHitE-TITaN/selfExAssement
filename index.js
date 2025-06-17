const express = require('express');
const multer = require('multer');

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const pdfParse = require('pdf-parse');

const app = express();
const port = 3000;

// Serve static files (like HTML, CSS, JS) from the "public" folder
app.use(express.static('public'));

// Configure multer for file uploads
const upload = multer({ 
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/plain' || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only .txt and .pdf files are allowed'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Function to extract text from file
async function extractTextFromFile(filePath, fileType) {
    try {
        if (fileType === 'text/plain') {
            // Read TXT file
            return fs.readFileSync(filePath, 'utf8');
        } else if (fileType === 'application/pdf') {
            // Read PDF file
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            return data.text;
        }
    } catch (error) {
        console.error('Error extracting text:', error);
        
        // Provide specific error messages for common PDF issues
        if (error.message && error.message.includes('bad XRef entry')) {
            throw new Error('This PDF file appears to be corrupted or has an unsupported format. Please try a different PDF file or convert it to text format.');
        } else if (error.message && error.message.includes('FormatError')) {
            throw new Error('This PDF file format is not supported. Please try a different PDF file or convert it to text format.');
        } else {
            throw new Error(`Failed to extract text from file: ${error.message}`);
        }
    }
}

// Function to call C++ executable (only for very small inputs)
function callCppInterface(inputText) {
    return new Promise((resolve, reject) => {
        // Only try AI for very small inputs (under 200 characters)
        if (inputText.length > 200) {
            reject(new Error('Input too large for AI processing'));
            return;
        }
        
        // Truncate very long documents to avoid context overflow and timeout
        const maxLength = 200; // Very small limit for speed
        const truncatedText = inputText.length > maxLength 
            ? inputText.substring(0, maxLength) + "... [truncated]"
            : inputText;
        
        // Use proper Llama-2 chat format
        const enhancedPrompt = `User: Please create 2-3 summary cards from this text.

Document:
${truncatedText}

Assistant:`;

        // Create a temporary file with the enhanced prompt
        const tempInputFile = path.join(__dirname, 'temp_input.txt');
        fs.writeFileSync(tempInputFile, enhancedPrompt);

        // Path to your C++ executable (updated for the correct path)
        const cppExecutable = path.join(__dirname, 'Neural-Network', 'build', 'Release', 'NeuralNetwork.exe');
        
        console.log('Looking for executable at:', cppExecutable);
        
        // Check if executable exists
        if (!fs.existsSync(cppExecutable)) {
            console.error('Executable not found at:', cppExecutable);
            reject(new Error('C++ executable not found. Please build the project first.'));
            return;
        }

        console.log('Executable found, running with input length:', enhancedPrompt.length);
        console.log('Document content length:', truncatedText.length);

        // Execute the C++ program with very short timeout
        const process = exec(`"${cppExecutable}" < "${tempInputFile}"`, {
            cwd: path.dirname(cppExecutable),
            timeout: 30000 // 30 second timeout (very short)
        }, (error, stdout, stderr) => {
            // Clean up temporary file with retry logic
            let retryCount = 0;
            const maxRetries = 5;
            
            const cleanupFile = () => {
                try {
                    if (fs.existsSync(tempInputFile)) {
                        fs.unlinkSync(tempInputFile);
                    }
                } catch (e) {
                    retryCount++;
                    if (retryCount < maxRetries) {
                        setTimeout(cleanupFile, 1000); // Retry after 1 second
                    } else {
                        console.warn('Could not delete temp file after retries:', e);
                    }
                }
            };
            
            cleanupFile();

            if (error) {
                console.error('C++ execution error:', error);
                console.error('Error code:', error.code);
                console.error('Error signal:', error.signal);
                
                // If it's a timeout, provide a more helpful error
                if (error.signal === 'SIGTERM') {
                    reject(new Error('AI processing is too slow. Using simplified cards instead.'));
                } else {
                    reject(error);
                }
                return;
            }

            if (stderr) {
                console.warn('C++ stderr:', stderr);
            }

            console.log('C++ stdout length:', stdout.length);
            
            // Check if we got any meaningful output
            if (!stdout || stdout.trim().length < 20) {
                reject(new Error('AI model did not generate sufficient output.'));
                return;
            }
            
            resolve(stdout);
        });

        // Handle process termination
        process.on('error', (error) => {
            console.error('Process error:', error);
            reject(error);
        });

        // Log process events
        process.on('spawn', () => {
            console.log('C++ process spawned');
        });

        process.on('close', (code) => {
            console.log('C++ process closed with code:', code);
        });

        // Add a timeout handler
        setTimeout(() => {
            if (process && !process.killed) {
                console.log('Force killing C++ process due to timeout');
                process.kill('SIGTERM');
            }
        }, 30000); // 30 seconds
    });
}

// Fast fallback function for immediate response
function generateFastCards(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
    const cards = [];
    
    // Create summary cards from the text
    for (let i = 0; i < Math.min(4, sentences.length); i++) {
        const sentence = sentences[i].trim();
        if (sentence.length > 25) {
            cards.push(sentence + '.');
        }
    }
    
    // If no good sentences found, create summary chunks
    if (cards.length === 0) {
        const words = text.split(' ');
        const chunkSize = Math.ceil(words.length / 3);
        
        for (let i = 0; i < 3; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, words.length);
            const chunk = words.slice(start, end).join(' ');
            if (chunk.length > 20) {
                cards.push(chunk + '...');
            }
        }
    }
    
    // Ensure we have at least one card
    if (cards.length === 0) {
        const summary = text.substring(0, 150).trim();
        if (summary.length > 20) {
            cards.push(summary + '...');
        } else {
            cards.push('Content processed successfully.');
        }
    }
    
    return cards;
}

// Function to split text into cards
function splitIntoCards(text) {
    console.log('Splitting text into cards. Original text length:', text.length);
    
    // Remove the prompt part from the AI response
    const responseStart = text.indexOf('Assistant:');
    let cleanText = text;
    if (responseStart !== -1) {
        cleanText = text.substring(responseStart + 'Assistant:'.length).trim();
    }
    
    console.log('Cleaned text length:', cleanText.length);
    console.log('First 300 chars of cleaned text:', cleanText.substring(0, 300));

    // Try multiple splitting strategies
    let cards = [];
    
    // Strategy 1: Look for numbered cards (1., 2., etc.)
    const numberedPattern = /\n\s*(\d+\.)\s*/g;
    const numberedMatches = [...cleanText.matchAll(numberedPattern)];
    
    if (numberedMatches.length > 0) {
        console.log('Found numbered pattern, extracting cards...');
        for (let i = 0; i < numberedMatches.length; i++) {
            const start = numberedMatches[i].index + numberedMatches[i][0].length;
            const end = i < numberedMatches.length - 1 ? numberedMatches[i + 1].index : cleanText.length;
            const cardText = cleanText.substring(start, end).trim();
            if (cardText.length > 20) {
                cards.push(cardText);
            }
        }
        console.log('Extracted', cards.length, 'cards using numbered pattern');
    }
    
    // Strategy 2: Look for bullet points or dashes
    if (cards.length <= 1) {
        const bulletPattern = /\n\s*[\-\*]\s*/g;
        const bulletMatches = [...cleanText.matchAll(bulletPattern)];
        
        if (bulletMatches.length > 0) {
            console.log('Found bullet pattern, extracting cards...');
            for (let i = 0; i < bulletMatches.length; i++) {
                const start = bulletMatches[i].index + bulletMatches[i][0].length;
                const end = i < bulletMatches.length - 1 ? bulletMatches[i + 1].index : cleanText.length;
                const cardText = cleanText.substring(start, end).trim();
                if (cardText.length > 20) {
                    cards.push(cardText);
                }
            }
            console.log('Extracted', cards.length, 'cards using bullet pattern');
        }
    }
    
    // Strategy 3: Split by double newlines (paragraphs)
    if (cards.length <= 1) {
        const paragraphs = cleanText
            .split(/\n\s*\n/)
            .filter(para => para.trim().length > 30)
            .map(para => para.trim());
        
        if (paragraphs.length > 1) {
            cards = paragraphs.slice(0, 10);
            console.log('Found', cards.length, 'cards using paragraph split');
        }
    }
    
    // Strategy 4: Split by sentences and group them intelligently
    if (cards.length <= 1) {
        const sentences = cleanText
            .split(/[.!?]+/)
            .filter(sentence => sentence.trim().length > 15)
            .map(sentence => sentence.trim());
        
        // Group sentences into meaningful cards
        cards = [];
        let currentCard = '';
        
        for (const sentence of sentences) {
            if (currentCard.length + sentence.length < 300) {
                currentCard += (currentCard ? '. ' : '') + sentence;
            } else {
                if (currentCard) {
                    cards.push(currentCard + '.');
                    currentCard = sentence;
                }
            }
        }
        
        if (currentCard) {
            cards.push(currentCard + '.');
        }
        
        cards = cards.slice(0, 10);
        console.log('Found', cards.length, 'cards using sentence grouping');
    }
    
    // Strategy 5: If still no cards, create a single summary card
    if (cards.length === 0) {
        const summary = cleanText.substring(0, 800).trim();
        if (summary.length > 20) {
            cards = [summary];
        }
        console.log('Created single summary card');
    }
    
    // Clean up cards
    cards = cards
        .map(card => card.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim())
        .filter(card => card.length > 20 && card.length < 1000);
    
    console.log('Final cards count:', cards.length);
    cards.forEach((card, index) => {
        console.log(`Card ${index + 1} (${card.length} chars):`, card.substring(0, 100) + '...');
    });
    
    return cards;
}

// Main processing function
async function processText(text, isFileUpload = false) {
    try {
        console.log('Processing text, length:', text.length);
        
        // For most cases, use fast processing immediately
        if (text.length > 200) {
            console.log('Text too large for AI, using fast processing');
            const fastCards = generateFastCards(text);
            return {
                success: true,
                cards: fastCards,
                processingTime: 'Fast processing',
                method: 'Fast summary'
            };
        }
        
        // Only try AI for very small inputs
        console.log('Trying AI processing for small input');
        const startTime = Date.now();
        
        try {
            const aiOutput = await callCppInterface(text);
            const processingTime = Date.now() - startTime;
            
            console.log('AI processing successful, time:', processingTime + 'ms');
            
            // Parse AI output into cards
            const cards = parseAIOutput(aiOutput);
            
            return {
                success: true,
                cards: cards,
                processingTime: `${processingTime}ms`,
                method: 'AI generated'
            };
            
        } catch (aiError) {
            console.log('AI processing failed, using fast fallback:', aiError.message);
            
            // Use fast fallback
            const fastCards = generateFastCards(text);
            const processingTime = Date.now() - startTime;
            
            return {
                success: true,
                cards: fastCards,
                processingTime: `${processingTime}ms`,
                method: 'Fast summary (AI unavailable)'
            };
        }
        
    } catch (error) {
        console.error('Processing error:', error);
        throw error;
    }
}

// API endpoint for file upload
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('File uploaded:', req.file.originalname, 'Size:', req.file.size);
        console.log('File buffer type:', typeof req.file.buffer);
        console.log('File buffer length:', req.file.buffer ? req.file.buffer.length : 'undefined');
        console.log('Is buffer:', Buffer.isBuffer(req.file.buffer));

        let extractedText = '';
        const fileExtension = path.extname(req.file.originalname).toLowerCase();

        // Extract text based on file type
        if (fileExtension === '.txt') {
            extractedText = req.file.buffer.toString('utf8');
        } else if (fileExtension === '.pdf') {
            try {
                // Ensure we have a proper buffer for PDF parsing
                const pdfBuffer = Buffer.isBuffer(req.file.buffer) ? req.file.buffer : Buffer.from(req.file.buffer);
                const pdfData = await pdfParse(pdfBuffer);
                extractedText = pdfData.text;
                
                // Validate extracted text
                if (!extractedText || extractedText.trim().length === 0) {
                    return res.status(400).json({ 
                        error: 'No text content could be extracted from the PDF. The file might be image-based or corrupted.' 
                    });
                }
            } catch (pdfError) {
                console.error('PDF parsing error:', pdfError);
                return res.status(400).json({ 
                    error: 'Failed to parse PDF. The file might be corrupted, password-protected, or contain only images.' 
                });
            }
        } else {
            return res.status(400).json({ error: 'Unsupported file type. Please upload a .txt or .pdf file.' });
        }

        if (extractedText.length > 50000) {
            return res.status(400).json({ 
                error: 'File too large. Please upload a smaller file (max 50,000 characters).' 
            });
        }

        console.log('Extracted text length:', extractedText.length);

        // Process the text using the new fast processing
        const result = await processText(extractedText, true);
        
        res.json({
            success: true,
            cards: result.cards,
            processingTime: result.processingTime,
            method: result.method,
            originalText: extractedText.substring(0, 200) + (extractedText.length > 200 ? '...' : '')
        });

    } catch (error) {
        console.error('Upload processing error:', error);
        res.status(500).json({ 
            error: 'Failed to process file. Please try again with a different file.' 
        });
    }
});

// API endpoint for text input
app.post('/process-text', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Please enter some text to process.' });
        }

        if (text.length > 50000) {
            return res.status(400).json({ 
                error: 'Text is too long. Please enter a shorter text (max 50,000 characters).' 
            });
        }

        console.log('Processing text input, length:', text.length);

        // Process the text using the new fast processing
        const result = await processText(text, false);
        
        res.json({
            success: true,
            cards: result.cards,
            processingTime: result.processingTime,
            method: result.method,
            originalText: text.substring(0, 200) + (text.length > 200 ? '...' : '')
        });

    } catch (error) {
        console.error('Text processing error:', error);
        res.status(500).json({ 
            error: 'Failed to process text. Please try again.' 
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Make sure to build your C++ project first:');
    console.log('cd Neural-Network && mkdir build && cd build && cmake .. && cmake --build . --config Release');
});
