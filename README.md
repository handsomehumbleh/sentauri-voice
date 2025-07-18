# Sentauri Voice - AI-Powered Website Editor

Transform websites with voice commands using Sentauri's sophisticated AI technology. Experience the future of web development with our intuitive voice-controlled interface.

![Sentauri Voice Demo](https://img.shields.io/badge/Sentauri-Voice%20Demo-00CEC8?style=for-the-badge&logo=microphone&logoColor=white)

## 🎯 Overview

Sentauri Voice is an innovative voice-controlled website editor that demonstrates the power of AI in web development. Built with enterprise-grade technology made accessible for everyone.

### Key Features

- 🎙️ **Natural Voice Commands** - Speak naturally to edit your website
- ⚡ **Real-time Updates** - See changes instantly as you speak
- 🤖 **AI-Powered Understanding** - Advanced natural language processing
- 🎨 **Sophisticated Design** - Premium glassmorphism UI with gradient effects
- 📱 **Responsive Views** - Desktop and mobile preview modes
- 🎯 **Theme Switching** - Dark/light themes with color variations

## 🚀 Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sentauri-voice.git
cd sentauri-voice
```

2. Serve the files locally:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

3. Open in your browser:
```
http://localhost:8000
```

## 🗣️ Voice Commands

### Content Editing
- "Change the title to [your text]"
- "Change the subtitle to [your text]"
- "Change the logo to [brand name]"
- "Change the badge to [text]"
- "Change the button to [text]"

### Visual Effects
- "Add a gradient" / "Remove gradient"
- "Change background to dark/light/blue"
- "Animate the page"
- "Hide/Show the navigation"
- "Hide/Show the stats section"

### Theme Control
- "Switch to light theme"
- "Switch to dark theme"
- "Apply blue/green/purple theme"

### Navigation
- "Scroll to top/bottom"
- "Scroll to features"
- "Scroll to stats"

### Features
- "Add a new feature"
- "Remove a feature"

### Help
- "Help" or "Hello" - Get assistance

## 🛠️ Technical Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Speech Recognition**: Web Speech API
- **Design System**: Sentauri Brand Guidelines
- **Animations**: CSS Animations & JavaScript
- **Styling**: Custom CSS with CSS Variables

## 📁 Project Structure

```
sentauri-voice-updated/
├── index.html          # Landing page
├── demo.html          # Voice demo interface
├── assets/
│   ├── css/
│   │   ├── main.css   # Landing page styles
│   │   └── demo.css   # Demo interface styles
│   └── js/
│       ├── sentauri-app.js      # Landing page scripts
│       ├── voice-recognition.js  # Voice processing
│       ├── animations.js        # Animation controller
│       └── demo.js             # Main demo controller
├── docs/
│   └── brand-guidelines.md
└── README.md
```

## 🎨 Design System

### Color Palette
- **Sentauri Blue**: #3B82F6
- **Sentauri Cyan**: #00CEC8
- **Sentauri Green**: #4ADE80
- **Dark Background**: #0F172A
- **Glass Overlay**: rgba(255, 255, 255, 0.05)

### Typography
- **Headers**: Georgia, serif (light weight)
- **Body**: system-ui, -apple-system, sans-serif

### Effects
- Glassmorphism with backdrop blur
- Gradient animations
- Neural network background patterns
- Floating elements with parallax

## 📊 Analytics & Tracking

The demo includes analytics tracking placeholders for:
- Voice command usage
- Conversion metrics
- Performance monitoring
- User engagement

## 🔧 Customization

### Adding New Commands

1. Open `assets/js/demo.js`
2. Add your command in the `CommandProcessor.process()` method:

```javascript
else if (lowerCommand.includes('your_command')) {
    result = this.yourCustomMethod(command);
}
```

3. Implement your custom method:

```javascript
yourCustomMethod(command) {
    // Your logic here
    return {
        success: true,
        message: "Command executed successfully",
        action: 'your_action'
    };
}
```

### Styling Modifications

Use CSS variables for easy theming:

```css
:root {
    --sentauri-blue: #3B82F6;
    --sentauri-cyan: #00CEC8;
    --sentauri-green: #4ADE80;
}
```

## 🌐 Browser Support

- ✅ Chrome (Recommended)
- ✅ Edge
- ⚠️ Safari (Limited voice support)
- ⚠️ Firefox (Limited voice support)

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-friendly interface
- Mobile preview mode in demo

## 🚀 Deployment

### Static Hosting (Recommended)

Deploy to any static hosting service:

- **Netlify**: Drop folder into Netlify
- **Vercel**: `vercel --prod`
- **GitHub Pages**: Enable in repository settings

### Custom Domain

1. Upload files to your hosting
2. Configure DNS settings
3. Set up SSL certificate

## 🐛 Troubleshooting

### Microphone Not Working
- Check browser permissions
- Ensure HTTPS connection
- Try Chrome or Edge browsers

### Voice Recognition Issues
- Speak clearly and naturally
- Check internet connection
- Verify microphone is working

### Animation Performance
- Reduce effects on older devices
- Check GPU acceleration
- Update graphics drivers

## 📈 Performance Optimization

- Lazy loading for assets
- CSS animations over JavaScript
- Efficient event delegation
- Optimized animation frame rates

## 🔒 Security

- Content Security Policy headers
- HTTPS requirement for voice API
- No external dependencies
- Client-side only processing

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

Built with ❤️ by the Sentauri Team

- **Website**: [sentauri.ai](https://sentauri.ai)
- **Email**: hello@sentauri.ai
- **Discord**: [Join our community](https://discord.gg/sentauri)

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] Custom voice models
- [ ] Advanced animations
- [ ] Template library
- [ ] Export functionality
- [ ] Collaboration features

---

**Experience the future of web development with Sentauri Voice**

*"Sophisticated Tech Made Accessible"*