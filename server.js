import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.googletagmanager.com"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.elevenlabs.io", "https://www.google-analytics.com"],
            mediaSrc: ["'self'", "blob:"],
        },
    },
}));

// CORS configuration - Updated to support demo URLs
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
        // Allow requests with no origin (like mobile apps or curl requests)
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
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const ttsLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 TTS requests per minute
    message: 'Too many voice requests, please wait a moment.',
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);
app.use('/api/text-to-speech', ttsLimiter);

// Serve static files including demo
app.use(express.static(__dirname));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'sentauri-backend',
        timestamp: new Date().toISOString(),
        cors_enabled: true,
        demo_ready: true
    });
});

// Text-to-speech endpoint
app.post('/api/text-to-speech', async (req, res) => {
    const { text, voiceId = 'qSV5UqvHBC0Widy71Esh' } = req.body;
    
    // Validate input
    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text is required' });
    }
    
    if (text.length > 1000) {
        return res.status(400).json({ error: 'Text too long (max 1000 characters)' });
    }
    
    // Check if API key is configured
    if (!process.env.ELEVENLABS_API_KEY) {
        console.error('ELEVENLABS_API_KEY not configured');
        return res.status(500).json({ error: 'Voice service not configured' });
    }
    
    try {
        // Call ElevenLabs API
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
            const error = await response.text();
            console.error('ElevenLabs API error:', error);
            
            if (response.status === 401) {
                return res.status(500).json({ error: 'Voice service authentication failed' });
            } else if (response.status === 429) {
                return res.status(429).json({ error: 'Voice service rate limit exceeded' });
            } else {
                return res.status(500).json({ error: 'Voice generation failed' });
            }
        }

        // Set appropriate headers
        res.set({
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'no-cache',
            'X-Content-Type-Options': 'nosniff'
        });

        // Stream the audio response
        response.body.pipe(res);
        
        // Log usage (you might want to store this in a database)
        console.log(`TTS request: ${text.substring(0, 50)}... (${text.length} chars)`);
        
    } catch (error) {
        console.error('TTS error:', error);
        res.status(500).json({ error: 'Failed to generate speech' });
    }
});

// Voice command processing endpoint (for future Claude integration)
app.post('/api/voice-command', async (req, res) => {
    const { command } = req.body;
    
    if (!command || typeof command !== 'string') {
        return res.status(400).json({ error: 'Command is required' });
    }
    
    // For now, just echo back success
    // In the future, this would integrate with Claude MCP
    res.json({
        success: true,
        command: command,
        response: `Processed command: ${command}`,
        timestamp: new Date().toISOString()
    });
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
🚀 Sentauri Backend Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Port: ${PORT}
🔒 Environment: ${process.env.NODE_ENV || 'development'}
📡 CORS Origins: ${allowedOrigins.join(', ')}
🔑 API Key: ${process.env.ELEVENLABS_API_KEY ? '✓ Configured' : '✗ Missing'}
🎯 Demo URL: http://localhost:${PORT}/demo.html
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
});