import Airtable from 'airtable'

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
  private base: Airtable.Base
  private apiKey: string
  private baseId: string

  constructor(apiKey: string, baseId: string) {
    this.apiKey = apiKey
    this.baseId = baseId
    this.base = new Airtable({ apiKey }).base(baseId)
  }

  // User management
  async createUser(email: string): Promise<User> {
    try {
      const record = await this.base('Users').create({
        'Email': email,
        'Is Verified': false,
        'Is Paid': false,
        'Subscription Tier': 'free',
        'Created Date': new Date().toISOString(),
        'Last Login': new Date().toISOString()
      })

      return {
        id: record.id,
        email: record.get('Email') as string,
        isVerified: record.get('Is Verified') as boolean,
        isPaid: record.get('Is Paid') as boolean,
        subscriptionTier: record.get('Subscription Tier') as 'free' | 'basic' | 'pro',
        createdDate: record.get('Created Date') as string,
        lastLogin: record.get('Last Login') as string
      }
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error('Failed to create user')
    }
  }

  async getUser(email: string): Promise<User | null> {
    try {
      const records = await this.base('Users').select({
        filterByFormula: `{Email} = '${email}'`
      }).firstPage()

      if (records.length === 0) {
        return null
      }

      const record = records[0]
      return {
        id: record.id,
        email: record.get('Email') as string,
        isVerified: record.get('Is Verified') as boolean,
        isPaid: record.get('Is Paid') as boolean,
        subscriptionTier: record.get('Subscription Tier') as 'free' | 'basic' | 'pro',
        createdDate: record.get('Created Date') as string,
        lastLogin: record.get('Last Login') as string
      }
    } catch (error) {
      console.error('Error getting user:', error)
      throw new Error('Failed to get user')
    }
  }

  async verifyUser(email: string): Promise<boolean> {
    try {
      const user = await this.getUser(email)
      if (!user) {
        return false
      }

      await this.base('Users').update(user.id!, {
        'Is Verified': true,
        'Last Login': new Date().toISOString()
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

      await this.base('Users').update(user.id!, {
        'Is Paid': isPaid,
        'Subscription Tier': tier,
        'Last Login': new Date().toISOString()
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

      const record = await this.base('Image Queue').create({
        'User Email': userEmail,
        'Image URL': imageData.url,
        'File Name': imageData.name,
        'File Size': imageData.size,
        'Status': 'queued',
        'Upload Date': new Date().toISOString(),
        'Priority': priority,
        'Notes': imageData.notes || 'Auto-queued from uploader'
      })

      return {
        id: record.id,
        userEmail: record.get('User Email') as string,
        imageUrl: record.get('Image URL') as string,
        fileName: record.get('File Name') as string,
        fileSize: record.get('File Size') as number,
        status: record.get('Status') as 'queued' | 'processing' | 'published' | 'failed',
        uploadDate: record.get('Upload Date') as string,
        priority: record.get('Priority') as number,
        notes: record.get('Notes') as string
      }
    } catch (error) {
      console.error('Error queuing image:', error)
      throw new Error('Failed to queue image')
    }
  }

  async getQueueStatus(userEmail: string): Promise<QueueItem[]> {
    try {
      const records = await this.base('Image Queue').select({
        filterByFormula: `{User Email} = '${userEmail}'`,
        sort: [{ field: 'Priority', direction: 'asc' }]
      }).firstPage()

      return records.map(record => ({
        id: record.id,
        userEmail: record.get('User Email') as string,
        imageUrl: record.get('Image URL') as string,
        fileName: record.get('File Name') as string,
        fileSize: record.get('File Size') as number,
        status: record.get('Status') as 'queued' | 'processing' | 'published' | 'failed',
        uploadDate: record.get('Upload Date') as string,
        publishDate: record.get('Publish Date') as string,
        priority: record.get('Priority') as number,
        notes: record.get('Notes') as string
      }))
    } catch (error) {
      console.error('Error getting queue status:', error)
      throw new Error('Failed to get queue status')
    }
  }

  async updateQueueItemStatus(recordId: string, status: 'queued' | 'processing' | 'published' | 'failed', notes?: string): Promise<boolean> {
    try {
      const updateData: any = {
        'Status': status
      }

      if (status === 'published') {
        updateData['Publish Date'] = new Date().toISOString()
      }

      if (notes) {
        updateData['Notes'] = notes
      }

      await this.base('Image Queue').update(recordId, updateData)
      return true
    } catch (error) {
      console.error('Error updating queue item status:', error)
      return false
    }
  }

  async deleteQueueItem(recordId: string): Promise<boolean> {
    try {
      await this.base('Image Queue').destroy(recordId)
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

      await this.base('Image Queue').update(updates)
      return true
    } catch (error) {
      console.error('Error reordering queue:', error)
      return false
    }
  }

  private async getNextPriority(userEmail: string): Promise<number> {
    try {
      const records = await this.base('Image Queue').select({
        filterByFormula: `{User Email} = '${userEmail}'`,
        sort: [{ field: 'Priority', direction: 'desc' }],
        maxRecords: 1
      }).firstPage()

      if (records.length === 0) {
        return 1
      }

      const highestPriority = records[0].get('Priority') as number
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

// Create singleton instance
export const airtableBackend = new AirtableBackend(
  process.env.AIRTABLE_API_KEY || '',
  process.env.AIRTABLE_BASE_ID || ''
) 