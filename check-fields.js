async function checkFields() {
  const apiKey = 'patqiztxHCH8YgiMR.7783be7343140f6db8abc92bc729c3c6e76106cee56dab28b2963fb4769fa68c';
  const baseId = 'apps4ZTtBg4oTHLUz';

  console.log('Checking Image Queue table fields...\n');

  try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/Image%20Queue?maxRecords=10`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();

    if (data.records && data.records.length > 0) {
      console.log(`✅ Found ${data.records.length} records in Image Queue table\n`);

      // Collect all unique fields across all records
      const allFields = new Set();
      data.records.forEach(record => {
        Object.keys(record.fields).forEach(field => allFields.add(field));
      });

      console.log('✅ All fields found in Image Queue table:');
      console.log('==========================================');
      Array.from(allFields).sort().forEach(field => {
        // Find first record with this field to show type
        const record = data.records.find(r => r.fields[field] !== undefined);
        if (record) {
          const value = record.fields[field];
          const type = Array.isArray(value) ? 'array' : typeof value;
          console.log(`  • ${field} (type: ${type})`);
        }
      });

      console.log('\n🔍 Looking for "Experience Type" field...');
      if (allFields.has('Experience Type')) {
        console.log('✅ YES - "Experience Type" field exists!');
        const recordWithField = data.records.find(r => r.fields['Experience Type']);
        if (recordWithField) {
          console.log('   Sample value:', recordWithField.fields['Experience Type']);
        }
      } else {
        console.log('❌ NO - "Experience Type" field not found');
      }
    } else {
      console.log('❌ No records found in Image Queue table');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkFields();
