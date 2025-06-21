#!/usr/bin/env node

// Custom build script to handle Rollup dependency issues on Vercel
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting custom build process...');

try {
  // Remove problematic node_modules and package-lock.json
  console.log('📦 Cleaning up dependencies...');
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
  if (fs.existsSync('package-lock.json')) {
    execSync('rm -f package-lock.json', { stdio: 'inherit' });
  }

  // Install dependencies with specific flags
  console.log('📥 Installing dependencies...');
  execSync('npm install --legacy-peer-deps --omit=optional', { stdio: 'inherit' });

  // Run the actual build
  console.log('🔨 Running Vite build...');
  execSync('npx vite build', { stdio: 'inherit' });

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 