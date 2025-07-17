import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import multer from 'multer';
import OpenAI from 'openai';
import fs from 'fs';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Configure multer for audio uploads
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.googletagmanager.com"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.elevenlabs.io", "https://api.openai.com", "https://www.google-analytics.com"],
            mediaSrc: ["'self'", "blob:"],
        },
    },
}));

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [
        'https://sentauri.ai',
        'https://www.sentauri.ai',
        'https://demo.sentauri.ai',
        'https://sentauri-voice.vercel.app',
        'https://sentauri-voice.netlify.app'
      ]
    : [
        'http://localhost:3000',
        'http://localhost:8080',
        'http://localhost:8000',
        'http://127.0.0.1:8080',
        'http://127.0.0.1:8000'
      ];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const ttsLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // Higher limit for OpenAI
});

const whisperLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 15,
});

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/text-to-speech', ttsLimiter);
app.use('/api/speech-to-text', whisperLimiter);

// Serve static files
app.use(express.static(__dirname));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'sentauri-backend',
        timestamp: new Date().toISOString(),
        apis: {
            elevenlabs: !!process.env.ELEVENLABS_API_KEY,
            openai: !!process.env.OPENAI_API_KEY
        }
    });
});

// OpenAI Whisper - Speech to Text
app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API not configured' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
    }

    try {
        // Create a readable stream from the uploaded file
        const audioFile = fs.createReadStream(req.file.path);
        
        // Call Whisper API
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            language: 'en',
            temperature: 0.2,
        });

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            transcript: transcription.text,
            confidence: 0.95 // Whisper doesn't provide confidence scores
        });

    } catch (error) {
        console.error('Whisper error:', error);
        
        // Clean up file on error
        if (req.file?.path) {
            try { fs.unlinkSync(req.file.path); } catch (e) {}
        }
        
        res.status(500).json({ error: 'Failed to transcribe audio' });
    }
});

// OpenAI TTS - Text to Speech
app.post('/api/text-to-speech/openai', async (req, res) => {
    const { text, voice = 'nova' } = req.body;
    
    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text is required' });
    }
    
    if (text.length > 4096) {
        return res.status(400).json({ error: 'Text too long (max 4096 characters)' });
    }
    
    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API not configured' });
    }
    
    try {
        const mp3 = await openai.audio.speech.create({
            model: 'tts-1',
            voice: voice, // alloy, echo, fable, onyx, nova, shimmer
            input: text,
            speed: 1.0
        });

        // Convert the response to a buffer
        const buffer = Buffer.from(await mp3.arrayBuffer());
        
        // Set appropriate headers
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': buffer.length,
            'Cache-Control': 'no-cache',
        });

        res.send(buffer);
        
        console.log(`OpenAI TTS: ${text.substring(0, 50)}... (${text.length} chars)`);
        
    } catch (error) {
        console.error('OpenAI TTS error:', error);
        res.status(500).json({ error: 'Failed to generate speech' });
    }
});

// GPT-4 Command Processing
app.post('/api/process-command', async (req, res) => {
    const { command, context = {} } = req.body;
    
    if (!command || typeof command !== 'string') {
        return res.status(400).json({ error: 'Command is required' });
    }
    
    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API not configured' });
    }
    
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                {
                    role: 'system',
                    content: `You are Sentauri, an AI assistant that helps users modify websites using voice commands. 
                    Convert natural language commands into specific actions. Respond with:
                    1. action: The type of change (title, background, button, feature, etc.)
                    2. target: What element to change
                    3. value: The new value
                    4. response: A friendly confirmation message
                    
                    Example: "Make the background blue"
                    Response: {
                        "action": "style",
                        "target": "background",
                        "value": "#3498db",
                        "response": "I've changed the background to a beautiful blue!"
                    }`
                },
                {
                    role: 'user',
                    content: command
                }
            ],
            temperature: 0.7,
            max_tokens: 200,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0].message.content);
        
        res.json({
            success: true,
            command: command,
            ...result,
            usage: completion.usage
        });

    } catch (error) {
        console.error('GPT-4 error:', error);
        res.status(500).json({ error: 'Failed to process command' });
    }
});

// ElevenLabs TTS endpoint (kept for backward compatibility)
app.post('/api/text-to-speech', async (req, res) => {
    const { text, voiceId = 'qSV5UqvHBC0Widy71Esh' } = req.body;
    
    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text is required' });
    }
    
    if (text.length > 1000) {
        return res.status(400).json({ error: 'Text too long (max 1000 characters)' });
    }
    
    if (!process.env.ELEVENLABS_API_KEY) {
        // Fallback to OpenAI if ElevenLabs not configured
        if (process.env.OPENAI_API_KEY) {
            return app._router.handle(
                Object.assign(req, { url: '/api/text-to-speech/openai' }), 
                res
            );
        }
        return res.status(500).json({ error: 'No TTS service configured' });
    }
    
    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': process.env.ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            })
        });

        if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        res.set({
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'no-cache',
            'X-Content-Type-Options': 'nosniff'
        });

        response.body.pipe(res);
        
    } catch (error) {
        console.error('TTS error:', error);
        res.status(500).json({ error: 'Failed to generate speech' });
    }
});

// Combined endpoint for complete voice interaction
app.post('/api/voice-interact', upload.single('audio'), async (req, res) => {
    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API not configured' });
    }

    try {
        // Step 1: Transcribe audio with Whisper
        let transcript = '';
        if (req.file) {
            const audioFile = fs.createReadStream(req.file.path);
            const transcription = await openai.audio.transcriptions.create({
                file: audioFile,
                model: 'whisper-1',
            });
            transcript = transcription.text;
            fs.unlinkSync(req.file.path);
        } else if (req.body.transcript) {
            transcript = req.body.transcript;
        } else {
            return res.status(400).json({ error: 'No audio or transcript provided' });
        }

        // Step 2: Process command with GPT-4
        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview',
            messages: [
                {
                    role: 'system',
                    content: `You are Sentauri. Process voice commands and return:
                    - action: type of change
                    - target: element to modify  
                    - value: new value
                    - response: friendly confirmation (keep it short for TTS)`
                },
                {
                    role: 'user',
                    content: transcript
                }
            ],
            response_format: { type: "json_object" }
        });

        const commandResult = JSON.parse(completion.choices[0].message.content);

        // Step 3: Generate speech response
        const mp3 = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'nova',
            input: commandResult.response
        });

        const audioBuffer = Buffer.from(await mp3.arrayBuffer());

        // Return complete response
        res.json({
            success: true,
            transcript,
            command: commandResult,
            audio: audioBuffer.toString('base64'),
            audioUrl: `data:audio/mpeg;base64,${audioBuffer.toString('base64')}`
        });

    } catch (error) {
        console.error('Voice interaction error:', error);
        res.status(500).json({ error: 'Failed to process voice command' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`
🚀 Sentauri Backend Server Running (OpenAI Enhanced)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Port: ${PORT}
🔒 Environment: ${process.env.NODE_ENV || 'development'}
📡 CORS Origins: ${allowedOrigins.join(', ')}

API Status:
🔑 OpenAI API: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}
🔑 ElevenLabs API: ${process.env.ELEVENLABS_API_KEY ? '✅ Configured' : '❌ Missing'}

Available Endpoints:
🎤 POST /api/speech-to-text - Whisper transcription
🔊 POST /api/text-to-speech/openai - OpenAI TTS
🔊 POST /api/text-to-speech - ElevenLabs TTS (fallback to OpenAI)
🧠 POST /api/process-command - GPT-4 command processing
🎯 POST /api/voice-interact - Complete voice pipeline

🎯 Demo URL: http://localhost:${PORT}/demo.html
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
});