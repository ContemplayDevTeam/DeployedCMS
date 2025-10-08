// Check specifically for Notes field in Image Queue table
const AIRTABLE_API_KEY = 'patqiztxHCH8YgiMR.7783be7343140f6db8abc92bc729c3c6e76106cee56dab28b2963fb4769fa68c'
const AIRTABLE_BASE_ID = 'apps4ZTtBg4oTHLUz'
const IMAGE_QUEUE_TABLE = 'Image Queue'

async function checkNotesField() {
  console.log('Checking for "Notes" field in Image Queue table...\n')

  // Fetch ALL records to see all possible fields
  const recordsUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(IMAGE_QUEUE_TABLE)}`

  const recordsResponse = await fetch(recordsUrl, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`
    }
  })

  const recordsData = await recordsResponse.json()

  if (recordsData.error) {
    console.error('❌ Error:', recordsData.error)
    return
  }

  if (!recordsData.records || recordsData.records.length === 0) {
    console.log('⚠️  No records found in table')
    return
  }

  console.log(`✅ Found ${recordsData.records.length} records\n`)

  // Collect all unique field names (case-sensitive)
  const allFieldNames = new Set()
  recordsData.records.forEach(record => {
    Object.keys(record.fields).forEach(fieldName => {
      allFieldNames.add(fieldName)
    })
  })

  console.log('📊 All unique field names (case-sensitive):')
  console.log('='.repeat(60))
  const sortedFields = Array.from(allFieldNames).sort()
  sortedFields.forEach(fieldName => {
    console.log(`  • "${fieldName}"`)
  })

  // Check specifically for "Notes" field (exact match)
  console.log('\n🔍 Searching for "Notes" field:')
  console.log('='.repeat(60))

  const notesFieldExists = allFieldNames.has('Notes')

  if (notesFieldExists) {
    console.log('✅ YES - "Notes" field EXISTS!')

    // Find a record with Notes populated
    const recordsWithNotes = recordsData.records.filter(r => r.fields['Notes'])

    if (recordsWithNotes.length > 0) {
      console.log(`\n✅ Found ${recordsWithNotes.length} records with Notes populated`)
      console.log('\nSample Notes value:')
      const sample = recordsWithNotes[0].fields['Notes']
      console.log(`  "${sample.substring(0, 200)}${sample.length > 200 ? '...' : ''}"`)
    } else {
      console.log('\n⚠️  "Notes" field exists but is empty in all records')
    }
  } else {
    console.log('❌ NO - "Notes" field does NOT exist')

    // Check for similar field names
    console.log('\n🔍 Checking for similar field names:')
    const similar = sortedFields.filter(f =>
      f.toLowerCase().includes('note') ||
      f.toLowerCase().includes('info') ||
      f.toLowerCase().includes('description') ||
      f.toLowerCase().includes('detail')
    )

    if (similar.length > 0) {
      console.log('  Similar fields found:')
      similar.forEach(f => console.log(`    • "${f}"`))
    } else {
      console.log('  No similar fields found')
    }
  }

  // Also check for case variations
  console.log('\n🔍 Checking for case variations:')
  const variations = ['Notes', 'notes', 'NOTES', 'Note', 'note']
  variations.forEach(variant => {
    if (allFieldNames.has(variant)) {
      console.log(`  ✅ Found: "${variant}"`)
    }
  })
}

checkNotesField().catch(console.error)
