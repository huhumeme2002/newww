#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 JSON to PostgreSQL Migration Tool');
console.log('=====================================');

// Check if required files exist
const fs = require('fs');
const requiredFiles = [
  'users.json',
  'keys.json', 
  'generated_tokens.json',
  'token_usage_log.json',
  'request_transactions.json'
];

console.log('📋 Checking for JSON files...');
const missingFiles = [];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} found`);
  } else {
    console.log(`❌ ${file} missing`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log('\n⚠️  Some JSON files are missing:');
  missingFiles.forEach(file => console.log(`   - ${file}`));
  console.log('\n📝 Note: Migration will continue but missing files will be skipped.');
  console.log('   Place JSON files in the project root directory for them to be included.');
}

// Run the migration
console.log('\n🔄 Starting migration...');
console.log('This may take a few minutes depending on the amount of data.\n');

const migrationScript = path.join(__dirname, '..', 'prisma', 'migration.ts');

exec(`npx tsx ${migrationScript}`, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
  
  if (stderr) {
    console.warn('⚠️  Warnings:', stderr);
  }
  
  console.log(stdout);
});
