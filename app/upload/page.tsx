
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Lenis from 'lenis'
import { useTheme } from '../../components/ThemeProvider'


interface QueueItem {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'completed' | 'error'
  progress?: number
  selected?: boolean
  localPreview?: string // Local preview URL for immediate display
  fileSize?: number // File size in bytes
  cloudinaryUrl?: string // Cloudinary URL after upload
  uploadError?: string // Error message if upload failed
  // Enhanced fields
  notes?: string
  metadata?: Record<string, unknown>
  publishDate?: string
  owner?: string
}

interface AirtableQueueItem {
  id: string
  userEmail: string
  imageUrl: string
  fileName: string
  fileSize: number
  status?: 'queued' | 'banked' | 'processing' | 'published' | 'failed'
  uploadDate: string
  publishDate?: string
  notes?: string
}

export default function Home() {
  const { theme, setEmailTheme } = useTheme()
  const [email, setEmail] = useState<string>('')
  const [storedEmail, setStoredEmail] = useState<string>('')
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [status, setStatus] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [airtableQueueItems, setAirtableQueueItems] = useState<AirtableQueueItem[]>([])
  const [isLoadingAirtableQueue, setIsLoadingAirtableQueue] = useState(false)
  const [draggedAirtableItem, setDraggedAirtableItem] = useState<string | null>(null)
  const [isReorderingAirtable, setIsReorderingAirtable] = useState(false)
  const mainRef = useRef<HTMLDivElement>(null)
  const sidebarScrollRef = useRef<HTMLDivElement>(null)

  // Enhanced fields state
  const [defaultNotes, setDefaultNotes] = useState<string>('')
  const [defaultPublishDate, setDefaultPublishDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [defaultOwner, setDefaultOwner] = useState<string>('')
  const [defaultFileName, setDefaultFileName] = useState<string>('')

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')

  // Image Bank - all uploads now go to bank by default (no longer needed but kept for backwards compatibility)

  // Edit modal state
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({
    notes: '',
    publishDate: '',
    owner: '',
    fileName: ''
  })


  useEffect(() => {
    const saved = localStorage.getItem('uploader_email')

    if (saved) {
      setStoredEmail(saved)
      setEmail(saved) // Pre-fill the email input
    }

    // Ensure page starts at top on load
    window.scrollTo(0, 0)

    // Listen for share modal event from Header
    const handleOpenShareModal = () => setShowShareModal(true)
    window.addEventListener('openShareModal', handleOpenShareModal)

    return () => {
      window.removeEventListener('openShareModal', handleOpenShareModal)
    }
  }, [])

  const fetchAirtableQueueItems = useCallback(async () => {
    if (!storedEmail) return
    
    setIsLoadingAirtableQueue(true)
    try {
      const response = await fetch('/api/airtable/queue/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: storedEmail }),
      })

      if (response.ok) {
        const data = await response.json()
        setAirtableQueueItems(data.queueItems || [])
      } else {
        console.error('Failed to fetch Airtable queue items')
      }
    } catch (error) {
      console.error('Error fetching Airtable queue items:', error)
    } finally {
      setIsLoadingAirtableQueue(false)
    }
  }, [storedEmail])

  // Fetch Airtable queue items when user is logged in
  useEffect(() => {
    if (storedEmail) {
      fetchAirtableQueueItems()
    }
  }, [storedEmail, fetchAirtableQueueItems])


  // Setup Lenis smooth scrolling for sidebar
  useEffect(() => {
    if (!sidebarScrollRef.current) return

    const lenis = new Lenis({
      wrapper: sidebarScrollRef.current,
      content: sidebarScrollRef.current.firstElementChild as HTMLElement,
      duration: 0.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    })

    let rafId: number

    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [airtableQueueItems.length]) // Re-initialize when queue items change

  const deleteAirtableQueueItem = async (itemId: string) => {
    console.log('🗑️ Deleting Airtable queue item:', itemId)

    try {
      const response = await fetch('/api/airtable/queue/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recordId: itemId }),
      })

      if (response.ok) {
        // Remove from frontend state after successful deletion
        setAirtableQueueItems(prev => prev.filter(item => item.id !== itemId))
        console.log('✅ Successfully deleted item from Airtable and frontend')
      } else {
        const errorData = await response.text()
        console.error('❌ Failed to delete item from Airtable. Status:', response.status, 'Response:', errorData)
        alert('Failed to delete item from queue')
      }
    } catch (error) {
      console.error('❌ Error deleting item:', error)
      alert('Error deleting item from queue')
    }
  }

  const moveAirtableItem = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    setIsReorderingAirtable(true)
    try {
      // Create new order array
      const newOrder = [...airtableQueueItems]
      const [movedItem] = newOrder.splice(fromIndex, 1)
      newOrder.splice(toIndex, 0, movedItem)

      // Update order (priority is no longer used)
      const updatedItems = newOrder

      // Send reorder request
      const response = await fetch('/api/airtable/queue/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userEmail: storedEmail,
          newOrder: updatedItems.map(item => item.id)
        }),
      })

      if (response.ok) {
        setAirtableQueueItems(updatedItems)
      } else {
        console.error('Failed to reorder Airtable queue items')
      }
    } catch (error) {
      console.error('Error reordering Airtable queue items:', error)
    } finally {
      setIsReorderingAirtable(false)
    }
  }

  const handleAirtableDragStart = (e: React.DragEvent, id: string) => {
    setDraggedAirtableItem(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleAirtableDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleAirtableDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedAirtableItem || draggedAirtableItem === targetId) return

    const draggedIndex = airtableQueueItems.findIndex(item => item.id === draggedAirtableItem)
    const targetIndex = airtableQueueItems.findIndex(item => item.id === targetId)
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      moveAirtableItem(draggedIndex, targetIndex)
    }
    setDraggedAirtableItem(null)
  }

  const handleSaveEmail = () => {
    // Clear any existing local queue when a new user signs in
    setQueue(prev => {
      // Clean up all local preview URLs
      prev.forEach(item => {
        if (item.localPreview && item.localPreview.startsWith('blob:')) {
          URL.revokeObjectURL(item.localPreview)
        }
      })
      return []
    })
    setStatus('')

    // Set theme based on email
    setEmailTheme(email)

    localStorage.setItem('uploader_email', email)
    localStorage.setItem('uploader_action', 'login')
    localStorage.setItem('uploader_timestamp', new Date().toISOString())
    setStoredEmail(email)
  }


  const onDrop = async (acceptedFiles: File[]) => {
    // Check file sizes
    const maxSize = 10 * 1024 * 1024 // 10MB
    const oversizedFiles = acceptedFiles.filter(file => file.size > maxSize)

    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(', ')
      alert(`The following files are too large (max 10MB): ${fileNames}`)
      // Only add files that are within size limit
      const validFiles = acceptedFiles.filter(file => file.size <= maxSize)
      if (validFiles.length === 0) return
      acceptedFiles = validFiles
    }

    if (!storedEmail) {
      alert('Please enter your email to continue')
      return
    }

    // Immediately add files to local queue and start processing
    const newQueueItems: QueueItem[] = acceptedFiles.map(file => {
      return {
        id: `local-${Date.now()}-${Math.random()}`,
        file,
        status: 'pending',
        localPreview: URL.createObjectURL(file),
        fileSize: file.size,
        // Enhanced fields with defaults
        notes: defaultNotes,
        publishDate: defaultPublishDate,
        owner: defaultOwner,
        metadata: {
          originalName: file.name,
          mimeType: file.type,
          lastModified: file.lastModified,
          uploadTimestamp: Date.now()
        }
      }
    })

    setQueue(prev => [...prev, ...newQueueItems])
    setStatus(`Added ${acceptedFiles.length} file${acceptedFiles.length !== 1 ? 's' : ''} to queue`)

    // Images are now queued and ready for manual processing
  }

  const uploadToCloudinary = async (item: QueueItem): Promise<string> => {
    console.log('📤 Starting Cloudinary upload for:', item.file.name)
    console.log('📁 File details:', {
      name: item.file.name,
      size: item.file.size,
      type: item.file.type
    })
    
    const formData = new FormData()
    formData.append('file', item.file)
    
    console.log('📋 FormData created, making request to /api/upload...')
    
    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    console.log('📡 Upload response status:', uploadResponse.status)
    console.log('📡 Upload response ok:', uploadResponse.ok)

    if (!uploadResponse.ok) {
      let errorMessage = `Failed to upload ${item.file.name}`

      try {
        const errorData = await uploadResponse.json()
        console.error('❌ Upload failed with status:', uploadResponse.status)
        console.error('❌ Error response:', errorData)

        // Use the user-friendly message if available
        if (errorData.userMessage) {
          errorMessage = errorData.userMessage
        } else if (errorData.error) {
          errorMessage = errorData.error
        }
      } catch {
        // Fallback to text if JSON parsing fails
        const errorText = await uploadResponse.text()
        console.error('❌ Upload failed with status:', uploadResponse.status)
        console.error('❌ Error response:', errorText)
        errorMessage = `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`
      }

      throw new Error(errorMessage)
    }

    const uploadResult = await uploadResponse.json()
    console.log('✅ Upload result:', uploadResult)
    return uploadResult.imageUrl
  }

  const processQueue = async () => {
    console.log('🚀 Starting process queue...')
    console.log('📧 Stored email:', storedEmail)
    console.log('📦 Queue length:', queue.length)
    
    if (!storedEmail || queue.length === 0) {
      console.log('❌ No email or queue items')
      alert('No items in queue to process')
      return
    }

    setIsProcessing(true)
    setStatus('Processing queue...')

    try {
      // First, upload all pending items to Cloudinary
      const itemsToProcess = queue.filter(item => item.status === 'pending')
      console.log('📤 Items to process:', itemsToProcess.length)
      
      if (itemsToProcess.length === 0) {
        console.log('❌ No pending items to process')
        setStatus('No pending items to process')
        setIsProcessing(false)
        return
      }

      setStatus(`Uploading ${itemsToProcess.length} images to Cloudinary...`)

      // Track completed uploads
      const completedUploads: Array<{ item: QueueItem; cloudinaryUrl: string }> = []

      // Upload each item to Cloudinary
      for (let i = 0; i < itemsToProcess.length; i++) {
        const item = itemsToProcess[i]
        console.log(`📤 Processing item ${i + 1}/${itemsToProcess.length}:`, item.file.name)
        
        // Update status to uploading
        setQueue(prev => prev.map(queueItem => 
          queueItem.id === item.id 
            ? { ...queueItem, status: 'uploading' as const }
            : queueItem
        ))

        try {
          console.log(`☁️ Uploading ${item.file.name} to Cloudinary...`)
          const cloudinaryUrl = await uploadToCloudinary(item)
          console.log(`✅ Successfully uploaded ${item.file.name}:`, cloudinaryUrl)
          
          // Track successful upload
          completedUploads.push({ item, cloudinaryUrl })
          
          // Update item with Cloudinary URL
          setQueue(prev => {
            console.log('🔄 Updating queue state...')
            console.log('📦 Current queue items:', prev.map(q => ({ id: q.id, status: q.status, hasCloudinaryUrl: !!q.cloudinaryUrl })))
            
            const updatedQueue = prev.map(queueItem => 
              queueItem.id === item.id 
                ? { ...queueItem, status: 'completed' as const, cloudinaryUrl }
                : queueItem
            )
            
            console.log('📦 Updated queue items:', updatedQueue.map(q => ({ id: q.id, status: q.status, hasCloudinaryUrl: !!q.cloudinaryUrl })))
            return updatedQueue
          })
        } catch (error) {
          console.error(`❌ Failed to upload ${item.file.name}:`, error)
          
          // Update item with error
          setQueue(prev => prev.map(queueItem => 
            queueItem.id === item.id 
              ? { 
                  ...queueItem, 
                  status: 'error' as const, 
                  uploadError: error instanceof Error ? error.message : 'Upload failed'
                }
              : queueItem
          ))
        }
      }

      // Now send all successfully uploaded items to Airtable
      console.log('🔍 Checking completed uploads...')
      console.log('📊 Completed uploads count:', completedUploads.length)
      
      if (completedUploads.length === 0) {
        console.log('❌ No completed uploads to send to Airtable')
        setStatus('No items successfully uploaded to process')
        setIsProcessing(false)
        return
      }

      const destination = 'Image Bank'
      setStatus(`Sending ${completedUploads.length} items to ${destination}...`)
      console.log(`📤 Preparing to send items to ${destination}...`)

      // Send each item individually with enhanced fields using the enhanced API
      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      for (let i = 0; i < completedUploads.length; i++) {
        const { item, cloudinaryUrl } = completedUploads[i]

        setStatus(`Adding item ${i + 1}/${completedUploads.length} to Image Bank...`)

        try {
          // Process filename with prefix if provided
          const processedFileName = defaultFileName
            ? `${defaultFileName}_${item.file.name}`
            : item.file.name

          // All uploads now go to bank
          const endpoint = '/api/airtable/bank/add'

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: storedEmail,
              imageData: {
                url: cloudinaryUrl,
                name: processedFileName,
                size: item.file.size,
                notes: item.notes,
                publishDate: item.publishDate,
                owner: item.owner,
                metadata: {
                  ...item.metadata,
                  processedAt: new Date().toISOString()
                }
              }
            })
          })

          if (response.ok) {
            const result = await response.json()

            // Save to localStorage
            const bankKey = `imageBank_${storedEmail}`
            const existingBank = JSON.parse(localStorage.getItem(bankKey) || '[]')
            existingBank.push(result.bankedItem)
            localStorage.setItem(bankKey, JSON.stringify(existingBank))

            successCount++
          } else {
            errorCount++
            const errorData = await response.json()
            errors.push(`${item.file.name}: ${errorData.error}`)
          }
        } catch (error) {
          errorCount++
          errors.push(`${item.file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // Create a mock bulk response for compatibility
      const bulkResponse = {
        ok: successCount > 0,
        status: successCount === completedUploads.length ? 200 : 207, // 207 = partial success
        statusText: successCount === completedUploads.length ? 'OK' : 'Multi-Status',
        json: async () => ({
          summary: { successful: successCount, failed: errorCount },
          errors: errors.map(error => ({ message: error }))
        }),
        text: async () => errors.join(', ')
      }

      console.log('📡 Airtable bulk response status:', bulkResponse.status)
      console.log('📡 Airtable bulk response ok:', bulkResponse.ok)

      if (!bulkResponse.ok) {
        const errorText = await bulkResponse.text()
        console.error('❌ Airtable bulk add failed:', errorText)
        throw new Error(`Failed to send items to Airtable queue: ${bulkResponse.status} ${bulkResponse.statusText}`)
      }

      const bulkResult = await bulkResponse.json()
      console.log('✅ Airtable bulk result:', bulkResult)
      
      if (bulkResult.errors && bulkResult.errors.length > 0) {
        console.error("🔍 Airtable item errors:", JSON.stringify(bulkResult.errors, null, 2))
        console.warn('Some items failed to queue:', bulkResult.errors)
        
        // Show specific error details to user
        const errorDetails = bulkResult.errors.map((error: { message?: string }, index: number) => 
          `Item ${index + 1}: ${error.message || 'Unknown error'}`
        ).join(', ')
        
        setStatus(`Processed ${bulkResult.summary.successful} items, ${bulkResult.summary.failed} failed. Errors: ${errorDetails}`)
      } else {
        const destination = 'Image Bank'
        setStatus(`Successfully added ${bulkResult.summary.successful} items to ${destination}. Go to Image Bank to approve them.`)

        // Create notification for successful upload
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: storedEmail,
              type: 'system',
              title: 'Images Banked',
              message: `Successfully added ${bulkResult.summary.successful} image${bulkResult.summary.successful > 1 ? 's' : ''} to ${destination}. Please approve them before they can be queued.`
            })
          })
        } catch (error) {
          console.error('Failed to create notification:', error)
        }
      }

      // Clear the local queue after successful processing
      setQueue([])

      // Refresh the Airtable queue to show the newly added items
      await fetchAirtableQueueItems()
      
    } catch (error) {
      console.error('Error processing queue:', error)
      setStatus('Error processing queue: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsProcessing(false)
    }
  }





  const clearQueue = () => {
    setQueue(prev => {
      // Clean up all local preview URLs
      prev.forEach(item => {
        if (item.localPreview && item.localPreview.startsWith('blob:')) {
          URL.revokeObjectURL(item.localPreview)
        }
      })
      return []
    })
    setStatus('Queue cleared')
  }

  const openEditModal = (itemId: string) => {
    const item = queue.find(q => q.id === itemId)
    if (!item) return

    setEditFormData({
      notes: item.notes || '',
      publishDate: item.publishDate || defaultPublishDate,
      owner: item.owner || '',
      fileName: item.file.name
    })
    setEditingItemId(itemId)
  }

  const saveEdit = () => {
    if (!editingItemId) return

    setQueue(prev => prev.map(item => {
      if (item.id === editingItemId) {
        return {
          ...item,
          notes: editFormData.notes,
          publishDate: editFormData.publishDate,
          owner: editFormData.owner,
          file: new File([item.file], editFormData.fileName, { type: item.file.type })
        }
      }
      return item
    }))

    setEditingItemId(null)
  }

  const closeEditModal = () => {
    setEditingItemId(null)
  }

  const pendingCount = queue.filter(item => item.status === 'pending').length

  // Cleanup local preview URLs on component unmount
  useEffect(() => {
    return () => {
      queue.forEach(item => {
        if (item.localPreview && item.localPreview.startsWith('blob:')) {
          URL.revokeObjectURL(item.localPreview)
        }
      })
    }
  }, [queue])

  const { getRootProps, getInputProps } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.colors.primary }}>

      {/* Email Input for non-logged in users + Share Button */}
      {!storedEmail && (
        <div className="border-b py-4 z-40 transition-all duration-300 ease-in-out" style={{ backgroundColor: theme.colors.secondary, borderColor: theme.colors.border }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center space-x-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to continue"
                className="px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent w-64"
                style={{ borderColor: theme.colors.accent, backgroundColor: theme.colors.background, color: theme.colors.text }}
                suppressHydrationWarning={true}
              />
              <button
                onClick={handleSaveEmail}
                className="px-4 py-2 text-sm rounded-lg transition-colors"
                style={{ backgroundColor: theme.colors.accent, color: theme.colors.background }}
                suppressHydrationWarning={true}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Main Content */}
      <main 
        ref={mainRef}
        className="flex-1 flex"
      >
        {storedEmail ? (
          <>
            {/* Main Upload Area */}
            <div className="flex-1 flex flex-col p-6" style={{ backgroundColor: theme.colors.background }}>
              <div className="text-center mb-8">
                <div className="relative mx-auto w-16 h-16 mb-4">
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: '2px solid transparent',
                      borderTopColor: theme.colors.text,
                      borderRightColor: theme.colors.text
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.secondary }}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.background }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
                <p className="text-lg font-semibold mb-2" style={{ color: theme.colors.text }}>Upload Your Images</p>
                <p className="text-xl max-w-2xl mx-auto" style={{ color: theme.colors.text }}>
                  Configure your default settings below, then drag and drop your images.
                </p>
              </div>




              <div className="w-full rounded-2xl overflow-hidden" style={{ backgroundColor: theme.colors.surface, border: `2px solid ${theme.colors.text}` }}>
                {/* Drop Zone Header */}
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed p-8 cursor-pointer transition-all duration-300 hover:border-opacity-70"
                  style={{ borderColor: theme.colors.text, backgroundColor: 'transparent' }}
                >
                  <input {...getInputProps()} />
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: theme.colors.secondary }}>
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.background }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold mb-2" style={{ color: theme.colors.text }}>Drop your images here</p>
                    <p className="mb-3" style={{ color: theme.colors.text }}>or click to browse files</p>
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full" style={{ backgroundColor: theme.colors.primary }}>
                        <span className="text-sm font-medium" style={{ color: theme.colors.text }}>Supports:</span>
                        <span className="text-xs" style={{ color: theme.colors.text }}>JPG, PNG, GIF, WebP up to 10MB</span>
                      </div>
                      {pendingCount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent file browser from opening
                            processQueue();
                          }}
                          disabled={isProcessing}
                          className="px-4 py-2 text-sm font-medium rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 hover:brightness-110"
                          style={{
                            backgroundColor: isProcessing ? theme.colors.textSecondary : theme.colors.primary,
                            color: theme.colors.background,
                            boxShadow: pendingCount > 0 ? '0 0 10px rgba(143, 168, 168, 0.5)' : 'none'
                          }}
                        >
                          {isProcessing ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                              </svg>
                              <span>Process {pendingCount}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>


                {/* Image Preview Area - Integrated in drop zone */}
                {queue.length > 0 && (
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold" style={{ color: theme.colors.text }}>
                        {queue.length} image{queue.length !== 1 ? 's' : ''} queued
                      </h4>
                      <button
                        onClick={clearQueue}
                        disabled={isProcessing}
                        className="px-3 py-2 text-sm rounded-full border transition-all disabled:opacity-50 hover:bg-red-50"
                        style={{ borderColor: theme.colors.primary, color: theme.colors.text, backgroundColor: theme.colors.primary }}
                      >
                        Clear All
                      </button>
                    </div>

                    {/* Image Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {queue.map((item) => (
                        <div key={item.id} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 hover:border-opacity-70" style={{ borderColor: item.status === 'error' ? theme.colors.error : item.status === 'completed' ? theme.colors.success : item.status === 'uploading' ? theme.colors.warning : theme.colors.textSecondary }}>
                            {item.localPreview && (
                              <img
                                src={item.localPreview}
                                alt={item.file.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            )}

                            {/* Status Overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center">
                              <div className="text-center text-white text-xs mb-2">
                                <p className="font-medium mb-1 truncate px-2">{item.file.name}</p>
                                <p>{(item.file.size / 1024 / 1024).toFixed(1)} MB</p>
                              </div>
                              {item.status === 'pending' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openEditModal(item.id)
                                  }}
                                  className="p-2 bg-white text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
                                  title="Edit photo details"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              )}
                            </div>

                            {/* Status Badge */}
                            <div className="absolute top-2 right-2">
                              {item.status === 'uploading' && (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              )}
                              {item.status === 'completed' && (
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                              {item.status === 'error' && (
                                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </div>
                              )}
                              {item.status === 'pending' && (
                                <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* File Info */}
                          <div className="mt-2 text-xs" style={{ color: theme.colors.text }}>
                            <p className="font-medium truncate" title={item.file.name}>{item.file.name}</p>
                            <div className="flex justify-between mt-1">
                              <span>{(item.file.size / 1024 / 1024).toFixed(1)} MB</span>
                              <span className="capitalize font-medium" style={{ color: item.status === 'error' ? theme.colors.error : item.status === 'completed' ? theme.colors.success : item.status === 'uploading' ? theme.colors.warning : theme.colors.textSecondary }}>
                                {item.status}
                              </span>
                            </div>
                            {item.uploadError && (
                              <p className="text-red-500 mt-1 truncate" title={item.uploadError}>Error: {item.uploadError}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {status && (
                <div className="mt-4 text-center">
                  <p className="text-gray-600">{status}</p>
                </div>
              )}

            </div>

            {/* Publishing Queue Sidebar */}
            <div className="w-80 min-w-80 max-w-80 shadow-lg border-l transition-all duration-300 z-30 h-screen max-h-screen overflow-hidden" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
              <div className="h-full flex flex-col">
                {/* Queue Header */}
                <div className="p-3 border-b flex-shrink-0" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.secondary }}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold" style={{ color: theme.colors.text }}>
                      Publishing Queue ({airtableQueueItems.length})
                      {pendingCount > 0 && <span className="ml-2 text-xs">({pendingCount} pending)</span>}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {queue.length > 0 && (
                        <button
                          onClick={clearQueue}
                          disabled={isProcessing}
                          className="p-1.5 rounded-md transition-all disabled:opacity-50 hover:bg-red-500 hover:bg-opacity-20 text-red-600"
                          title="Clear local queue"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={fetchAirtableQueueItems}
                        disabled={isLoadingAirtableQueue || isProcessing}
                        className="p-1.5 rounded-md transition-all disabled:opacity-50 hover:bg-white hover:bg-opacity-20"
                        style={{ color: theme.colors.textSecondary }}
                        title="Refresh queue"
                      >
                        <svg className={`w-4 h-4 ${isLoadingAirtableQueue ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Queue Items */}
                <div
                  ref={sidebarScrollRef}
                  className="flex-1 overflow-y-auto p-4 min-h-0"
                >
                  {airtableQueueItems.length > 0 ? (
                    <div className="space-y-3">
                      {airtableQueueItems.map((item, index) => (
                        <div
                          key={item.id}
                          draggable={!isReorderingAirtable}
                          onDragStart={(e) => handleAirtableDragStart(e, item.id)}
                          onDragOver={handleAirtableDragOver}
                          onDrop={(e) => handleAirtableDrop(e, item.id)}
                          className={`bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-all cursor-move ${
                            draggedAirtableItem === item.id ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            {/* Queue Number */}
                            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-blue-600">#{index + 1}</span>
                            </div>

                            {/* Image thumbnail */}
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                              <img
                                src={item.imageUrl}
                                alt={item.fileName || 'Image'}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                decoding="async"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                }}
                              />
                            </div>

                            {/* File info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.fileName || 'Unknown'}</p>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500 text-white">
                                    In Queue
                                  </span>
                                  <button
                                    onClick={() => deleteAirtableQueueItem(item.id)}
                                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                    title="Remove from queue"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>

                                <div className="text-xs text-gray-500">
                                  <span>Uploaded: {new Date(item.uploadDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>

                            {/* Drag handle */}
                            <div className="flex flex-col space-y-0.5 items-center">
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Publishing Queue</h3>
                      <p className="text-sm text-gray-500">Your processed images will appear here</p>
                      <p className="text-xs text-gray-400 mt-2">Drop images to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: theme.colors.border }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>Sign In</h3>
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all"
                    style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.background, color: theme.colors.text }}
                    suppressHydrationWarning={true}
                  />
                  <button
                    onClick={handleSaveEmail}
                    className="px-6 py-3 font-medium rounded-lg transition-all hover:shadow-sm"
                    style={{ backgroundColor: theme.colors.primary, color: theme.colors.background }}
                    suppressHydrationWarning={true}
                  >
                    Continue
                  </button>
                </div>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                  Don&apos;t have an account? Just enter your email to get started.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6" style={{ backgroundColor: theme.colors.secondary, borderColor: theme.colors.primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: theme.colors.primary }}>
                <span className="font-bold text-xs" style={{ color: theme.colors.surface }}>C</span>
              </div>

            </div>
            
            <div className="flex items-center space-x-6 text-sm" style={{ color: theme.colors.surface }}>
              <Link href="#" className="transition-colors" style={{ color: theme.colors.surface }}>Help</Link>
              <Link href="#" className="transition-colors" style={{ color: theme.colors.surface }}>Support</Link>

            </div>
          </div>
        </div>
      </footer>

      {/* Share Workspace Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="max-w-md w-full rounded-2xl p-6 shadow-2xl" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: theme.colors.text }}>Share Workspace</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: theme.colors.text }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>
              Send an invitation email with a magic link. When they click it, they&apos;ll be automatically logged in with access to your workspace theme - no password needed!
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                  Message (Optional)
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Join our workspace to collaborate..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 resize-none"
                  style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={async () => {
                    if (!inviteEmail) return

                    try {
                      const response = await fetch('/api/invite', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          email: inviteEmail,
                          message: inviteMessage,
                          workspaceCode: localStorage.getItem('theme_password'),
                          senderEmail: storedEmail
                        })
                      })

                      const data = await response.json()

                      if (response.ok) {
                        setInviteMessage('✓ Email invitation will be sent! (Email service not configured yet - invite link logged to console)')
                        console.log('📧 INVITE LINK:', data.inviteLink)
                        setTimeout(() => {
                          setShowShareModal(false)
                          setInviteEmail('')
                          setInviteMessage('')
                        }, 3000)
                      } else {
                        setInviteMessage('Error: ' + (data.error || 'Failed to send invite'))
                      }
                    } catch (error) {
                      console.error('Invite error:', error)
                      setInviteMessage('Error sending invite. Please try again.')
                    }
                  }}
                  disabled={!inviteEmail}
                  className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: theme.colors.accent, color: theme.colors.background }}
                >
                  Send Invitation Email
                </button>
                <button
                  onClick={() => {
                    setShowShareModal(false)
                    setInviteEmail('')
                    setInviteMessage('')
                  }}
                  className="px-4 py-3 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Photo Details Modal */}
      {editingItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="max-w-md w-full rounded-2xl p-6 shadow-2xl" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: theme.colors.text }}>Edit Photo Details</h3>
              <button
                onClick={closeEditModal}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: theme.colors.text }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                  File Name
                </label>
                <input
                  type="text"
                  value={editFormData.fileName}
                  onChange={(e) => setEditFormData({ ...editFormData, fileName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                  Publish Date
                </label>
                <input
                  type="date"
                  value={editFormData.publishDate}
                  onChange={(e) => setEditFormData({ ...editFormData, publishDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                  Owner
                </label>
                <input
                  type="text"
                  value={editFormData.owner}
                  onChange={(e) => setEditFormData({ ...editFormData, owner: e.target.value })}
                  placeholder="Image owner/client..."
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                  Notes
                </label>
                <textarea
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  placeholder="Add notes about this image..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 resize-none"
                  style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text }}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={saveEdit}
                  className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: theme.colors.accent, color: theme.colors.background }}
                >
                  Save Changes
                </button>
                <button
                  onClick={closeEditModal}
                  className="px-4 py-3 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: theme.colors.surface, color: theme.colors.text }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
