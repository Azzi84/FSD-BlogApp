// This file triggers an initialization of the blog data
const fs = require('fs');
const path = require('path');

// Define paths
const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.resolve(projectRoot, 'data');
const dataFilePath = path.join(dataDir, 'blog-data.json');

// Sample data to initialize
const samplePosts = [
  {
    id: 1,
    title: "Boost your conversion rate",
    urlId: "boost-your-conversion-rate",
    description: "Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel iusto corrupti dicta laboris incididunt.",
    content: "# Title 1\n\nIllo **sint voluptas**. Error voluptates culpa eligendi. \nHic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. \nSed exercitationem placeat consectetur nulla deserunt vel \niusto corrupti dicta laboris incididunt.\n\n## Subtitle 1\n\nIllo sint *voluptas*. Error voluptates culpa eligendi. \nHic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. \nSed exercitationem placeat consectetur nulla deserunt vel \niusto corrupti dicta laboris incididunt. ... post1",
    imageUrl: "https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-4.0.3&auto=format&fit=crop&w=3603&q=80",
    date: new Date("Apr 18, 2022").toISOString(),
    category: "Node",
    tags: "Back-End,Databases",
    views: 320,
    likes: 3,
    active: true,
  }
];

async function init() {
  console.log('Initializing blog data...');
  
  try {
    // Ensure the data directory exists
    if (!fs.existsSync(dataDir)) {
      console.log(`Creating directory: ${dataDir}`);
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // If the data file doesn't exist, create it with sample data
    if (!fs.existsSync(dataFilePath)) {
      console.log(`Creating initial blog data file: ${dataFilePath}`);
      fs.writeFileSync(dataFilePath, JSON.stringify(samplePosts, null, 2));
      console.log('Initial blog data file created successfully!');
    } else {
      console.log(`Blog data file already exists: ${dataFilePath}`);
      // Optionally read and display current data
      const currentData = fs.readFileSync(dataFilePath, 'utf-8');
      try {
        const posts = JSON.parse(currentData);
        console.log(`Current blog data contains ${posts.length} posts.`);
      } catch (parseError) {
        console.error('Error parsing existing data file:', parseError);
      }
    }
    
    console.log('Blog data initialization complete!');
  } catch (error) {
    console.error('Error during initialization:', error);
    process.exit(1);
  }
}

init();
