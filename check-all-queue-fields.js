// Check all fields in the Image Queue table in Airtable
const AIRTABLE_API_KEY = 'patqiztxHCH8YgiMR.7783be7343140f6db8abc92bc729c3c6e76106cee56dab28b2963fb4769fa68c'
const AIRTABLE_BASE_ID = 'apps4ZTtBg4oTHLUz'
const IMAGE_QUEUE_TABLE = 'Image Queue'

async function checkAllFields() {
  console.log('Fetching records from Image Queue table to inspect fields...\n')

  // Fetch all records to see what fields exist
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

  // Collect all unique field names across all records
  const allFieldNames = new Set()
  recordsData.records.forEach(record => {
    Object.keys(record.fields).forEach(fieldName => {
      allFieldNames.add(fieldName)
    })
  })

  console.log('📊 All unique field names found across all records:')
  console.log('='.repeat(60))
  Array.from(allFieldNames).sort().forEach(fieldName => {
    console.log(`  • "${fieldName}"`)
  })

  console.log('\n📄 Sample record (first record):')
  console.log('='.repeat(60))
  const sampleRecord = recordsData.records[0]
  console.log('Record ID:', sampleRecord.id)
  console.log('Created Time:', sampleRecord.createdTime)
  console.log('\nFields in this record:')
  Object.keys(sampleRecord.fields).forEach(fieldName => {
    const value = sampleRecord.fields[fieldName]
    const displayValue = typeof value === 'string' && value.length > 100
      ? value.substring(0, 100) + '...'
      : JSON.stringify(value)
    console.log(`  • "${fieldName}": ${displayValue}`)
  })

  // Check for the fields we need
  console.log('\n🔍 Checking for required fields:')
  console.log('='.repeat(60))
  const requiredFields = [
    'Image Name',
    'Image Info',
    'Home Blurb Text',
    'Home Blurb Name',
    'Experience Type',
    'Is Live',
    'Sort Order',
    'Info Link',
    'Image URL'
  ]

  requiredFields.forEach(fieldName => {
    const exists = allFieldNames.has(fieldName)
    console.log(`  ${exists ? '✅' : '❌'} "${fieldName}"`)
  })
}

checkAllFields().catch(console.error)
