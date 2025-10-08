// Check a record with actual data
const AIRTABLE_API_KEY = 'patqiztxHCH8YgiMR.7783be7343140f6db8abc92bc729c3c6e76106cee56dab28b2963fb4769fa68c'
const AIRTABLE_BASE_ID = 'apps4ZTtBg4oTHLUz'
const IMAGE_QUEUE_TABLE = 'Image Queue'

async function checkPopulatedRecord() {
  const recordsUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(IMAGE_QUEUE_TABLE)}`

  const recordsResponse = await fetch(recordsUrl, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`
    }
  })

  const recordsData = await recordsResponse.json()

  if (!recordsData.records || recordsData.records.length === 0) {
    console.log('No records found')
    return
  }

  // Find the record with the most populated fields
  const mostPopulated = recordsData.records.reduce((prev, current) => {
    return Object.keys(current.fields).length > Object.keys(prev.fields).length ? current : prev
  })

  console.log('Most populated record:')
  console.log('Record ID:', mostPopulated.id)
  console.log('\nAll fields:')
  Object.entries(mostPopulated.fields).forEach(([key, value]) => {
    const display = typeof value === 'string' && value.length > 200
      ? value.substring(0, 200) + '...'
      : JSON.stringify(value)
    console.log(`  "${key}": ${display}`)
  })

  console.log('\n\nChecking for Notes/Metadata fields:')
  recordsData.records.forEach(record => {
    if (record.fields['Metadata']) {
      console.log(`\nRecord ${record.id}:`)
      console.log('  Metadata:', record.fields['Metadata'].substring(0, 300))
    }
  })
}

checkPopulatedRecord().catch(console.error)
