const Airtable = require('airtable');

// This script helps verify your Airtable setup
// Run with: node scripts/verify-setup.js

async function verifySetup() {
  const apiKey = process.env.AIRTABLE_API_KEY || 'pat7OlfrIjGxb9zT4.70dffbf37f8a9ff8e823b9d38fb01890e335cc5ee3eb2ce4e5e59a7e067619e0';
  const baseId = process.env.AIRTABLE_BASE_ID;

  console.log('🔍 Verifying Airtable Setup...\n');

  if (!baseId) {
    console.log('❌ AIRTABLE_BASE_ID is not set in your environment variables');
    console.log('   Please create a .env.local file with your Base ID');
    console.log('   Example: AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX\n');
    return;
  }

  console.log(`✅ API Key: ${apiKey ? 'Set' : 'Missing'}`);
  console.log(`✅ Base ID: ${baseId}\n`);

  try {
    const base = new Airtable({ apiKey }).base(baseId);
    
    console.log('🔗 Testing connection to Airtable...');
    
    // Test connection by listing tables
    const tables = await base.tables();
    
    console.log(`✅ Successfully connected to Airtable!`);
    console.log(`📊 Found ${tables.length} table(s):`);
    
    tables.forEach(table => {
      console.log(`   - ${table.name}`);
    });

    // Check for required tables
    const requiredTables = ['Users', 'Image Queue'];
    const foundTables = tables.map(t => t.name);
    
    console.log('\n📋 Checking required tables:');
    requiredTables.forEach(tableName => {
      if (foundTables.includes(tableName)) {
        console.log(`   ✅ ${tableName} - Found`);
      } else {
        console.log(`   ❌ ${tableName} - Missing (needs to be created)`);
      }
    });

    console.log('\n🎉 Setup verification complete!');
    
  } catch (error) {
    console.log('❌ Failed to connect to Airtable:');
    console.log(`   Error: ${error.message}`);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Check if your Base ID is correct');
    console.log('   2. Verify your API key has access to this base');
    console.log('   3. Make sure the base exists and is accessible');
  }
}

verifySetup().catch(console.error); 