// Configuration for Sentauri Voice Demo
const config = {
    // API Configuration - Auto-detect Cloudflare deployment
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000' 
        : window.location.hostname.includes('pages.dev')
        ? '' // Use same origin for Cloudflare Pages
        : window.location.hostname.includes('sentauri.ai')
        ? '' // Use same origin for custom domain
        : 'https://api.sentauri.ai', // Fallback
    
    // Voice Service Keys (set these in environment or here for testing)
    // For production, these should be set in Cloudflare environment variables
    OPENAI_API_KEY: '', // Add your key for local testing only
    ELEVENLABS_API_KEY: '', // Add your key for local testing only
    
    // Voice IDs
    VOICE_ID: 'qSV5UqvHBC0Widy71Esh', // ElevenLabs voice
    
    // Google Analytics ID (replace with your actual ID)
    GA_ID: 'G-XXXXXXXXXX',
    
    // Demo Settings
    DEMO_SETTINGS: {
        maxCommandHistory: 10,
        commandTimeout: 30000, // 30 seconds
        animationDuration: 300,
        voiceRate: 1.0,
        voicePitch: 1.1,
        voiceVolume: 0.9
    },
    
    // Feature Flags
    FEATURES: {
        // TTS Options (priority order)
        useOpenAI: true,        // Use OpenAI TTS ($0.015/1K chars)
        useElevenLabs: false,   // Use ElevenLabs TTS ($0.30/1K chars)
        
        // Speech Recognition Options
        useWhisper: true,      // Use OpenAI Whisper (more accurate, costs $0.006/min)
        
        // AI Processing
        useGPT4: true,         // Use GPT-4 for command processing
        useCompleteAPI: false, // Use all-in-one voice endpoint
        
        // OpenAI Voices: alloy, echo, fable, onyx, nova, shimmer
        openaiVoice: 'nova',   // Female, friendly voice
        
        // Other Features
        enableAnalytics: true,
        showDebugInfo: false,
        enableVoiceVisualization: true
    },
    
    // Cost Tracking (optional)
    COST_TRACKING: {
        enabled: false,
        limits: {
            dailyBudget: 10.00,    // $10/day
            monthlyBudget: 100.00  // $100/month
        },
        rates: {
            whisper: 0.006,        // per minute
            gpt4: 0.03,           // per 1K tokens (approx)
            openaiTTS: 0.015,     // per 1K characters
            elevenLabsTTS: 0.30   // per 1K characters
        }
    }
};

// Environment detection
const ENV = {
    isDevelopment: window.location.hostname === 'localhost',
    isCloudflare: window.location.hostname.includes('pages.dev') || window.location.hostname.includes('sentauri.ai'),
    isProduction: window.location.hostname.includes('sentauri.ai'),
    isDemo: window.location.pathname.includes('demo')
};

// API Availability Check (disabled on Cloudflare - uses env vars)
const APIs = {
    hasOpenAI: ENV.isCloudflare || !!config.OPENAI_API_KEY,
    hasElevenLabs: ENV.isCloudflare || !!config.ELEVENLABS_API_KEY,
    canUseWhisper: config.FEATURES.useWhisper && (ENV.isCloudflare || config.OPENAI_API_KEY),
    canUseGPT4: config.FEATURES.useGPT4 && (ENV.isCloudflare || config.OPENAI_API_KEY)
};

// Dynamic feature adjustment based on available APIs
if (!APIs.hasOpenAI && config.FEATURES.useOpenAI && !ENV.isCloudflare) {
    console.warn('OpenAI API key not configured, falling back to ElevenLabs/Browser TTS');
    config.FEATURES.useOpenAI = false;
}

if (!APIs.hasElevenLabs && config.FEATURES.useElevenLabs && !ENV.isCloudflare) {
    console.warn('ElevenLabs API key not configured, falling back to OpenAI/Browser TTS');
    config.FEATURES.useElevenLabs = false;
}

// Export for use in other scripts
window.SentauriConfig = config;
window.SentauriEnv = ENV;
window.SentauriAPIs = APIs;
