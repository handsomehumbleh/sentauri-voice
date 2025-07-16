# 🚀 Cloudflare Pages Deployment Guide

## Overview
This project is configured to deploy on Cloudflare Pages with Cloudflare Functions for the API endpoints.

## Setup Instructions

### 1. Connect to Cloudflare Pages
1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/pages)
2. Click "Create a project"
3. Connect your GitHub repository
4. Select the `sentauri-backend` folder as the root directory

### 2. Build Configuration
- **Framework preset**: None (Static HTML)
- **Build command**: `echo "No build needed"`
- **Build output directory**: `public`
- **Root directory**: `/sentauri-backend`

### 3. Environment Variables
Add these in Cloudflare Pages > Settings > Environment Variables:

```
ELEVENLABS_API_KEY=sk_d2040368587fce2d7d6b7d1bde707a65ddc0ea11be203ebb
NODE_ENV=production
```

### 4. Custom Domain Setup
1. Go to Pages > Custom domains
2. Add your domain: `sentauri.ai`
3. Add subdomain: `www.sentauri.ai`
4. DNS will be automatically configured

## API Endpoints

The following API endpoints are available through Cloudflare Functions:

- `GET /api/health` - Health check
- `POST /api/text-to-speech` - ElevenLabs TTS proxy
- `POST /api/voice-command` - Voice command processing

## File Structure
```
sentauri-backend/
├── functions/
│   └── api/
│       ├── health.js
│       ├── text-to-speech.js
│       └── voice-command.js
├── public/
│   ├── index.html (landing page)
│   └── demo.html (voice assistant)
├── wrangler.toml
└── _worker.js
```

## Features

### ✅ Configured
- Static file serving
- API routes with Cloudflare Functions
- CORS handling
- Environment variable protection
- Custom domain support
- SSL/TLS (automatic)

### 🔄 Automatic
- Global CDN distribution
- DDoS protection
- Rate limiting (Cloudflare level)
- Analytics and monitoring
- Edge caching

## Deployment Process

1. **Push to GitHub**: All changes are automatically deployed
2. **Build time**: ~30 seconds
3. **Propagation**: ~2 minutes globally
4. **SSL**: Automatic with Cloudflare

## Monitoring & Analytics

- **Cloudflare Analytics**: Real-time traffic insights
- **Function Analytics**: API endpoint usage
- **Performance**: Core Web Vitals tracking
- **Security**: DDoS and bot protection

## Troubleshooting

### Common Issues

1. **API Key not working**
   - Check environment variables in Cloudflare dashboard
   - Ensure variable name is exactly `ELEVENLABS_API_KEY`

2. **Functions not responding**
   - Check function logs in Cloudflare dashboard
   - Verify file paths in `functions/api/` directory

3. **CORS errors**
   - Functions include CORS headers automatically
   - Check browser network tab for specific errors

### Debug Steps

1. Check deployment status in Pages dashboard
2. Review function logs for errors
3. Test API endpoints directly:
   ```bash
   curl https://sentauri.ai/api/health
   ```

## Performance Optimization

### Automatic Optimizations
- Image optimization
- CSS/JS minification
- Gzip compression
- HTTP/2 & HTTP/3
- Edge caching

### Manual Optimizations
- Add cache headers for static assets
- Implement service worker for offline functionality
- Use Cloudflare Images for image optimization

## Security Features

### Built-in Protection
- DDoS mitigation
- Bot management
- SSL/TLS encryption
- Rate limiting
- Firewall rules

### Custom Security
- Environment variable protection
- Input validation in functions
- CORS policy enforcement

## Cost Estimation

### Cloudflare Pages (Free Plan)
- ✅ 1 build at a time
- ✅ 500 builds per month
- ✅ Unlimited requests
- ✅ Unlimited bandwidth

### ElevenLabs API
- 💰 $5-22/month depending on usage
- Free tier: 10,000 characters/month

### Total Monthly Cost: $0-22

## Going Live Checklist

- [ ] Repository connected to Cloudflare Pages
- [ ] Environment variables configured
- [ ] Custom domain added and verified
- [ ] SSL certificate active
- [ ] API endpoints tested
- [ ] Demo functionality verified
- [ ] Analytics enabled
- [ ] DNS records pointing to Cloudflare

## Next Steps

1. **Deploy to Cloudflare Pages**
2. **Configure custom domain**
3. **Set environment variables**
4. **Test all functionality**
5. **Monitor usage and performance**

## Support

- **Cloudflare Support**: [dash.cloudflare.com/support](https://dash.cloudflare.com/support)
- **ElevenLabs Support**: [help.elevenlabs.io](https://help.elevenlabs.io)
- **Project Issues**: Create GitHub issue in repository