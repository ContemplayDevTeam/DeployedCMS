// Check for Notes field in ALL tables
const AIRTABLE_API_KEY = 'patqiztxHCH8YgiMR.7783be7343140f6db8abc92bc729c3c6e76106cee56dab28b2963fb4769fa68c'
const AIRTABLE_BASE_ID = 'apps4ZTtBg4oTHLUz'

async function checkAllTables() {
  const tables = ['Image Queue', 'Image Bank', 'Users', 'Notifications']

  for (const tableName of tables) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Checking table: ${tableName}`)
    console.log('='.repeat(60))

    try {
      const recordsUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}?maxRecords=5`

      const response = await fetch(recordsUrl, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`
        }
      })

      const data = await response.json()

      if (data.error) {
        console.log(`❌ Error: ${data.error.message}`)
        continue
      }

      if (!data.records || data.records.length === 0) {
        console.log('⚠️  No records found')
        continue
      }

      // Collect all field names
      const allFieldNames = new Set()
      data.records.forEach(record => {
        Object.keys(record.fields).forEach(fieldName => {
          allFieldNames.add(fieldName)
        })
      })

      console.log(`✅ Found ${data.records.length} records`)
      console.log('\nAll fields:')
      Array.from(allFieldNames).sort().forEach(fieldName => {
        const hasNotes = fieldName.toLowerCase().includes('note')
        const marker = hasNotes ? '🔥' : '  '
        console.log(`${marker} • "${fieldName}"`)
      })

      // Check specifically for Notes
      if (allFieldNames.has('Notes')) {
        console.log('\n✅✅✅ FOUND "Notes" field in this table! ✅✅✅')

        // Show sample
        const recordWithNotes = data.records.find(r => r.fields['Notes'])
        if (recordWithNotes) {
          console.log('\nSample value:')
          console.log(`  "${recordWithNotes.fields['Notes']}"`)
        }
      }

    } catch (error) {
      console.log(`❌ Error checking table: ${error.message}`)
    }
  }
}

checkAllTables().catch(console.error)
