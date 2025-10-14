interface User {
  id?: string
  email: string
  isVerified: boolean
  isPaid: boolean
  subscriptionTier: 'Free' | 'Basic' | 'Pro'
  createdDate: string
  lastLogin: string
  lastActivity?: string
  totalUploads?: number
  storageUsed?: number
  preferences?: Record<string, unknown>
  planExpiry?: string
}

interface QueueItem {
  id?: string
  userEmail: string
  imageUrl: string
  fileName: string
  fileSize: number
  status?: 'queued' | 'banked' | 'processing' | 'published' | 'failed'
  uploadDate: string
  publishDate?: string
  publishTime?: string
  notes?: string
  tags?: string[]
  processingTime?: number
  metadata?: Record<string, unknown>
  owner?: string
  approved?: boolean
  experienceType?: string
}

interface Notification {
  id?: string
  userEmail: string
  type: 'image_published' | 'image_failed' | 'queue_completed' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: string
  relatedImageId?: string
  relatedImageUrl?: string
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
      queue: 'Image Queue', // Updated to use the correct table name
      notifications: 'Notifications' // Notifications table
    }
  }

  private tableIds: {
    users: string
    queue: string
    notifications: string
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    console.log('🔗 Making Airtable request to:', endpoint)
    console.log('🔧 Request method:', options.method || 'GET')

    const url = `${this.baseUrl}${endpoint}`
    console.log('🌐 Full URL:', url)

    try {
      // Create a timeout promise
      const timeoutMs = 15000 // 15 second timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 15 seconds')), timeoutMs)
      })

      // Race between fetch and timeout
      const response = await Promise.race([
        fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        }),
        timeoutPromise
      ]) as Response

      console.log('📡 Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Airtable API error response:')
        console.error('   Status:', response.status, response.statusText)
        console.error('   Headers:', Object.fromEntries(response.headers.entries()))
        console.error('   Body:', errorText)
        
        throw new Error(`Airtable API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      // Handle DELETE requests which may not return JSON
      let responseData
      if (response.headers.get('content-length') === '0' || response.status === 204) {
        responseData = {} // Empty response for successful DELETE
      } else {
        responseData = await response.json()
      }
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
              'Subscription Tier': 'Free',
              'Created Date': new Date().toISOString().split('T')[0],
              'Last Login': new Date().toISOString().split('T')[0],
              'Last Activity': new Date().toISOString().split('T')[0].split('T')[0],
              'Total Uploads': 0,
              'Storage Used': 0,
              'Preferences': JSON.stringify({})
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
        lastLogin: record.fields['Last Login'] as string,
        lastActivity: record.fields['Last Activity'] as string,
        totalUploads: record.fields['Total Uploads'] as number || 0,
        storageUsed: record.fields['Storage Used'] as number || 0,
        preferences: record.fields['Preferences'] ? JSON.parse(record.fields['Preferences'] as string) : {},
        planExpiry: record.fields['Plan Expiry'] as string
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
        lastLogin: record.fields['Last Login'] as string,
        lastActivity: record.fields['Last Activity'] as string,
        totalUploads: record.fields['Total Uploads'] as number || 0,
        storageUsed: record.fields['Storage Used'] as number || 0,
        preferences: record.fields['Preferences'] ? JSON.parse(record.fields['Preferences'] as string) : {},
        planExpiry: record.fields['Plan Expiry'] as string
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
    publishDate: string
    publishTime: string
    metadata?: Record<string, unknown>
    tags?: string[]
    owner?: string
    experienceType?: string
  }): Promise<QueueItem> {
    console.log('📤 Starting image queue process...')

    try {
      console.log('📤 Starting image queue process for user:', userEmail)

      const fields: Record<string, unknown> = {
        'User Email': userEmail,
        'Image URL': imageData.url,
        'File Name': imageData.name,
        'File Size': imageData.size,
        'Upload Date': new Date().toISOString().split('T')[0],
        'Publish Date': imageData.publishDate
      }

      // Convert publishTime (HH:MM) to full ISO datetime if provided
      if (imageData.publishTime) {
        const publishDateTime = new Date(`${imageData.publishDate}T${imageData.publishTime}:00.000Z`)
        fields['Publish Time'] = publishDateTime.toISOString()
      }

      // Add optional fields if provided
      if (imageData.notes) {
        fields['Notes'] = imageData.notes
      }
      if (imageData.tags && imageData.tags.length > 0) {
        fields['Tags'] = imageData.tags
      }
      if (imageData.metadata) {
        fields['Metadata'] = JSON.stringify(imageData.metadata)
      }
      if (imageData.owner) {
        fields['Owner'] = imageData.owner
      }
      if (imageData.experienceType) {
        fields['Experience Type'] = imageData.experienceType
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
        fileName: record.fields['File Name'] as string,
        fileSize: record.fields['File Size'] as number,
        uploadDate: record.fields['Upload Date'] as string,
        publishDate: record.fields['Publish Date'] as string,
        publishTime: record.fields['Publish Time'] as string,
        notes: record.fields['Notes'] as string,
        tags: record.fields['Tags'] as string[],
        metadata: record.fields['Metadata'] ? JSON.parse(record.fields['Metadata'] as string) : undefined,
        owner: record.fields['Owner'] as string
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

  // Bank an image (upload without queuing)
  async bankImage(userEmail: string, imageData: {
    url: string
    name: string
    size: number
    notes?: string
    metadata?: Record<string, unknown>
    tags?: string[]
    owner?: string
    experienceType?: string
  }): Promise<QueueItem> {
    console.log('🏦 Banking image for user:', userEmail)

    try {
      const fields: Record<string, unknown> = {
        'User Email': userEmail,
        'Image URL': imageData.url,
        'File Name': imageData.name,
        'File Size': imageData.size,
        'Upload Date': new Date().toISOString().split('T')[0],
        'Approved': false
      }

      // Add optional fields if provided
      if (imageData.notes) {
        fields['Notes'] = imageData.notes
      }
      if (imageData.tags && imageData.tags.length > 0) {
        fields['Tags'] = imageData.tags
      }
      if (imageData.metadata) {
        fields['Metadata'] = JSON.stringify(imageData.metadata)
      }
      if (imageData.owner) {
        fields['Owner'] = imageData.owner
      }
      if (imageData.experienceType) {
        fields['Experience Type'] = imageData.experienceType
      }

      const payload = {
        records: [{
          fields
        }]
      }

      console.log('📦 Banking payload:', JSON.stringify(payload.records[0].fields, null, 2))

      const response = await this.makeRequest(`/${this.tableIds.queue}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      const record = response.records[0]
      const bankedItem = {
        id: record.id,
        userEmail: record.fields['User Email'] as string,
        imageUrl: record.fields['Image URL'] as string,
        fileName: record.fields['File Name'] as string,
        fileSize: record.fields['File Size'] as number,
        status: 'banked' as const,
        uploadDate: record.fields['Upload Date'] as string,
        notes: record.fields['Notes'] as string,
        tags: record.fields['Tags'] as string[],
        metadata: record.fields['Metadata'] ? JSON.parse(record.fields['Metadata'] as string) : undefined,
        owner: record.fields['Owner'] as string,
        approved: record.fields['Approved'] as boolean || false
      }

      console.log('✅ Image banked successfully:', bankedItem.id)
      return bankedItem
    } catch (error) {
      console.error('❌ Error banking image:', error)
      throw new Error(`Failed to bank image ${imageData.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Approve a banked image
  async approveImage(recordId: string): Promise<boolean> {
    console.log('✅ Approving banked image:', recordId)

    try {
      const payload = {
        records: [{
          id: recordId,
          fields: {
            'Approved': true
          }
        }]
      }

      await this.makeRequest(`/${this.tableIds.queue}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      })

      console.log('✅ Successfully approved image:', recordId)
      return true
    } catch (error) {
      console.error('❌ Error approving image:', error)
      return false
    }
  }

  // Move banked image to queue
  async moveBankedToQueue(recordId: string, publishDate?: string): Promise<boolean> {
    console.log('📤 Moving banked image to queue:', recordId)

    try {
      const fields: Record<string, unknown> = {
        'Status': 'queued',
        'Publish Date': publishDate || new Date().toISOString().split('T')[0]
      }

      const payload = {
        records: [{
          id: recordId,
          fields
        }]
      }

      await this.makeRequest(`/${this.tableIds.queue}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      })

      console.log('✅ Successfully moved banked image to queue:', recordId)
      return true
    } catch (error) {
      console.error('❌ Error moving banked image to queue:', error)
      return false
    }
  }

  // Get banked images (images without a publish date are considered banked)
  async getBankedImages(userEmail: string): Promise<QueueItem[]> {
    try {
      // Fetch ALL banked images (not just for specific user) to allow cross-user dashboard views
      const response = await this.makeRequest(`/${this.tableIds.queue}?filterByFormula=${encodeURIComponent(`{Publish Date} = BLANK()`)}&sort[0][field]=Upload Date&sort[0][direction]=desc`)

      return response.records.map((record: { id: string; fields: Record<string, unknown> }) => ({
        id: record.id,
        userEmail: record.fields['User Email'] as string,
        imageUrl: record.fields['Image URL'] as string,
        fileName: record.fields['File Name'] as string || 'Unknown',
        fileSize: record.fields['File Size'] as number || 0,
        status: 'banked' as const,
        uploadDate: record.fields['Upload Date'] as string,
        notes: record.fields['Notes'] as string || '',
        tags: record.fields['Tags'] as string[] || [],
        metadata: record.fields['Metadata'] ? JSON.parse(record.fields['Metadata'] as string) : undefined,
        owner: record.fields['Owner'] as string || record.fields['User Email'] as string || '',
        approved: record.fields['Approved'] as boolean || false,
        experienceType: record.fields['Experience Type'] as string
      }))
    } catch (error) {
      console.error('Error getting banked images:', error)
      throw new Error('Failed to get banked images')
    }
  }

  // Notification methods
  async createNotification(userEmail: string, notification: Omit<Notification, 'id' | 'userEmail' | 'createdAt' | 'read'>): Promise<Notification> {
    console.log('🔔 Creating notification for user:', userEmail)

    try {
      const fields: Record<string, unknown> = {
        'User Email': userEmail,
        'Type': notification.type,
        'Title': notification.title,
        'Message': notification.message,
        'Read': false,
        'Created At': new Date().toISOString()
      }

      if (notification.relatedImageId) {
        fields['Related Image ID'] = notification.relatedImageId
      }
      if (notification.relatedImageUrl) {
        fields['Related Image URL'] = notification.relatedImageUrl
      }

      const payload = {
        records: [{
          fields
        }]
      }

      const response = await this.makeRequest(`/${this.tableIds.notifications}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      const record = response.records[0]
      console.log('✅ Notification created:', record.id)

      return {
        id: record.id,
        userEmail: record.fields['User Email'] as string,
        type: record.fields['Type'] as Notification['type'],
        title: record.fields['Title'] as string,
        message: record.fields['Message'] as string,
        read: record.fields['Read'] as boolean,
        createdAt: record.fields['Created At'] as string,
        relatedImageId: record.fields['Related Image ID'] as string,
        relatedImageUrl: record.fields['Related Image URL'] as string
      }
    } catch (error) {
      console.error('❌ Error creating notification:', error)
      // Don't throw - notifications are optional, return a mock notification
      console.log('⚠️ Notifications table not available - notification skipped')
      return {
        id: 'mock-' + Date.now(),
        userEmail,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: false,
        createdAt: new Date().toISOString(),
        relatedImageId: notification.relatedImageId,
        relatedImageUrl: notification.relatedImageUrl
      }
    }
  }

  async getNotifications(userEmail: string, unreadOnly: boolean = false): Promise<Notification[]> {
    try {
      let filter = `{User Email} = '${userEmail}'`
      if (unreadOnly) {
        filter = `AND(${filter}, {Read} = FALSE())`
      }

      const response = await this.makeRequest(`/${this.tableIds.notifications}?filterByFormula=${encodeURIComponent(filter)}&sort[0][field]=Created At&sort[0][direction]=desc`)

      return response.records.map((record: { id: string; fields: Record<string, unknown> }) => ({
        id: record.id,
        userEmail: record.fields['User Email'] as string,
        type: record.fields['Type'] as Notification['type'],
        title: record.fields['Title'] as string,
        message: record.fields['Message'] as string,
        read: record.fields['Read'] as boolean || false,
        createdAt: record.fields['Created At'] as string,
        relatedImageId: record.fields['Related Image ID'] as string,
        relatedImageUrl: record.fields['Related Image URL'] as string
      }))
    } catch (error) {
      console.error('Error getting notifications:', error)
      // Don't throw - notifications are optional, return empty array
      console.log('⚠️ Notifications table not available - returning empty list')
      return []
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const payload = {
        records: [{
          id: notificationId,
          fields: {
            'Read': true
          }
        }]
      }

      await this.makeRequest(`/${this.tableIds.notifications}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      })

      console.log('✅ Notification marked as read:', notificationId)
      return true
    } catch (error) {
      console.error('❌ Error marking notification as read:', error)
      return false
    }
  }

  async markAllNotificationsAsRead(userEmail: string): Promise<boolean> {
    try {
      // Get all unread notifications
      const unreadNotifications = await this.getNotifications(userEmail, true)

      if (unreadNotifications.length === 0) {
        return true
      }

      // Mark all as read
      const payload = {
        records: unreadNotifications.map(notification => ({
          id: notification.id,
          fields: {
            'Read': true
          }
        }))
      }

      await this.makeRequest(`/${this.tableIds.notifications}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      })

      console.log(`✅ Marked ${unreadNotifications.length} notifications as read`)
      return true
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error)
      return false
    }
  }

  async getQueueStatus(userEmail: string): Promise<QueueItem[]> {
    try {
      const response = await this.makeRequest(`/${this.tableIds.queue}?filterByFormula=${encodeURIComponent(`{User Email} = '${userEmail}'`)}&sort[0][field]=Publish Date&sort[0][direction]=asc`)
      
      return response.records.map((record: { id: string; fields: Record<string, unknown> }) => ({
        id: record.id,
        userEmail: record.fields['User Email'] as string,
        imageUrl: record.fields['Image URL'] as string,
        fileName: record.fields['File Name'] as string || 'Unknown',
        fileSize: record.fields['File Size'] as number || 0,
        uploadDate: record.fields['Upload Date'] as string,
        publishDate: record.fields['Publish Date'] as string,
        publishTime: record.fields['Publish Time'] as string,
        notes: record.fields['Notes'] as string || '',
        tags: record.fields['Tags'] as string[] || [],
        metadata: record.fields['Metadata'] ? JSON.parse(record.fields['Metadata'] as string) : undefined,
        owner: record.fields['Owner'] as string || ''
      }))
    } catch (error) {
      console.error('Error getting queue status:', error)
      throw new Error('Failed to get queue status')
    }
  }

  // updateQueueItemStatus method removed - Status field no longer exists in Airtable

  async deleteQueueItem(recordId: string): Promise<boolean> {
    try {
      console.log('🔍 Deleting queue item with record ID:', recordId)
      console.log('🔗 Making DELETE request to:', `/${this.tableIds.queue}/${recordId}`)

      await this.makeRequest(`/${this.tableIds.queue}/${recordId}`, {
        method: 'DELETE'
      })

      console.log('✅ Successfully deleted queue item:', recordId)
      return true
    } catch (error) {
      console.error('❌ Error deleting queue item:', recordId, error)

      // Check if error is 403/404 (item already deleted or doesn't exist)
      if (error instanceof Error && error.message.includes('403 Forbidden')) {
        console.log('ℹ️ Item already deleted or not found (403) - treating as success:', recordId)
        return true
      }
      if (error instanceof Error && error.message.includes('404 Not Found')) {
        console.log('ℹ️ Item not found (404) - treating as success:', recordId)
        return true
      }

      return false
    }
  }

  async reorderQueue(userEmail: string, newOrder: string[]): Promise<boolean> {
    try {
      console.log('🔄 Reordering queue for user:', userEmail)
      console.log('📋 New order:', newOrder)

      // First, verify all records exist by fetching the current queue
      console.log('🔍 Verifying records exist before reordering...')
      const currentQueue = await this.getQueueStatus(userEmail)
      const existingIds = currentQueue.map(item => item.id)

      // Filter out any record IDs that don't exist anymore
      const validIds = newOrder.filter(id => existingIds.includes(id))
      const invalidIds = newOrder.filter(id => !existingIds.includes(id))

      if (invalidIds.length > 0) {
        console.warn('⚠️ Some record IDs no longer exist:', invalidIds)
      }

      if (validIds.length === 0) {
        console.log('❌ No valid records to reorder')
        return false
      }

      console.log(`✅ Found ${validIds.length} valid records to reorder`)

      // We'll use the Upload Date and Publish Date to maintain order.
      // We'll update the Publish Date with timestamps that reflect the desired order.

      const baseDate = new Date()
      const updates = validIds.map((recordId, index) => ({
        id: recordId,
        fields: {
          // Set Publish Date to maintain order - each item gets a date that's index hours later
          'Publish Date': new Date(baseDate.getTime() + (index * 60 * 60 * 1000)).toISOString().split('T')[0]
        }
      }))

      console.log('📤 Updating records with new order...')

      // Update records in batches (Airtable allows max 10 records per request)
      const batchSize = 10
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize)

        try {
          await this.makeRequest(`/${this.tableIds.queue}`, {
            method: 'PATCH',
            body: JSON.stringify({
              records: batch
            })
          })

          console.log(`✅ Updated batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(updates.length / batchSize)}`)
        } catch (batchError) {
          console.error(`❌ Failed to update batch ${Math.floor(i / batchSize) + 1}:`, batchError)
          // Continue with other batches instead of failing completely
        }
      }

      console.log('🎉 Queue reordering completed')
      return true
    } catch (error) {
      console.error('Error reordering queue:', error)
      return false
    }
  }

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

  // Helper methods for new functionality
  async updateUserActivity(email: string): Promise<boolean> {
    try {
      const user = await this.getUser(email)
      if (!user) return false

      await this.makeRequest(`/${this.tableIds.users}`, {
        method: 'PATCH',
        body: JSON.stringify({
          records: [{
            id: user.id,
            fields: {
              'Last Activity': new Date().toISOString().split('T')[0]
            }
          }]
        })
      })
      return true
    } catch (error) {
      console.error('Error updating user activity:', error)
      return false
    }
  }

  async updateUserStats(email: string, uploadsIncrement: number = 0, storageIncrement: number = 0): Promise<boolean> {
    try {
      const user = await this.getUser(email)
      if (!user) return false

      const newTotalUploads = (user.totalUploads || 0) + uploadsIncrement
      const newStorageUsed = (user.storageUsed || 0) + storageIncrement

      await this.makeRequest(`/${this.tableIds.users}`, {
        method: 'PATCH',
        body: JSON.stringify({
          records: [{
            id: user.id,
            fields: {
              'Total Uploads': newTotalUploads,
              'Storage Used': newStorageUsed,
              'Last Activity': new Date().toISOString().split('T')[0]
            }
          }]
        })
      })
      return true
    } catch (error) {
      console.error('Error updating user stats:', error)
      return false
    }
  }

  async updateUserPreferences(email: string, preferences: Record<string, unknown>): Promise<boolean> {
    try {
      const user = await this.getUser(email)
      if (!user) return false

      await this.makeRequest(`/${this.tableIds.users}`, {
        method: 'PATCH',
        body: JSON.stringify({
          records: [{
            id: user.id,
            fields: {
              'Preferences': JSON.stringify(preferences),
              'Last Activity': new Date().toISOString().split('T')[0]
            }
          }]
        })
      })
      return true
    } catch (error) {
      console.error('Error updating user preferences:', error)
      return false
    }
  }

  async updateQueueItemProcessingTime(recordId: string, processingTimeSeconds: number): Promise<boolean> {
    try {
      await this.makeRequest(`/${this.tableIds.queue}`, {
        method: 'PATCH',
        body: JSON.stringify({
          records: [{
            id: recordId,
            fields: {
              'Processing Time': processingTimeSeconds
            }
          }]
        })
      })
      return true
    } catch (error) {
      console.error('Error updating processing time:', error)
      return false
    }
  }

  async addTagsToQueueItem(recordId: string, tags: string[]): Promise<boolean> {
    try {
      await this.makeRequest(`/${this.tableIds.queue}`, {
        method: 'PATCH',
        body: JSON.stringify({
          records: [{
            id: recordId,
            fields: {
              'Tags': tags
            }
          }]
        })
      })
      return true
    } catch (error) {
      console.error('Error adding tags to queue item:', error)
      return false
    }
  }

  async getQueueItemsByTag(userEmail: string, tag: string): Promise<QueueItem[]> {
    try {
      const formula = `AND({User Email} = '${userEmail}', SEARCH('${tag}', ARRAYJOIN({Tags}, ',')))`
      const response = await this.makeRequest(`/${this.tableIds.queue}?filterByFormula=${encodeURIComponent(formula)}`)

      return response.records.map((record: { id: string; fields: Record<string, unknown> }) => ({
        id: record.id,
        userEmail: record.fields['User Email'] as string,
        imageUrl: record.fields['Image URL'] as string,
        fileName: record.fields['File Name'] as string || 'Unknown',
        fileSize: record.fields['File Size'] as number || 0,
        uploadDate: record.fields['Upload Date'] as string,
        publishDate: record.fields['Publish Date'] as string,
        publishTime: record.fields['Publish Time'] as string,
        notes: record.fields['Notes'] as string || '',
        tags: record.fields['Tags'] as string[] || [],
        metadata: record.fields['Metadata'] ? JSON.parse(record.fields['Metadata'] as string) : undefined,
        owner: record.fields['Owner'] as string || ''
      }))
    } catch (error) {
      console.error('Error getting queue items by tag:', error)
      return []
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