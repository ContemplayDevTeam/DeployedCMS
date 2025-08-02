'use client'

import { useState, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'

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
}

export default function Home() {
  const [email, setEmail] = useState<string>('')
  const [storedEmail, setStoredEmail] = useState<string>('')
  const [userAction, setUserAction] = useState<string>('')
  const [lastLogin, setLastLogin] = useState<string>('')
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [status, setStatus] = useState<string>('')
  const [showQueue, setShowQueue] = useState<boolean>(true)
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const mainRef = useRef<HTMLDivElement>(null)

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

  const handleSaveEmail = () => {
    localStorage.setItem('uploader_email', email)
    localStorage.setItem('uploader_action', 'login')
    localStorage.setItem('uploader_timestamp', new Date().toISOString())
    setStoredEmail(email)
    setUserAction('login')
    setLastLogin(new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString())
  }

  const handleLogout = () => {
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

    // Immediately add files to local queue with previews
    const newQueueItems: QueueItem[] = acceptedFiles.map(file => ({
      id: `local-${Date.now()}-${Math.random()}`,
      file,
      status: 'pending',
      selected: false,
      localPreview: URL.createObjectURL(file),
      fileSize: file.size
    }))

    setQueue(prev => [...prev, ...newQueueItems])
    setStatus(`${acceptedFiles.length} file${acceptedFiles.length !== 1 ? 's' : ''} added to local queue`)
  }

  const uploadToCloudinary = async (item: QueueItem): Promise<string> => {
    const formData = new FormData()
    formData.append('file', item.file)
    
    const uploadResponse = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload ${item.file.name} to Cloudinary`)
    }

    const uploadResult = await uploadResponse.json()
    return uploadResult.imageUrl
  }

  const processQueue = async () => {
    if (!storedEmail || queue.length === 0) {
      alert('No items in queue to process')
      return
    }

    setIsProcessing(true)
    setStatus('Processing queue...')

    try {
      // First, upload all pending items to Cloudinary
      const itemsToProcess = queue.filter(item => item.status === 'pending')
      
      if (itemsToProcess.length === 0) {
        setStatus('No pending items to process')
        setIsProcessing(false)
        return
      }

      setStatus(`Uploading ${itemsToProcess.length} images to Cloudinary...`)

      // Upload each item to Cloudinary
      for (let i = 0; i < itemsToProcess.length; i++) {
        const item = itemsToProcess[i]
        
        // Update status to uploading
        setQueue(prev => prev.map(queueItem => 
          queueItem.id === item.id 
            ? { ...queueItem, status: 'uploading' as const }
            : queueItem
        ))

        try {
          const cloudinaryUrl = await uploadToCloudinary(item)
          
          // Update item with Cloudinary URL
          setQueue(prev => prev.map(queueItem => 
            queueItem.id === item.id 
              ? { ...queueItem, status: 'completed' as const, cloudinaryUrl }
              : queueItem
          ))
        } catch (error) {
          console.error(`Failed to upload ${item.file.name}:`, error)
          
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
      const completedItems = queue.filter(item => item.status === 'completed' && item.cloudinaryUrl)
      
      if (completedItems.length === 0) {
        setStatus('No items successfully uploaded to process')
        setIsProcessing(false)
        return
      }

      setStatus(`Sending ${completedItems.length} items to Airtable queue...`)

      const queueItemsForAirtable = completedItems.map(item => ({
        id: item.id,
        file: item.file,
        imageUrl: item.cloudinaryUrl!,
        fileName: item.file.name,
        fileSize: item.file.size,
        notes: 'Uploaded via web interface',
        publishDate: new Date().toISOString().split('T')[0], // Today's date
        metadata: {
          uploadDate: new Date().toISOString(),
          originalFileName: item.file.name,
          fileType: item.file.type
        }
      }))

      const bulkResponse = await fetch('/api/airtable/queue/bulk-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: storedEmail,
          queueItems: queueItemsForAirtable
        })
      })

      if (!bulkResponse.ok) {
        throw new Error('Failed to send items to Airtable queue')
      }

      const bulkResult = await bulkResponse.json()
      
      if (bulkResult.errors && bulkResult.errors.length > 0) {
        console.warn('Some items failed to queue:', bulkResult.errors)
        setStatus(`Processed ${bulkResult.summary.successful} items, ${bulkResult.summary.failed} failed`)
      } else {
        setStatus(`Successfully processed ${bulkResult.summary.successful} items`)
      }

      // Clear the local queue after successful processing
      setQueue([])
      
    } catch (error) {
      console.error('Error processing queue:', error)
      setStatus('Error processing queue: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsProcessing(false)
    }
  }

  const removeFromQueue = (id: string) => {
    setQueue(prev => {
      const itemToRemove = prev.find(item => item.id === id)
      // Clean up local preview URL if it exists
      if (itemToRemove?.localPreview && itemToRemove.localPreview.startsWith('blob:')) {
        URL.revokeObjectURL(itemToRemove.localPreview)
      }
      return prev.filter(item => item.id !== id)
    })
  }

  const removeSelectedFromQueue = () => {
    setQueue(prev => {
      // Clean up local preview URLs for selected items
      prev.forEach(item => {
        if (item.selected && item.localPreview && item.localPreview.startsWith('blob:')) {
          URL.revokeObjectURL(item.localPreview)
        }
      })
      return prev.filter(item => !item.selected)
    })
    setIsSelectMode(false)
  }

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode)
    if (isSelectMode) {
      // Clear all selections when exiting select mode
      setQueue(prev => prev.map(item => ({ ...item, selected: false })))
    }
  }

  const toggleItemSelection = (id: string) => {
    setQueue(prev => prev.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ))
  }

  const selectAll = () => {
    setQueue(prev => prev.map(item => ({ ...item, selected: true })))
  }

  const deselectAll = () => {
    setQueue(prev => prev.map(item => ({ ...item, selected: false })))
  }

  const moveInQueue = (fromIndex: number, toIndex: number) => {
    setQueue(prev => {
      const newQueue = [...prev]
      const [movedItem] = newQueue.splice(fromIndex, 1)
      newQueue.splice(toIndex, 0, movedItem)
      return newQueue
    })
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedItem || draggedItem === targetId) return

    const draggedIndex = queue.findIndex(item => item.id === draggedItem)
    const targetIndex = queue.findIndex(item => item.id === targetId)
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      moveInQueue(draggedIndex, targetIndex)
    }
    setDraggedItem(null)
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
    setIsSelectMode(false)
  }

  const selectedCount = queue.filter(item => item.selected).length
  const pendingCount = queue.filter(item => item.status === 'pending').length
  const completedCount = queue.filter(item => item.status === 'completed').length
  const errorCount = queue.filter(item => item.status === 'error').length

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
      {/* Header */}
      <header className="shadow-sm border-b z-50" style={{ backgroundColor: '#8FA8A8', borderColor: '#4A5555' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Left side - Logo and navigation */}
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#4A5555' }}>
                  <span className="font-bold text-sm" style={{ color: '#D0DADA' }}>C</span>
                </div>
                <span className="text-xl font-bold" style={{ color: '#D0DADA' }}>
                  ContemPlay
                </span>
              </Link>
              
              <Link 
                href="/" 
                className="transition-colors flex items-center space-x-1"
                style={{ color: '#D0DADA' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Home</span>
              </Link>
            </div>

            {/* Center - Welcome message */}
            {storedEmail && (
              <div className="text-center">
                <p className="text-sm" style={{ color: '#D0DADA' }}>
                  Welcome back, <span className="font-medium" style={{ color: '#4A5555' }}>{storedEmail}</span>
                  <span className="mx-2">•</span>
                  {userAction === 'signup' ? 'New account' : 'Logged in'} on {lastLogin}
                </p>
              </div>
            )}

            {/* Right side - Sign out only */}
            <div className="flex items-center space-x-4">
              {storedEmail && (
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm rounded-lg transition-colors"
                  style={{ color: '#D0DADA', backgroundColor: '#4A5555' }}
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Email Input for non-logged in users */}
      {!storedEmail && (
        <div className="border-b py-4 z-40 transition-all duration-300 ease-in-out" style={{ backgroundColor: '#8FA8A8', borderColor: '#4A5555' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center space-x-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to continue"
                className="px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent w-64"
                style={{ borderColor: '#4A5555', backgroundColor: '#D0DADA', color: '#4A5555' }}
              />
              <button
                onClick={handleSaveEmail}
                className="px-4 py-2 text-sm rounded-lg transition-colors"
                style={{ backgroundColor: '#4A5555', color: '#D0DADA' }}
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
            {/* Queue Sidebar */}
            <div className={`shadow-lg border-r transition-all duration-300 z-30 ${
              showQueue ? 'w-80 min-w-80' : 'w-0'
            } overflow-hidden`} style={{ backgroundColor: '#D0DADA', borderColor: '#4A5555' }}>
              <div className="h-full flex flex-col">
                {/* Queue Header */}
                <div className="p-2 border-b" style={{ borderColor: '#4A5555', backgroundColor: '#8FA8A8' }}>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold" style={{ color: '#4A5555' }}>Local Queue</h3>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setShowQueue(false)}
                        className="p-1 transition-colors"
                        style={{ color: '#4A5555' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#4A5555' }}>
                    {queue.length} file{queue.length !== 1 ? 's' : ''} in queue
                    {pendingCount > 0 && ` • ${pendingCount} pending`}
                    {completedCount > 0 && ` • ${completedCount} ready`}
                    {errorCount > 0 && ` • ${errorCount} failed`}
                  </p>
                  
                  {/* Selection controls */}
                  {queue.length > 0 && (
                    <div className="flex items-center justify-between mt-2">
                      <button
                        onClick={toggleSelectMode}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          isSelectMode 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isSelectMode ? 'Cancel' : 'Select'}
                      </button>
                      
                      {isSelectMode && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={selectAll}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          >
                            All
                          </button>
                          <button
                            onClick={deselectAll}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                          >
                            None
                          </button>
                          {selectedCount > 0 && (
                            <button
                              onClick={removeSelectedFromQueue}
                              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                            >
                              Delete ({selectedCount})
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Queue Items */}
                <div className="flex-1 overflow-y-auto p-4">
                  {queue.length > 0 ? (
                    <div className="space-y-3">
                      {queue.map((item, index) => (
                        <div
                          key={item.id}
                          draggable={!isSelectMode}
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, item.id)}
                          className={`bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-all cursor-move ${
                            draggedItem === item.id ? 'opacity-50' : ''
                          } ${item.selected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                        >
                          <div className="flex items-start space-x-3">
                            {/* Queue number */}
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-gray-600">{index + 1}</span>
                            </div>
                            
                            {/* Image thumbnail */}
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                              {item.localPreview ? (
                                <img
                                  src={item.localPreview}
                                  alt={item.file.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              )}
                            </div>
                            
                            {/* File info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                {isSelectMode && (
                                  <input
                                    type="checkbox"
                                    checked={item.selected || false}
                                    onChange={() => toggleItemSelection(item.id)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                )}
                                <p className="text-sm font-medium text-gray-900 truncate">{item.file.name}</p>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                  {item.fileSize ? (item.fileSize / 1024 / 1024).toFixed(2) : '0.00'} MB
                                </p>
                                <div className="flex items-center space-x-1">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    item.status === 'uploading' ? 'bg-blue-100 text-blue-800' :
                                    item.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {item.status}
                                  </span>
                                </div>
                              </div>

                              {/* Progress bar for uploading items */}
                              {item.status === 'uploading' && item.progress !== undefined && (
                                <div className="mt-2">
                                  <div className="w-full bg-gray-200 rounded-full h-1">
                                    <div 
                                      className="bg-indigo-600 h-1 rounded-full transition-all duration-300"
                                      style={{ width: `${item.progress}%` }}
                                    ></div>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">{item.progress}%</p>
                                </div>
                              )}

                              {/* Error message */}
                              {item.status === 'error' && item.uploadError && (
                                <p className="text-xs text-red-600 mt-1">{item.uploadError}</p>
                              )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center space-x-1 ml-2">
                              {!isSelectMode && (
                                <>
                                  {/* Move up button */}
                                  {index > 0 && (
                                    <button
                                      onClick={() => moveInQueue(index, index - 1)}
                                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                      title="Move up"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                      </svg>
                                    </button>
                                  )}
                                  
                                  {/* Move down button */}
                                  {index < queue.length - 1 && (
                                    <button
                                      onClick={() => moveInQueue(index, index + 1)}
                                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                      title="Move down"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </button>
                                  )}
                                  
                                  {/* Remove button */}
                                  <button
                                    onClick={() => removeFromQueue(item.id)}
                                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                    title="Remove from queue"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </>
                              )}
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
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Local Queue</h3>
                      <p className="text-sm text-gray-500">Your uploads will appear here</p>
                      <p className="text-xs text-gray-400 mt-2">Drag files to the drop zone to get started</p>
                    </div>
                  )}
                </div>

                {/* Queue Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex space-x-2">
                    <button
                      onClick={clearQueue}
                      disabled={queue.length === 0 || isProcessing}
                      className="flex-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Clear Queue
                    </button>
                    <button
                      onClick={processQueue}
                      disabled={queue.length === 0 || isProcessing || pendingCount === 0}
                      className="flex-1 px-3 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#4A5555', color: '#D0DADA' }}
                    >
                      {isProcessing ? 'Processing...' : 'Process Queue'}
                    </button>
                  </div>
                  {pendingCount > 0 && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {pendingCount} item{pendingCount !== 1 ? 's' : ''} ready to process
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Main Upload Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#4A5555' }}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#D0DADA' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold mb-4" style={{ color: '#D0DADA' }}>Upload Your Images</h1>
                <p className="text-xl max-w-2xl mx-auto" style={{ color: '#4A5555' }}>
                  Drag and drop your images to add them to your local queue. 
                  Click &quot;Process Queue&quot; when ready to upload to Airtable.
                </p>
              </div>

              <div
                {...getRootProps()}
                className="w-full border-2 border-dashed p-16 rounded-2xl cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md"
                style={{ borderColor: '#4A5555', backgroundColor: '#D0DADA' }}
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#8FA8A8' }}>
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
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Please sign in to continue</h2>
            <p className="text-gray-600">Enter your email address to access the upload portal</p>
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
              <span className="text-sm font-medium" style={{ color: '#D0DADA' }}>ContemPlay</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm" style={{ color: '#D0DADA' }}>
              <Link href="#" className="transition-colors" style={{ color: '#D0DADA' }}>Help</Link>
              <Link href="#" className="transition-colors" style={{ color: '#D0DADA' }}>Support</Link>
              <span>© {new Date().getFullYear()} ContemPlay</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
