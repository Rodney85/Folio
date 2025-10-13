#!/usr/bin/env node

/**
 * Carfolio Demo Account Migration Script
 * This script copies the carfolio_cc demo account data from development to production or vice versa.
 * 
 * Usage: 
 * node migrate-demo-account.js dev-to-prod  # Copy from development to production
 * node migrate-demo-account.js prod-to-dev  # Copy from production to development
 */

const { ConvexHttpClient } = require('convex/browser');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Config values from switch-env.js
const convexUrls = {
  development: 'https://proficient-alpaca-745.convex.cloud',
  production: 'https://cheerful-nightingale-342.convex.cloud'
};

// Demo account username to migrate
const DEMO_USERNAME = 'carfolio_cc';

async function main() {
  // Get direction from command line
  const direction = process.argv[2];
  if (direction !== 'dev-to-prod' && direction !== 'prod-to-dev') {
    console.log('Please specify either "dev-to-prod" or "prod-to-dev"');
    process.exit(1);
  }

  console.log(`\n=== Carfolio Demo Account Migration (${direction}) ===\n`);

  const sourceEnv = direction === 'dev-to-prod' ? 'development' : 'production';
  const targetEnv = direction === 'dev-to-prod' ? 'production' : 'development';
  
  console.log(`Source environment: ${sourceEnv}`);
  console.log(`Target environment: ${targetEnv}`);
  console.log(`Demo account: ${DEMO_USERNAME}`);

  // Ask for admin tokens
  const sourceAdminToken = await promptForInput(`Enter admin token for ${sourceEnv}:`);
  const targetAdminToken = await promptForInput(`Enter admin token for ${targetEnv}:`);

  try {
    // Initialize Convex clients
    const sourceClient = new ConvexHttpClient(convexUrls[sourceEnv]);
    const targetClient = new ConvexHttpClient(convexUrls[targetEnv]);
    
    // First, find the demo user account
    console.log(`\nSearching for user "${DEMO_USERNAME}" in ${sourceEnv}...`);
    
    // You would need to implement proper admin authentication here
    // and use the appropriate Convex functions to get and set data
    
    // Example code (you'll need to replace with actual API calls):
    console.log(`\nThis is where your actual Convex API calls would happen.`);
    console.log(`For security reasons, this script is a template that needs to be completed with:`);
    console.log(`1. Proper admin authentication to both environments`);
    console.log(`2. API calls to fetch user data from source environment`);
    console.log(`3. API calls to create/update user data in target environment`);
    console.log(`4. API calls to fetch and migrate related data (cars, parts, etc.)`);

    console.log(`\nImplementation steps:`);
    console.log(`1. Use your admin token to authenticate with both environments`);
    console.log(`2. Find the user ID for ${DEMO_USERNAME} in the source environment`);
    console.log(`3. Export all user data and related records (cars, parts, settings)`);
    console.log(`4. Import data to the target environment, preserving relationships`);
    console.log(`5. Update any environment-specific fields (URLs, etc.)`);

    console.log(`\nConsult Convex documentation for proper HTTP API usage with admin tokens.`);
    
    console.log(`\n=== Migration Template Generated ===`);
    console.log(`Complete the API implementation to perform the actual migration.`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Helper function to prompt for input
function promptForInput(promptText) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(promptText + ' ', (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

main();
