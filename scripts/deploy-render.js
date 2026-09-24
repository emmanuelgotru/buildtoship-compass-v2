#!/usr/bin/env node
// Render deploy via API key
// Usage: RENDER_API_KEY=rnd_xxx GITHUB_REPO=https://github.com/you/repo node scripts/deploy-render.js

async function deployRender() {
  const apiKey = process.env.RENDER_API_KEY || process.env.BTC_RENDER_KEY;
  const repo = process.env.GITHUB_REPO;

  if (!apiKey) {
    console.log('❌ No RENDER_API_KEY. Get at https://dashboard.render.com/u/settings -> API Keys');
    return;
  }
  if (!repo) {
    console.log('❌ Set GITHUB_REPO env var: export GITHUB_REPO=https://github.com/you/buildtoship-compass');
    return;
  }

  console.log('🚀 Creating Render service...');
  
  const body = {
    type: "web_service",
    name: `buildtoship-${Date.now().toString().slice(-4)}`,
    repo: repo,
    branch: "main",
    buildCommand: "npm install && npm run build",
    startCommand: "npm run preview -- --host 0.0.0.0 --port $PORT",
    rootDir: "",
    envVars: [
      { key: "NODE_VERSION", value: "18" }
    ],
    plan: "free"
  };

  try {
    const res = await fetch('https://api.render.com/v1/services', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ Render service created:', data.service?.name, data.service?.id);
      console.log('URL will be available in Render dashboard');
    } else {
      console.log('❌ Failed:', JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}

deployRender();
