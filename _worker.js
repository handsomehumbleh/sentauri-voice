// This file enables serving static files alongside Cloudflare Functions
// It's required when you have both static assets and API routes

export default {
  async fetch(request, env) {
    // Let Cloudflare Pages handle static files and API routes
    return env.ASSETS.fetch(request);
  },
};