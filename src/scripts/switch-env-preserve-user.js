#!/usr/bin/env node

/**
 * Environment Switching Script for Carfolio
 * Modified version that preserves carfolio_cc account access across environments
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

console.log(`Switching to ${env.toUpperCase()} environment while preserving carfolio_cc access`);

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

// Modified auth config that includes both domains for cross-env access
// This allows the user carfolio_cc to be accessible in both environments
var authConfig = `// Modified for ${env} with cross-environment user access
export default {
  providers: [
    {
      // Primary domain for ${env}
      "domain": "${domains[env]}",
      "applicationID": "convex"
    },
    {
      // Secondary domain for cross-environment access
      "domain": "${domains[env === 'development' ? 'production' : 'development']}",
      "applicationID": "convex"
    }
  ],
};
`;

var tempEnvContent = `# Environment: ${env} with cross-environment user access
VITE_CONVEX_URL=${convexUrls[env]}
VITE_CLERK_PUBLISHABLE_KEY=${clerkKeys[env]}
NODE_ENV=${env}
# Flag to indicate cross-environment user access is enabled
VITE_CROSS_ENV_USER_ACCESS=true
`;

// Write files
try {
  // Auth config
  var authPath = path.join(__dirname, '..', 'convex', 'auth.config.js');
  fs.writeFileSync(authPath, authConfig);
  console.log('Updated auth config for', env, 'with cross-environment access');
  
  // Env file
  var envPath = path.join(__dirname, '..', '.env.temp');
  fs.writeFileSync(envPath, tempEnvContent);
  console.log('Created .env.temp for', env, 'with cross-environment access');
  
  console.log('\n=========================');
  console.log('SWITCHED TO ' + env.toUpperCase() + ' WITH CROSS-ENV USER ACCESS');
  console.log('=========================');
  console.log('\nTo run:');
  console.log('1. npm run convex:dev');
  console.log('2. npm run dev (in another terminal)');
  console.log('\nNote: The carfolio_cc user should now be accessible in both environments');
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
