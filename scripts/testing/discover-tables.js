#!/usr/bin/env node

/**
 * Discover tables in Airtable base
 * Run with: node discover-tables.js
 */

const BASE_URL = 'http://localhost:3000'

async function discoverTables() {
  console.log('🔍 Discovering tables in Airtable base...\n')
  
  try {
    const response = await fetch(`${BASE_URL}/api/airtable/discover-tables`)
    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText)
      console.error('Error details:', data)
      return
    }
    
    // Display results
    console.log('📊 TABLE DISCOVERY RESULTS\n')
    console.log(`Overall Success: ${data.success ? '✅' : '❌'}\n`)
    
    // Discovered tables
    console.log('📋 DISCOVERED TABLES')
    console.log('='.repeat(50))
    
    if (data.discoveredTables.length === 0) {
      console.log('❌ No tables discovered')
    } else {
      data.discoveredTables.forEach(table => {
        const status = table.accessible ? '✅' : '❌'
        console.log(`${status} ${table.name}`)
        
        if (table.accessible) {
          console.log(`   Fields: ${table.fields.join(', ')}`)
          console.log(`   Records: ${table.recordCount}`)
        } else {
          console.log(`   Error: ${table.error}`)
        }
        console.log('')
      })
    }
    
    // Potential queue tables
    if (data.potentialQueueTables.length > 0) {
      console.log('🎯 POTENTIAL QUEUE TABLES')
      console.log('='.repeat(50))
      data.potentialQueueTables.forEach(table => {
        console.log(`✅ ${table.name}`)
        console.log(`   Fields: ${table.fields.join(', ')}`)
        console.log('')
      })
    }
    
    // Recommendations
    console.log('💡 RECOMMENDATIONS')
    console.log('='.repeat(50))
    console.log(`Users Table: ${data.recommendations.usersTable}`)
    console.log(`Queue Table: ${data.recommendations.queueTable}`)
    
    // Next steps
    console.log('\n🔧 NEXT STEPS')
    console.log('='.repeat(50))
    
    if (data.potentialQueueTables.length > 0) {
      console.log('1. ✅ Found potential queue table(s)')
      console.log('2. Update your airtable.ts file with the correct table name')
      console.log('3. Run the field mapping verification again')
    } else {
      console.log('1. ❌ No queue table found')
      console.log('2. Check your Airtable base for the correct table name')
      console.log('3. Make sure the table exists and is accessible')
      console.log('4. Verify table permissions in Airtable')
    }
    
    // Show how to update the code
    if (data.recommendations.queueTable !== 'Queue') {
      console.log('\n📝 CODE UPDATE NEEDED')
      console.log('='.repeat(50))
      console.log('Update your lib/airtable.ts file:')
      console.log(`Change table name from "Queue" to "${data.recommendations.queueTable}"`)
      console.log('Or update the tableIds object with the correct table ID')
    }
    
  } catch (error) {
    console.error('❌ Discovery failed:', error.message)
    console.error('Make sure your Next.js development server is running on http://localhost:3000')
  }
}

// Run the discovery
discoverTables() 