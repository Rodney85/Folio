#!/usr/bin/env node

/**
 * Environment Switching Script for Carfolio
 * Simple version that directly modifies auth.config.js
 */

var fs = require('fs');
var path = require('path');

process.stdout.write('Script starting...\n');

// Get environment from command line
var env = process.argv[2];
console.log('Environment argument:', env);

// Check valid environment
if (env !== 'development' && env !== 'production') {
  console.log('Please specify either "development" or "production"');
  process.exit(1);
}

console.log(`Switching to ${env.toUpperCase()} environment`);

// Config values
var domains = {
  development: 'https://united-piglet-38.clerk.accounts.dev',
  production: 'https://carfolio.cc'
};

var convexUrls = {
  development: 'https://proficient-alpaca-745.convex.cloud',
  production: 'https://cheerful-nightingale-342.convex.cloud'
};

var clerkKeys = {
  development: 'pk_test_dW5pdGVkLXBpZ2xldC0zOC5jbGVyay5hY2NvdW50cy5kZXYk',
  production: 'pk_live_Y2xlcmsuY2FyZm9saW8uY2Mk'
};

// Create auth config file
var authConfig = `// Auto-generated for ${env}
export default {
  providers: [
    {
      "domain": "${domains[env]}",
      "applicationID": "convex"
    }
  ],
};
`;

var tempEnvContent = `# Environment: ${env}
VITE_CONVEX_URL=${convexUrls[env]}
VITE_CLERK_PUBLISHABLE_KEY=${clerkKeys[env]}
NODE_ENV=${env}
`;

// Write files
try {
  // Auth config
  var authPath = path.join(__dirname, '..', 'convex', 'auth.config.js');
  fs.writeFileSync(authPath, authConfig);
  console.log('Updated auth config for', env);
  
  // Env file
  var envPath = path.join(__dirname, '..', '.env.temp');
  fs.writeFileSync(envPath, tempEnvContent);
  console.log('Created .env.temp for', env);
  
  console.log('\n=========================');
  console.log('SWITCHED TO ' + env.toUpperCase());
  console.log('=========================');
  console.log('\nTo run:');
  console.log('1. npm run convex:dev');
  console.log('2. npm run dev (in another terminal)');
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
