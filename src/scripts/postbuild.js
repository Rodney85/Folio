
import { execSync } from 'child_process';

// Check if running on Netlify
const isNetlify = process.env.NETLIFY === 'true';

if (isNetlify) {
    console.log('Skipping react-snap on Netlify to prevent timeouts.');
    process.exit(0);
}

try {
    console.log('Running react-snap...');
    execSync('react-snap', { stdio: 'inherit' });
} catch (error) {
    console.error('react-snap failed:', error);
    process.exit(1);
}
