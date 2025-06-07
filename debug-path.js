// Test script to check path resolution
const path = require('path');

console.log('Current working directory:', process.cwd());
console.log('__dirname would be:', __dirname);

// Simulate what the persistence.ts file is doing
const projectRoot = path.resolve(__dirname, '..', '..', '..', '..');
const dataDir = path.resolve(projectRoot, 'data');
const dataFilePath = path.join(dataDir, 'blog-data.json');

console.log('Project root:', projectRoot);
console.log('Data directory:', dataDir);
console.log('Data file path:', dataFilePath);
