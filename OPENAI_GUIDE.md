# OpenAI Integration Guide for Sentauri Voice

This guide shows you how to use OpenAI's Whisper + GPT-4 + TTS as a cost-effective alternative to ElevenLabs.

## 🚀 Quick Start

### 1. Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

### 2. Configure Your Environment

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your key
OPENAI_API_KEY=sk-your-actual-key-here
```

### 3. Install Dependencies & Run

```bash
# Install new dependencies
npm install

# Run the OpenAI-enhanced server
node server-openai.js

# In another terminal, run the demo
npm run demo

# Open http://localhost:8080/demo.html
```

## 💰 Cost Comparison

For a typical 5-minute demo session:

| Service | Cost | Features |
|---------|------|----------|
| **ElevenLabs Only** | ~$0.45 | TTS only |
| **OpenAI (Whisper + GPT-4 + TTS)** | ~$0.15 | Full AI processing |
| **Browser APIs + OpenAI TTS** | ~$0.03 | Basic commands |

## 🎯 Configuration Options

### config.js Settings

```javascript
FEATURES: {
    // TTS Priority (tries in order)
    useOpenAI: true,        // ✅ Recommended
    useElevenLabs: false,   // Optional fallback
    
    // Advanced Features
    useWhisper: true,       // More accurate speech recognition
    useGPT4: true,         // Natural language understanding
    
    // OpenAI Voices
    openaiVoice: 'nova',   // Options: alloy, echo, fable, onyx, nova, shimmer
}
```

## 🎤 Available Endpoints

### 1. Speech-to-Text (Whisper)
```bash
POST /api/speech-to-text
Content-Type: multipart/form-data

audio: [audio file]
```

### 2. Text-to-Speech (OpenAI)
```bash
POST /api/text-to-speech/openai
Content-Type: application/json

{
  "text": "Hello from Sentauri",
  "voice": "nova"
}
```

### 3. Command Processing (GPT-4)
```bash
POST /api/process-command
Content-Type: application/json

{
  "command": "Make the background blue with a gradient"
}
```

### 4. Complete Voice Pipeline
```bash
POST /api/voice-interact
Content-Type: multipart/form-data

audio: [audio file]
# OR
transcript: "Your command text"
```

## 🧠 GPT-4 Command Examples

With GPT-4 enabled, you can use more natural commands:

- ❌ Old: "Change title to Welcome"
- ✅ New: "Can you update the main heading to say Welcome to our site?"

- ❌ Old: "Make background blue"
- ✅ New: "I'd like a nice blue gradient background, maybe something calming"

- ❌ Old: "Add feature"
- ✅ New: "Add a new feature card about customer support"

## 🔧 Switching Between Services

### Use Only Browser APIs (Free)
```javascript
// In config.js
FEATURES: {
    useOpenAI: false,
    useElevenLabs: false,
    useWhisper: false,
    useGPT4: false
}
```

### Use OpenAI for Everything
```javascript
// In config.js
FEATURES: {
    useOpenAI: true,
    useElevenLabs: false,
    useWhisper: true,
    useGPT4: true
}
```

### Hybrid Mode (Recommended)
```javascript
// In config.js
FEATURES: {
    useOpenAI: true,      // For TTS
    useElevenLabs: false,
    useWhisper: false,    // Use browser speech recognition
    useGPT4: true        // For smart commands
}
```

## 📊 Monitoring Usage

The server logs all API calls:

```
OpenAI TTS: Hello! I'm Sentauri... (23 chars)
GPT-4 Command: Make the background blue
Whisper: Transcribed 3.2 seconds of audio
```

## 🚨 Troubleshooting

### "OpenAI API not configured"
- Check your API key in `.env`
- Ensure the key starts with `sk-`
- Verify the key is active in OpenAI dashboard

### High Latency
- Whisper can take 1-2 seconds for transcription
- GPT-4 adds 1-2 seconds for processing
- Consider using browser speech recognition for faster response

### Rate Limits
- OpenAI: 3 RPM for free tier, 60 RPM for paid
- Implement retry logic for production

## 🎯 Best Practices

1. **Start Simple**: Use browser APIs + OpenAI TTS
2. **Add Intelligence**: Enable GPT-4 for natural commands
3. **Improve Accuracy**: Add Whisper for better recognition
4. **Monitor Costs**: Track usage in OpenAI dashboard

## 💡 Next Steps

1. Test the demo with different voice commands
2. Adjust the GPT-4 prompt in `server-openai.js` for your use case
3. Add custom command handlers
4. Deploy to production with proper API key management

---

Questions? Check the [OpenAI docs](https://platform.openai.com/docs) or open an issue!