interface User {
  id?: string
  email: string
  isVerified: boolean
  isPaid: boolean
  subscriptionTier: 'Free' | 'Basic' | 'Pro' // Updated to match actual Airtable values
  createdDate: string
  lastLogin: string
}

interface QueueItem {
  id?: string
  userEmail: string
  imageUrl: string
  fileName: string
  fileSize: number
  status: 'queued' | 'processing' | 'published' | 'failed'
  uploadDate: string
  publishDate?: string
  notes?: string
  priority: number
}

export class AirtableBackend {
  private apiKey: string
  private baseId: string
  private baseUrl: string

  constructor(apiKey: string, baseId: string) {
    this.apiKey = apiKey
    this.baseId = baseId
    this.baseUrl = `https://api.airtable.com/v0/${baseId}`
    
    // Table IDs for this base
    this.tableIds = {
      users: 'Users', // Updated to use the correct table name
      queue: 'Image Queue' // Updated to use the correct table name
    }
  }

  private tableIds: {
    users: string
    queue: string
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    console.log('🔗 Making Airtable request to:', endpoint)
    console.log('🔧 Request method:', options.method || 'GET')
    
    const url = `${this.baseUrl}${endpoint}`
    console.log('🌐 Full URL:', url)
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      console.log('📡 Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Airtable API error response:')
        console.error('   Status:', response.status, response.statusText)
        console.error('   Headers:', Object.fromEntries(response.headers.entries()))
        console.error('   Body:', errorText)
        
        throw new Error(`Airtable API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const responseData = await response.json()
      console.log('✅ Airtable request successful')
      return responseData
    } catch (error) {
      console.error('💥 Request failed:', error)
      throw error
    }
  }

  // User management
  async createUser(userData: {
    email: string
    isVerified?: boolean
  }): Promise<User> {
    try {
      const response = await this.makeRequest(`/${this.tableIds.users}`, {
        method: 'POST',
        body: JSON.stringify({
          records: [{
            fields: {
              'Email': userData.email,
              'Is Verified': userData.isVerified || false,
              'Is Paid': false,
              'Subscription Tier': 'Free', // Changed from 'free' to 'Free' to match existing data
              'Created Date': new Date().toISOString().split('T')[0], // Use YYYY-MM-DD format
              'Last Login': new Date().toISOString().split('T')[0] // Use YYYY-MM-DD format
            }
          }]
        })
      })

      const record = response.records[0]
      return {
        id: record.id,
        email: record.fields['Email'] as string,
        isVerified: record.fields['Is Verified'] as boolean,
        isPaid: record.fields['Is Paid'] as boolean,
        subscriptionTier: record.fields['Subscription Tier'] as 'Free' | 'Basic' | 'Pro',
        createdDate: record.fields['Created Date'] as string,
        lastLogin: record.fields['Last Login'] as string
      }
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error('Failed to create user')
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const url = `https://api.airtable.com/v0/${this.baseId}/${this.tableIds.users}?filterByFormula=${encodeURIComponent(`{Email} = '${email}'`)}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Airtable API error: ${res.status} ${res.statusText} - ${errorText}`);
      }

      const data = await res.json();
      const record = data.records?.[0] || null;
      
      if (!record) {
        return null;
      }

      return {
        id: record.id,
        email: record.fields['Email'] as string,
        isVerified: record.fields['Is Verified'] as boolean,
        isPaid: record.fields['Is Paid'] as boolean,
        subscriptionTier: record.fields['Subscription Tier'] as 'Free' | 'Basic' | 'Pro',
        createdDate: record.fields['Created Date'] as string,
        lastLogin: record.fields['Last Login'] as string
      }
    } catch (error) {
      console.error('💥 Real Airtable error:', error)
      throw error; // <-- Let it bubble up so we can see the real issue
    }
  }

  async getUser(email: string): Promise<User | null> {
    return this.getUserByEmail(email)
  }

  async verifyUser(email: string): Promise<boolean> {
    try {
      const user = await this.getUser(email)
      if (!user) {
        return false
      }

      await this.makeRequest(`/${this.tableIds.users}`, {
        method: 'PATCH',
        body: JSON.stringify({
          records: [{
            id: user.id,
            fields: {
              'Is Verified': true,
              'Last Login': new Date().toISOString().split('T')[0] // Use YYYY-MM-DD format
            }
          }]
        })
      })

      return true
    } catch (error) {
      console.error('Error verifying user:', error)
      return false
    }
  }

  async updateUserPayment(email: string, isPaid: boolean, tier: 'Free' | 'Basic' | 'Pro'): Promise<boolean> {
    try {
      const user = await this.getUser(email)
      if (!user) {
        return false
      }

      await this.makeRequest(`/${this.tableIds.users}`, {
        method: 'PATCH',
        body: JSON.stringify({
          records: [{
            id: user.id,
            fields: {
              'Is Paid': isPaid,
              'Subscription Tier': tier,
              'Last Login': new Date().toISOString().split('T')[0] // Use YYYY-MM-DD format
            }
          }]
        })
      })

      return true
    } catch (error) {
      console.error('Error updating user payment:', error)
      return false
    }
  }

  // Queue management
  async queueImage(userEmail: string, imageData: {
    url: string
    name: string
    size: number
    notes?: string
    publishDate?: string
    metadata?: Record<string, unknown>
  }): Promise<QueueItem> {
    console.log('📤 Starting image queue process...')
    
    try {
      // Priority is no longer used since it's not in the field list
      console.log('📤 Starting image queue process for user:', userEmail)

      // Prepare the payload - only include fields that exist in the Airtable table
      const publishDate = imageData.publishDate || new Date().toISOString().split('T')[0]
      
      const fields: Record<string, unknown> = {
        'User Email': userEmail, // Email field
        'Image URL': imageData.url, // Link field
        'Upload Date': new Date().toISOString().split('T')[0], // Date field (YYYY-MM-DD)
        'Publish Date': publishDate // Date field (YYYY-MM-DD)
        // "Publish Time" field removed - causing 422 error
        // "Image Queue #" is auto-assigned by Airtable, not sent in payload
      }

      const payload = {
        records: [{
          fields
        }]
      }

      console.log('📦 Payload being sent to Airtable:')
      console.log('   Table: Queue')
      console.log('   Fields:', JSON.stringify(payload.records[0].fields, null, 2))
      console.log('   Upload Date value:', payload.records[0].fields['Upload Date'])
      console.log('   Upload Date type:', typeof payload.records[0].fields['Upload Date'])

      const response = await this.makeRequest(`/${this.tableIds.queue}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      console.log('✅ Airtable response received:', {
        recordCount: response.records?.length || 0,
        recordId: response.records?.[0]?.id
      })

      const record = response.records[0]
      const queueItem = {
        id: record.id,
        userEmail: record.fields['User Email'] as string,
        imageUrl: record.fields['Image URL'] as string,
        fileName: imageData.name, // Use the original data since it's not stored in Airtable
        fileSize: imageData.size, // Use the original data since it's not stored in Airtable
        status: 'queued' as const, // Default status since it's not stored in Airtable
        uploadDate: record.fields['Upload Date'] as string,
        publishDate: record.fields['Publish Date'] as string || imageData.publishDate,
        priority: 0, // Priority no longer used - set to default value
        notes: imageData.notes || '' // Use the original data since it's not stored in Airtable
      }

      console.log('🎉 Queue item created successfully:', queueItem.id)
      return queueItem
    } catch (error) {
      console.error('❌ Error queuing image:', error)
      
      // Log the specific error details
      if (error instanceof Error) {
        console.error('📋 Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
      }
      
      throw new Error(`Failed to queue ${imageData.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getQueueStatus(userEmail: string): Promise<QueueItem[]> {
    try {
      const response = await this.makeRequest(`/${this.tableIds.queue}?filterByFormula=${encodeURIComponent(`{User Email} = '${userEmail}'`)}`)
      
      return response.records.map((record: { id: string; fields: Record<string, unknown> }) => ({
        id: record.id,
        userEmail: record.fields['User Email'] as string,
        imageUrl: record.fields['Image URL'] as string,
        fileName: 'Unknown', // Not stored in Airtable
        fileSize: 0, // Not stored in Airtable
        status: 'queued' as const, // Default status since it's not stored in Airtable
        uploadDate: record.fields['Upload Date'] as string,
        publishDate: record.fields['Publish Date'] as string,
        priority: 0, // Priority no longer used
        notes: '' // Not stored in Airtable
      }))
    } catch (error) {
      console.error('Error getting queue status:', error)
      throw new Error('Failed to get queue status')
    }
  }

  async updateQueueItemStatus(recordId: string, status: 'queued' | 'processing' | 'published' | 'failed'): Promise<boolean> {
    try {
      const updateData: Record<string, unknown> = {}

      if (status === 'published') {
        updateData['Publish Date'] = new Date().toISOString().split('T')[0] // Date-only format (YYYY-MM-DD)
      }

      // Note: Status and Notes fields don't exist in the current Airtable schema
      // Only updating Publish Date when status is 'published'

      if (Object.keys(updateData).length === 0) {
        console.log('No fields to update in Airtable schema')
        return true
      }

      await this.makeRequest(`/${this.tableIds.queue}`, {
        method: 'PATCH',
        body: JSON.stringify({
          records: [{
            id: recordId,
            fields: updateData
          }]
        })
      })
      return true
    } catch (error) {
      console.error('Error updating queue item status:', error)
      return false
    }
  }

  async deleteQueueItem(recordId: string): Promise<boolean> {
    try {
      console.log('🔍 Deleting queue item with record ID:', recordId)
      console.log('🔗 Making DELETE request to:', `/${this.tableIds.queue}?records[]=${recordId}`)
      
      await this.makeRequest(`/${this.tableIds.queue}?records[]=${recordId}`, {
        method: 'DELETE'
      })
      
      console.log('✅ Successfully deleted queue item:', recordId)
      return true
    } catch (error) {
      console.error('❌ Error deleting queue item:', recordId, error)
      return false
    }
  }

  // Priority-related methods removed since Priority is not in the field list

  // Get table schema to check field names
  async getTableSchema(tableName: string): Promise<{ name: string; fields: Array<{ name: string; type: string }> }> {
    try {
      console.log(`🔍 Getting schema for table: ${tableName}`)
      const response = await fetch(`https://api.airtable.com/v0/meta/bases/${this.baseId}/tables`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to get table schema: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      const table = data.tables.find((t: { name: string }) => t.name === tableName)
      
      if (!table) {
        throw new Error(`Table '${tableName}' not found`)
      }

      console.log(`📋 Table schema for '${tableName}':`)
      table.fields.forEach((field: { name: string; type: string }) => {
        console.log(`   - ${field.name} (${field.type})`)
      })

      return table
    } catch (error) {
      console.error('Error getting table schema:', error)
      throw error
    }
  }

  // Initialize base structure (run once to set up tables)
  async initializeBase(): Promise<boolean> {
    try {
      // This would typically be done through the Airtable API or manually
      // For now, we'll assume the tables exist
      console.log('Base structure should be initialized manually in Airtable')
      return true
    } catch (error) {
      console.error('Error initializing base:', error)
      return false
    }
  }
}

// Note: Don't create singleton instance here as it causes build-time errors
// Create instances in API routes with proper environment variable checks

// Standalone function for finding or creating users
export async function findOrCreateUserByEmail(email: string) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_API_KEY;
  const tableName = "Users";

  if (!baseId || !token) {
    throw new Error('Airtable configuration missing');
  }

  console.log(`🔍 Searching for user with email: ${email}`);

  const url = `https://api.airtable.com/v0/${baseId}/tblXfgLJOJH94UGwD?filterByFormula=${encodeURIComponent(`{Email} = '${email}'`)}`;

  const getRes = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!getRes.ok) {
    const errorText = await getRes.text();
    throw new Error(`Failed to search for user: ${getRes.status} ${getRes.statusText} - ${errorText}`);
  }

  const getData = await getRes.json();
  console.log(`📊 Search results: ${getData.records?.length || 0} records found`);

  if (getData.records?.length > 0) {
    console.log(`✅ Found existing user: ${getData.records[0].id}`);
    return { ...getData.records[0], isExisting: true };
  }

  console.log(`🆕 Creating new user for email: ${email}`);

  const createRes = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        Email: email,
        "Is Verified": false,
        "Is Paid": false,
      },
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Failed to create user: ${createRes.status} ${createRes.statusText} - ${errorText}`);
  }

  const createData = await createRes.json();
  console.log(`✅ Created new user: ${createData.records?.[0]?.id}`);
  return { ...createData.records?.[0], isExisting: false };
} 