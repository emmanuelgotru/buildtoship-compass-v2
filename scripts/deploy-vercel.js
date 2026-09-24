#!/usr/bin/env node
// Simple Vercel deploy via API token
// Usage: VERCEL_TOKEN=vercel_xxx node scripts/deploy-vercel.js

const fs = require('fs');
const path = require('path');

async function deploy() {
  const token = process.env.VERCEL_TOKEN || process.env.VITE_VERCEL_TOKEN || localStorage?.getItem?.('btc_vercel_token');
  if (!token) {
    console.log('❌ No VERCEL_TOKEN found. Set env var: export VERCEL_TOKEN=vercel_xxx');
    console.log('Get token at https://vercel.com/account/tokens');
    return;
  }

  console.log('📦 Building...');
  const { execSync } = require('child_process');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (e) {
    console.log('Build failed');
    return;
  }

  console.log('🚀 Deploying to Vercel...');
  // For simplicity, use vercel CLI if available, else API
  try {
    // Try CLI
    execSync(`npx vercel --prod --yes --token ${token}`, { stdio: 'inherit' });
    console.log('✅ Deployed via CLI');
  } catch {
    console.log('CLI failed, trying API upload...');
    // API deploy would need file upload logic - recommend using CLI or dashboard
    console.log('Please use: npx vercel --prod --token YOUR_TOKEN');
  }
}

deploy();
