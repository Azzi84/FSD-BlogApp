const fs = require('fs');
const path = require('path');

/**
 * This script removes any temporary data files that might be causing confusion
 * with file loading and saving in the blog application.
 */

// Define paths to temporary data files that should be removed
const tempFilePaths = [
  path.resolve(__dirname, '..', 'apps', 'admin', 'tmp', 'blog-data.json'),
  path.resolve(__dirname, '..', 'apps', 'web', 'tmp', 'blog-data.json')
];

console.log('Cleaning up temporary data files...');

// Remove each temporary file
tempFilePaths.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed temporary file: ${filePath}`);
    } else {
      console.log(`ℹ️ File does not exist: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error removing file ${filePath}:`, error);
  }
});

// Make sure the central data directory exists
const centralDataDir = path.resolve(__dirname, '..', 'data');
if (!fs.existsSync(centralDataDir)) {
  try {
    fs.mkdirSync(centralDataDir, { recursive: true });
    console.log(`✅ Created central data directory: ${centralDataDir}`);
  } catch (error) {
    console.error(`❌ Error creating central data directory:`, error);
  }
}

console.log('Cleanup complete.');
