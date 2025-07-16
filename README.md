# Sentauri Voice - AI Assistant Demo

🎤 **Transform websites with voice commands using AI**

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/handsomehumbleh/sentauri-voice)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/handsomehumbleh/sentauri-voice)

## 🌟 Features

- **Voice-Controlled Website Editing** - Modify websites in real-time using natural language
- **AI-Powered Responses** - Sentauri responds with context-aware voice feedback
- **Real-Time Animations** - Voice-responsive avatar with frequency visualization
- **ElevenLabs Integration** - High-quality text-to-speech voices
- **Browser Fallback** - Works even without ElevenLabs API key
- **Analytics Ready** - Google Analytics 4 integration for tracking

## 🚀 Quick Start - Demo

### Option 1: Run Demo Locally (No Backend Required)

```bash
# Clone the repository
git clone https://github.com/handsomehumbleh/sentauri-voice.git
cd sentauri-voice

# Run the demo (choose one)
npm run demo          # Uses Python
npm run demo:node     # Uses Node.js/npx serve

# Open http://localhost:8080/demo.html
```

### Option 2: Full Stack with ElevenLabs

```bash
# Install dependencies
npm install

# Create .env file
echo "ELEVENLABS_API_KEY=your_api_key_here" > .env

# Run the backend
npm run dev

# In another terminal, run the demo
npm run demo

# Backend: http://localhost:3000
# Demo: http://localhost:8080/demo.html
```

## 🎯 Voice Commands

Try these commands in the demo:

- **"Change the title to [your text]"** - Updates the main heading
- **"Make the background [blue/green/red/yellow/dark]"** - Changes background color
- **"Change the subtitle to [your text]"** - Updates the tagline
- **"Change button color to [green/red/purple]"** - Modifies CTA button
- **"Change button text to [your text]"** - Updates button label
- **"Add a new feature"** - Adds a feature card
- **"Remove a feature"** - Removes the last feature
- **"Animate the page"** - Triggers animations
- **"Hello"** or **"Help"** - Get assistance

## 📁 Project Structure

```
sentauri-voice/
├── demo.html          # Main demo interface
├── demo.js           # Voice interaction logic
├── config.js         # Configuration settings
├── server.js         # Backend API server
├── package.json      # Dependencies and scripts
├── .env.example      # Environment template
└── README.md         # This file
```

## 🔧 Configuration

### Frontend Configuration (config.js)

```javascript
const config = {
    API_URL: 'http://localhost:3000',     // Your backend URL
    VOICE_ID: 'qSV5UqvHBC0Widy71Esh',   // ElevenLabs voice
    GA_ID: 'G-XXXXXXXXXX',               // Google Analytics ID
    FEATURES: {
        useElevenLabs: true,             // Use ElevenLabs TTS
        enableAnalytics: true,           // Track events
        enableVoiceVisualization: true   // Show voice waveform
    }
};
```

### Backend Environment (.env)

```env
ELEVENLABS_API_KEY=your_api_key_here
NODE_ENV=production
PORT=3000
```

## 🌐 Deployment

### Deploy Demo Only (Static Sites)

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set root directory to: .
# Set build command to: (leave empty)
# Set output directory to: .
```

#### Netlify
1. Drag and drop the project folder to Netlify
2. Or use Git deployment with these settings:
   - Build command: (leave empty)
   - Publish directory: .
   - Site will be available at: your-site.netlify.app/demo.html

#### GitHub Pages
1. Go to Settings → Pages
2. Source: Deploy from branch
3. Branch: main, folder: / (root)
4. Access at: username.github.io/sentauri-voice/demo.html

### Deploy Full Stack (Backend + Demo)

#### Railway/Render
1. Connect GitHub repository
2. Set environment variables:
   ```
   ELEVENLABS_API_KEY=your_key
   NODE_ENV=production
   ```
3. Deploy automatically

#### Heroku
```bash
heroku create sentauri-voice
heroku config:set ELEVENLABS_API_KEY=your_key
git push heroku main
```

## 📊 Analytics Setup

1. Create a Google Analytics 4 property
2. Get your Measurement ID (G-XXXXXXXXXX)
3. Update `config.js`:
   ```javascript
   GA_ID: 'G-YOUR-ACTUAL-ID'
   ```

### Tracked Events
- `demo_started` - User begins voice interaction
- `voice_command` - Each command spoken
- `command_success` - Successful execution
- `test_voice_clicked` - Voice test button
- `speech_error` - Recognition errors

## 🔒 Security

### CORS Configuration
The backend includes CORS headers for:
- Local development (localhost:8080, 8000)
- Production domains (sentauri.ai)
- Common deployment platforms

To add your domain:
```javascript
// In server.js
const allowedOrigins = [
    'https://your-domain.com',
    // ... other origins
];
```

### Rate Limiting
- API: 100 requests per 15 minutes
- TTS: 10 requests per minute

## 🧪 Browser Support

| Feature | Chrome | Edge | Safari | Firefox |
|---------|--------|------|--------|---------|
| Speech Recognition | ✅ | ✅ | ⚠️ | ⚠️ |
| ElevenLabs TTS | ✅ | ✅ | ✅ | ✅ |
| Browser TTS | ✅ | ✅ | ✅ | ✅ |
| Voice Visualization | ✅ | ✅ | ✅ | ✅ |

⚠️ = Limited support, fallbacks available

## 🛠️ Development

### Adding New Commands

1. Edit `demo.js` in the `processCommand()` function:
```javascript
else if (lowerCommand.includes('your_command')) {
    performAction();
    responseText = "Action completed!";
    actionTaken = true;
}
```

2. Add the action function:
```javascript
function performAction() {
    // Your code here
    document.getElementById('element').style.property = 'value';
}
```

### Customizing the Avatar

Modify CSS in `demo.html`:
```css
.assistant-avatar {
    background: linear-gradient(135deg, #your-color-1, #your-color-2);
    /* Adjust size, animations, etc. */
}
```

### Using Different Voices

Get voice IDs from [ElevenLabs](https://elevenlabs.io/voice-library):
```javascript
// In config.js
VOICE_ID: 'different_voice_id_here'
```

## 🐛 Troubleshooting

### "Speech recognition not supported"
- Use Chrome or Edge for best results
- Ensure microphone permissions are granted
- Check HTTPS connection (required for speech API)

### "Voice service not configured"
- Add your ElevenLabs API key to `.env`
- Restart the backend server
- Check API key validity

### CORS Errors
- Ensure backend is running
- Check `API_URL` in `config.js`
- Verify your domain is in `allowedOrigins`

### No Audio Output
- Check browser audio permissions
- Verify ElevenLabs API quota
- Test with browser TTS (set `useElevenLabs: false`)

## 📈 Performance Tips

1. **Optimize API Calls**
   - Cache common phrases
   - Implement request debouncing
   - Use browser TTS for non-critical responses

2. **Improve Load Time**
   - Minify JS/CSS for production
   - Use CDN for static assets
   - Enable gzip compression

3. **Scale Backend**
   - Use PM2 for process management
   - Implement Redis for rate limiting
   - Deploy behind a load balancer

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [ElevenLabs](https://elevenlabs.io) for voice synthesis
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) for recognition
- [Claude](https://claude.ai) for AI assistance

---

Built with ❤️ by the Sentauri Team

**Need help?** Open an issue or reach out at hello@sentauri.ai