// Test the new path resolution logic
const fs = require('fs');
const path = require('path');

function findProjectRoot() {
  let currentDir = process.cwd();
  
  // Look for pnpm-workspace.yaml to identify the project root
  while (currentDir !== path.dirname(currentDir)) {
    if (fs.existsSync(path.join(currentDir, 'pnpm-workspace.yaml'))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  
  // Fallback to process.cwd() if we can't find pnpm-workspace.yaml
  return process.cwd();
}

const projectRoot = findProjectRoot();
const dataDir = path.resolve(projectRoot, 'data');
const dataFilePath = path.join(dataDir, 'blog-data.json');

console.log('Current working directory:', process.cwd());
console.log('Project root:', projectRoot);
console.log('Data directory:', dataDir);
console.log('Data file path:', dataFilePath);
console.log('Data file exists:', fs.existsSync(dataFilePath));
