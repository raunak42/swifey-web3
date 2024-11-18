const fs = require('fs');
const path = require('path');

// Get the version from package.json
const packageJson = require('./node_modules/@reclaimprotocol/reactnative-sdk/package.json');
const version = packageJson.version;

// Files to patch
const filesToPatch = [
  'node_modules/@reclaimprotocol/reactnative-sdk/lib/module/Reclaim.js',
  'node_modules/@reclaimprotocol/reactnative-sdk/lib/commonjs/Reclaim.js'
];

filesToPatch.forEach(filePath => {
  const fullPath = path.resolve(__dirname, filePath);
  
  // Read the file
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replace the problematic line
  content = content.replace(
    `const sdkVersionNumber = require('../package.json').version;`,
    `const sdkVersionNumber = "${version}";`
  );
  
  // Write the file back
  fs.writeFileSync(fullPath, content);
  console.log(`Successfully patched ${filePath}`);
}); 