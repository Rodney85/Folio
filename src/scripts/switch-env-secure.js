#!/usr/bin/env node

/**
 * Secure Environment Switching Script for Carfolio
 * 
 * This script allows switching between development and production environments
 * without hardcoding any sensitive keys in the script itself.
 * 
 * It uses .env.development and .env.production files that you create locally
 * (from the template files) to store your environment-specific values.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Get current file path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup readline interface for prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get root directory
const rootDir = path.join(__dirname, '..');

// Target files
const envTempFile = path.join(rootDir, '.env.temp');

// Get environment from command line or prompt
const env = process.argv[2]?.toLowerCase();

if (!env || (env !== 'development' && env !== 'production')) {
  console.log('\n🔄 Carfolio Environment Switcher');
  console.log('============================\n');
  console.log('Usage: node switch-env-secure.js [development|production]\n');
  console.log('Please specify which environment to use:');
  console.log('1. development');
  console.log('2. production\n');
  
  rl.question('Enter your choice (1 or 2): ', (answer) => {
    const choice = answer.trim();
    if (choice === '1') {
      switchEnvironment('development');
    } else if (choice === '2') {
      switchEnvironment('production');
    } else {
      console.log('❌ Invalid choice. Exiting.');
      rl.close();
      process.exit(1);
    }
  });
} else {
  switchEnvironment(env);
}

/**
 * Switch to the specified environment
 */
function switchEnvironment(targetEnv) {
  console.log(`\n🔄 Switching to ${targetEnv.toUpperCase()} environment...\n`);
  
  // Check if environment file exists
  const envFile = path.join(rootDir, `.env.${targetEnv}`);
  const envTemplateFile = path.join(rootDir, `.env.${targetEnv}.template`);
  
  if (!fs.existsSync(envFile)) {
    if (fs.existsSync(envTemplateFile)) {
      console.log(`⚠️ ${envFile} does not exist. Please create it from the template:`);
      console.log(`   cp .env.${targetEnv}.template .env.${targetEnv}`);
      console.log('   Then add your sensitive values.\n');
    } else {
      console.log(`❌ Error: Neither ${envFile} nor template file exists!`);
    }
    
    if (rl) rl.close();
    process.exit(1);
  }

  try {
    // Read the environment file
    const envContent = fs.readFileSync(envFile, 'utf8');

    // Create a temporary .env file that Convex will use
    fs.writeFileSync(envTempFile, envContent);
    console.log(`✅ Created .env.temp with ${targetEnv} configuration`);
    
    console.log('\n===============================================');
    console.log(`🚀 ENVIRONMENT SWITCHED TO ${targetEnv.toUpperCase()}`);
    console.log('===============================================\n');
    console.log('To start development servers:');
    console.log('1. Run: npm run convex:dev');
    console.log('2. In another terminal: npm run dev\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  
  if (rl) rl.close();
}
