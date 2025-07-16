// Configuration for Sentauri Voice Demo
const config = {
    // API Configuration
    API_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000' 
        : 'https://api.sentauri.ai', // Update with your production API URL
    
    // ElevenLabs Voice ID
    VOICE_ID: 'qSV5UqvHBC0Widy71Esh',
    
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
        useElevenLabs: true, // Set to false to use browser TTS
        enableAnalytics: true,
        showDebugInfo: false,
        enableVoiceVisualization: true
    }
};

// Environment detection
const ENV = {
    isDevelopment: window.location.hostname === 'localhost',
    isProduction: window.location.hostname.includes('sentauri.ai'),
    isDemo: window.location.pathname.includes('demo')
};

// Export for use in other scripts
window.SentauriConfig = config;
window.SentauriEnv = ENV;