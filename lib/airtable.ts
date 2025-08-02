interface User {
  id?: string
  email: string
  isVerified: boolean
  isPaid: boolean
  subscriptionTier: 'free' | 'basic' | 'pro'
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
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    console.log('TOKEN:', process.env.AIRTABLE_API_KEY)
    console.log('BASE ID:', process.env.AIRTABLE_BASE_ID)
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Airtable API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
  }

  // User management
  async createUser(userData: {
    email: string
    isVerified?: boolean
  }): Promise<User> {
    try {
      const response = await this.makeRequest('/Users', {
        method: 'POST',
        body: JSON.stringify({
          records: [{
            fields: {
              'Email': userData.email,
              'Is Verified': userData.isVerified || false,
              'Is Paid': false,
              'Subscription Tier': 'free',
              'Created Date': new Date().toISOString(),
              'Last Login': new Date().toISOString()
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
        subscriptionTier: record.fields['Subscription Tier'] as 'free' | 'basic' | 'pro',
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
      const url = `https://api.airtable.com/v0/${this.baseId}/Users?filterByFormula=${encodeURIComponent(`{Email} = '${email}'`)}`;

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
        subscriptionTier: record.fields['Subscription Tier'] as 'free' | 'basic' | 'pro',
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

      await this.makeRequest(`/Users`, {
        method: 'PATCH',
        body: JSON.stringify({
          records: [{
            id: user.id,
            fields: {
              'Is Verified': true,
              'Last Login': new Date().toISOString()
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

  async updateUserPayment(email: string, isPaid: boolean, tier: 'free' | 'basic' | 'pro'): Promise<boolean> {
    try {
      const user = await this.getUser(email)
      if (!user) {
        return false
      }

      await this.makeRequest(`/Users`, {
        method: 'PATCH',
        body: JSON.stringify({
          records: [{
            id: user.id,
            fields: {
              'Is Paid': isPaid,
              'Subscription Tier': tier,
              'Last Login': new Date().toISOString()
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
  }): Promise<QueueItem> {
    try {
      // Get next priority number for this user
      const priority = await this.getNextPriority(userEmail)

      const response = await this.makeRequest('/Image Queue', {
        method: 'POST',
        body: JSON.stringify({
          records: [{
            fields: {
              'User Email': userEmail,
              'Image URL': imageData.url,
              'File Name': imageData.name,
              'File Size': imageData.size,
              'Status': 'queued',
              'Upload Date': new Date().toISOString(),
              'Priority': priority,
              'Notes': imageData.notes || 'Auto-queued from uploader'
            }
          }]
        })
      })

      const record = response.records[0]
      return {
        id: record.id,
        userEmail: record.fields['User Email'] as string,
        imageUrl: record.fields['Image URL'] as string,
        fileName: record.fields['File Name'] as string,
        fileSize: record.fields['File Size'] as number,
        status: record.fields['Status'] as 'queued' | 'processing' | 'published' | 'failed',
        uploadDate: record.fields['Upload Date'] as string,
        priority: record.fields['Priority'] as number,
        notes: record.fields['Notes'] as string
      }
    } catch (error) {
      console.error('Error queuing image:', error)
      throw new Error('Failed to queue image')
    }
  }

  async getQueueStatus(userEmail: string): Promise<QueueItem[]> {
    try {
      const response = await this.makeRequest(`/Image Queue?filterByFormula=${encodeURIComponent(`{User Email} = '${userEmail}'`)}&sort[0][field]=Priority&sort[0][direction]=asc`)
      
      return response.records.map(record => ({
        id: record.id,
        userEmail: record.fields['User Email'] as string,
        imageUrl: record.fields['Image URL'] as string,
        fileName: record.fields['File Name'] as string,
        fileSize: record.fields['File Size'] as number,
        status: record.fields['Status'] as 'queued' | 'processing' | 'published' | 'failed',
        uploadDate: record.fields['Upload Date'] as string,
        publishDate: record.fields['Publish Date'] as string,
        priority: record.fields['Priority'] as number,
        notes: record.fields['Notes'] as string
      }))
    } catch (error) {
      console.error('Error getting queue status:', error)
      throw new Error('Failed to get queue status')
    }
  }

  async updateQueueItemStatus(recordId: string, status: 'queued' | 'processing' | 'published' | 'failed', notes?: string): Promise<boolean> {
    try {
      const updateData: Record<string, any> = {
        'Status': status
      }

      if (status === 'published') {
        updateData['Publish Date'] = new Date().toISOString()
      }

      if (notes) {
        updateData['Notes'] = notes
      }

      await this.makeRequest(`/Image Queue`, {
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
      await this.makeRequest(`/Image Queue?records[]=${recordId}`, {
        method: 'DELETE'
      })
      return true
    } catch (error) {
      console.error('Error deleting queue item:', error)
      return false
    }
  }

  async reorderQueue(userEmail: string, newOrder: string[]): Promise<boolean> {
    try {
      const updates = newOrder.map((recordId, index) => ({
        id: recordId,
        fields: { 'Priority': index + 1 }
      }))

      await this.makeRequest(`/Image Queue`, {
        method: 'PATCH',
        body: JSON.stringify({
          records: updates
        })
      })
      return true
    } catch (error) {
      console.error('Error reordering queue:', error)
      return false
    }
  }

  private async getNextPriority(userEmail: string): Promise<number> {
    try {
      const response = await this.makeRequest(`/Image Queue?filterByFormula=${encodeURIComponent(`{User Email} = '${userEmail}'`)}&sort[0][field]=Priority&sort[0][direction]=desc&maxRecords=1`)
      
      if (response.records.length === 0) {
        return 1
      }

      const highestPriority = response.records[0].fields['Priority'] as number
      return highestPriority + 1
    } catch (error) {
      console.error('Error getting next priority:', error)
      return 1
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