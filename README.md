# Sentauri Backend - Production Deployment Guide

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your ELEVENLABS_API_KEY

# Run development server
npm run dev
```

### Production Deployment

#### Option 1: Node.js Server (VPS, EC2, etc.)
```bash
# Clone repository
git clone <your-repo>
cd sentauri-backend

# Install production dependencies
npm ci --only=production

# Set environment variables
export ELEVENLABS_API_KEY=your_api_key_here
export NODE_ENV=production
export PORT=3000

# Start server (use PM2 for production)
npm install -g pm2
pm2 start server.js --name sentauri-backend
pm2 save
pm2 startup
```

#### Option 2: Docker
```bash
# Build image
docker build -t sentauri-backend .

# Run container
docker run -d \
  -p 3000:3000 \
  -e ELEVENLABS_API_KEY=your_api_key_here \
  -e NODE_ENV=production \
  --name sentauri \
  sentauri-backend
```

#### Option 3: Vercel Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Set environment variables in Vercel dashboard

#### Option 4: Railway/Render/Fly.io
These platforms auto-detect Node.js apps:
1. Connect your GitHub repo
2. Set environment variables in dashboard
3. Deploy automatically

## 🔒 Security Checklist

### Required Environment Variables
```env
ELEVENLABS_API_KEY=sk_your_actual_key_here
NODE_ENV=production
PORT=3000
```

### NGINX Configuration (if using reverse proxy)
```nginx
server {
    listen 80;
    server_name sentauri.ai www.sentauri.ai;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sentauri.ai www.sentauri.ai;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Monitoring

### Health Check
```bash
curl https://sentauri.ai/api/health
```

### Logging with PM2
```bash
pm2 logs sentauri-backend
pm2 monit
```

### Rate Limiting
- API: 100 requests per 15 minutes per IP
- TTS: 10 requests per minute per IP

## 🎯 API Endpoints

### Text-to-Speech
```bash
POST /api/text-to-speech
Content-Type: application/json

{
  "text": "Hello, I'm Sentauri",
  "voiceId": "qSV5UqvHBC0Widy71Esh"
}

Response: audio/mpeg stream
```

### Health Check
```bash
GET /api/health

Response:
{
  "status": "ok",
  "service": "sentauri-backend",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🐛 Troubleshooting

### "Voice service not configured"
- Check ELEVENLABS_API_KEY is set correctly
- Verify API key is active on ElevenLabs dashboard

### CORS errors
- Update ALLOWED_ORIGINS in server.js for your domain
- Ensure HTTPS is configured

### High latency
- Consider caching frequently used phrases
- Use CDN for static assets
- Upgrade ElevenLabs plan for priority processing

## 📈 Scaling

### Horizontal Scaling with PM2
```bash
pm2 scale sentauri-backend 4  # Run 4 instances
```

### Redis for Rate Limiting (optional)
```javascript
// Add to server.js
import RedisStore from 'rate-limit-redis';
import Redis from 'redis';

const redisClient = Redis.createClient({
  url: process.env.REDIS_URL
});

const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient
  }),
  // ... rest of config
});
```

## 📝 License
MIT