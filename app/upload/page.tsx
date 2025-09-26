
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Lenis from 'lenis'


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
}

interface AirtableQueueItem {
  id: string
  userEmail: string
  imageUrl: string
  fileName: string
  fileSize: number
  status: 'queued' | 'processing' | 'published' | 'failed'
  uploadDate: string
  publishDate?: string
  notes?: string
}

export default function Home() {
  const [email, setEmail] = useState<string>('')
  const [storedEmail, setStoredEmail] = useState<string>('')
  const [userAction, setUserAction] = useState<string>('')
  const [lastLogin, setLastLogin] = useState<string>('')
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

  useEffect(() => {
    const saved = localStorage.getItem('uploader_email')
    const action = localStorage.getItem('uploader_action')
    const timestamp = localStorage.getItem('uploader_timestamp')
    
    if (saved) {
      setStoredEmail(saved)
      setEmail(saved) // Pre-fill the email input
    }
    if (action) setUserAction(action)
    if (timestamp) {
      const date = new Date(timestamp)
      setLastLogin(date.toLocaleDateString() + ' ' + date.toLocaleTimeString())
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
      duration: 0.8,
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
        console.error('❌ Failed to delete item from Airtable')
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
    
    localStorage.setItem('uploader_email', email)
    localStorage.setItem('uploader_action', 'login')
    localStorage.setItem('uploader_timestamp', new Date().toISOString())
    setStoredEmail(email)
    setUserAction('login')
    setLastLogin(new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString())
  }

  const handleLogout = () => {
    // Check if there are items in local queue that haven't been processed
    if (queue.length > 0) {
      const hasUnprocessedItems = queue.some(item => item.status === 'pending' || item.status === 'uploading')
      if (hasUnprocessedItems) {
        const confirmed = confirm('You have unprocessed images in your local queue. Are you sure you want to sign out? Your unprocessed images will be lost.')
        if (!confirmed) {
          return
        }
      }
    }

    // Clear local queue when user signs out
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
    
    // Clear localStorage
    localStorage.removeItem('uploader_email')
    localStorage.removeItem('uploader_action')
    localStorage.removeItem('uploader_timestamp')
    setStoredEmail('')
    setUserAction('')
    setLastLogin('')
    setEmail('')
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
        metadata: {
          originalName: file.name,
          mimeType: file.type,
          lastModified: file.lastModified,
          uploadTimestamp: Date.now()
        }
      }
    })

    setQueue(prev => [...prev, ...newQueueItems])
    setStatus(`Processing ${acceptedFiles.length} file${acceptedFiles.length !== 1 ? 's' : ''}...`)

    // Automatically start processing the new files
    setTimeout(() => {
      processQueue()
    }, 100) // Small delay to ensure UI updates
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
      const errorText = await uploadResponse.text()
      console.error('❌ Upload failed with status:', uploadResponse.status)
      console.error('❌ Error response:', errorText)
      throw new Error(`Failed to upload ${item.file.name} to Cloudinary: ${uploadResponse.status} ${uploadResponse.statusText}`)
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

      setStatus(`Sending ${completedUploads.length} items to Airtable queue...`)
      console.log('📤 Preparing to send items to Airtable...')

      // Send each item individually with enhanced fields using the enhanced API
      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      for (let i = 0; i < completedUploads.length; i++) {
        const { item, cloudinaryUrl } = completedUploads[i]

        setStatus(`Adding item ${i + 1}/${completedUploads.length} to Airtable queue...`)

        try {
          const response = await fetch('/api/airtable/queue/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: storedEmail,
              imageData: {
                url: cloudinaryUrl,
                name: item.file.name,
                size: item.file.size,
                notes: item.notes,
                publishDate: item.publishDate,
                metadata: {
                  ...item.metadata,
                  processedAt: new Date().toISOString()
                }
              }
            })
          })

          if (response.ok) {
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
        setStatus(`Successfully processed ${bulkResult.summary.successful} items`)
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#8FA8A8' }}>

      {/* Email Input for non-logged in users */}
      {!storedEmail && (
        <div className="border-b py-4 z-40 transition-all duration-300 ease-in-out" style={{ backgroundColor: '#939b7e', borderColor: '#42504d' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center space-x-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to continue"
                className="px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent w-64"
                style={{ borderColor: '#f05d43', backgroundColor: '#FFFFFF', color: '#42504d' }}
                suppressHydrationWarning={true}
              />
              <button
                onClick={handleSaveEmail}
                className="px-4 py-2 text-sm rounded-lg transition-colors"
                style={{ backgroundColor: '#f05d43', color: '#FFFFFF' }}
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
            <div className="flex-1 flex flex-col p-6" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 relative" style={{ backgroundColor: '#939b7e' }}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#4A5555' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <motion.div
                    className="absolute -inset-1 rounded-full opacity-60"
                    style={{
                      border: '2px solid transparent',
                      borderTopColor: '#4A5555',
                      borderRightColor: '#4A5555'
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 12,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </div>
                <h1 className="text-4xl font-bold mb-4" style={{ color: '#D0DADA' }}>Upload Your Images</h1>
                <p className="text-xl max-w-2xl mx-auto" style={{ color: '#4A5555' }}>
                  Configure your default settings below, then drag and drop your images.
                </p>
              </div>

              {/* Enhanced Upload Settings */}
              <div className="max-w-2xl mx-auto mb-8 p-6 rounded-xl border" style={{ backgroundColor: '#F8F9FA', borderColor: '#E5E7EB' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#4A5555' }}>Upload Settings</h3>
                <div className="grid md:grid-cols-2 gap-4">

                  {/* Publish Date */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                      Publish Date
                    </label>
                    <input
                      type="date"
                      value={defaultPublishDate}
                      onChange={(e) => setDefaultPublishDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      style={{ borderColor: '#D1D5DB', backgroundColor: '#FFFFFF' }}
                    />
                  </div>

                  {/* Default Notes */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#6B7280' }}>
                      Default Notes
                    </label>
                    <input
                      type="text"
                      value={defaultNotes}
                      onChange={(e) => setDefaultNotes(e.target.value)}
                      placeholder="Optional notes..."
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      style={{ borderColor: '#D1D5DB', backgroundColor: '#FFFFFF' }}
                    />
                  </div>
                </div>
              </div>

              {/* Process Button */}
              {queue.length > 0 && (
                <div className="max-w-2xl mx-auto mb-6 text-center">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-sm" style={{ color: '#4A5555' }}>Ready to process {queue.length} image{queue.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={clearQueue}
                        disabled={isProcessing}
                        className="px-4 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                        style={{ backgroundColor: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB' }}
                      >
                        Clear
                      </button>
                      <button
                        onClick={processQueue}
                        disabled={isProcessing || pendingCount === 0}
                        className="px-6 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm"
                        style={{ backgroundColor: '#f05d43', color: '#FFFFFF' }}
                      >
                        {isProcessing ? 'Processing...' : 'Process Images'}
                      </button>
                    </div>
                  </div>
                </div>
              )}


              <div
                {...getRootProps()}
                className="w-full border-2 border-dashed p-16 rounded-2xl cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md"
                style={{ borderColor: '#4A5555', backgroundColor: '#D0DADA' }}
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#939b7e' }}>
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#4A5555' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-xl font-semibold mb-3" style={{ color: '#4A5555' }}>Drop your images here</p>
                  <p className="mb-4" style={{ color: '#4A5555' }}>or click to browse files</p>
                  <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full" style={{ backgroundColor: '#8FA8A8' }}>
                    <span className="text-sm font-medium" style={{ color: '#4A5555' }}>Supports:</span>
                    <span className="text-xs" style={{ color: '#4A5555' }}>JPG, PNG, GIF, WebP up to 10MB</span>
                  </div>
                </div>
              </div>

              {status && (
                <div className="mt-4 text-center">
                  <p className="text-gray-600">{status}</p>
                </div>
              )}

            </div>

            {/* Publishing Queue Sidebar */}
            <div className="w-80 min-w-80 max-w-80 shadow-xl border-l-2 border-r-2 border-t-2 border-b-2 transition-all duration-300 z-30 h-screen max-h-screen overflow-hidden" style={{ backgroundColor: '#D0DADA', borderColor: '#4A5555' }}>
              <div className="h-full flex flex-col">
                {/* Queue Header */}
                <div className="p-3 border-b-2 flex-shrink-0" style={{ borderColor: '#4A5555', backgroundColor: '#8FA8A8' }}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold" style={{ color: '#4A5555' }}>
                      Publishing Queue ({airtableQueueItems.length})
                    </h3>
                    <button
                      onClick={fetchAirtableQueueItems}
                      disabled={isLoadingAirtableQueue}
                      className="p-1.5 rounded-md transition-all disabled:opacity-50 hover:bg-white hover:bg-opacity-20"
                      style={{ color: '#4A5555' }}
                      title="Refresh queue"
                    >
                      <svg className={`w-4 h-4 ${isLoadingAirtableQueue ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
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
                                  <span className="text-xs px-2 py-1 rounded-full" style={{
                                    backgroundColor: item.status === 'published' ? '#10B981' :
                                                    item.status === 'processing' ? '#F59E0B' :
                                                    item.status === 'failed' ? '#EF4444' : '#6B7280',
                                    color: '#FFFFFF'
                                  }}>
                                    {item.status === 'queued' ? 'Queued' : item.status}
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
              <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: '#E5E7EB' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#4A5555' }}>Sign In</h3>
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all"
                    style={{ borderColor: '#D1D5DB', backgroundColor: '#FFFFFF', color: '#4A5555' }}
                    suppressHydrationWarning={true}
                  />
                  <button
                    onClick={handleSaveEmail}
                    className="px-6 py-3 font-medium rounded-lg transition-all hover:shadow-sm"
                    style={{ backgroundColor: '#8FA8A8', color: '#FFFFFF' }}
                    suppressHydrationWarning={true}
                  >
                    Continue
                  </button>
                </div>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  Don&apos;t have an account? Just enter your email to get started.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6" style={{ backgroundColor: '#4A5555', borderColor: '#8FA8A8' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: '#8FA8A8' }}>
                <span className="font-bold text-xs" style={{ color: '#D0DADA' }}>C</span>
              </div>

            </div>
            
            <div className="flex items-center space-x-6 text-sm" style={{ color: '#D0DADA' }}>
              <Link href="#" className="transition-colors" style={{ color: '#D0DADA' }}>Help</Link>
              <Link href="#" className="transition-colors" style={{ color: '#D0DADA' }}>Support</Link>

            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
