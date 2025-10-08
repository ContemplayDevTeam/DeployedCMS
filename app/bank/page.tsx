'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/ThemeProvider'

interface BankedImage {
  id: string
  filename: string
  imageUrl: string
  owner?: string
  uploadedAt: string
  size?: number
  status: string
  approved?: boolean
  notes?: string
  publishDate?: string
}

interface QueueItem {
  id: string
  userEmail: string
  imageUrl: string
  fileName: string
  fileSize: number
  status?: 'queued' | 'banked' | 'processing' | 'published' | 'failed'
  uploadDate: string
  publishDate?: string
  publishTime?: string
  notes?: string
}

export default function ImageBank() {
  const router = useRouter()
  const { theme } = useTheme()
  const [bankedImages, setBankedImages] = useState<BankedImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [publishDate, setPublishDate] = useState('')
  const [publishTime, setPublishTime] = useState('')

  // Queue sidebar state
  const [queueItems, setQueueItems] = useState<QueueItem[]>([])
  const [isLoadingQueue, setIsLoadingQueue] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [isReordering, setIsReordering] = useState(false)
  const sidebarScrollRef = useRef<HTMLDivElement>(null)

  // Edit modal state
  const [editingImageId, setEditingImageId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState({
    filename: '',
    owner: '',
    notes: '',
    publishDate: ''
  })

  const fetchBankedImages = useCallback(async () => {
    const email = localStorage.getItem('uploader_email')
    if (!email) {
      router.push('/login')
      return
    }

    setIsLoading(true)
    try {
      // Read from localStorage
      const bankKey = `imageBank_${email}`
      const bankedData = JSON.parse(localStorage.getItem(bankKey) || '[]')

      // Transform to match BankedImage interface
      const images = bankedData.map((item: Record<string, unknown>) => ({
        id: item.id,
        filename: item.fileName,
        imageUrl: item.imageUrl,
        owner: item.owner,
        uploadedAt: item.uploadDate,
        size: item.fileSize,
        status: 'banked',
        approved: item.approved || false,
        notes: item.notes,
        publishDate: item.publishDate
      }))

      setBankedImages(images)
    } catch (error) {
      console.error('Error fetching banked images:', error)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const fetchQueueItems = useCallback(async () => {
    const email = localStorage.getItem('uploader_email')
    if (!email) return

    setIsLoadingQueue(true)
    try {
      const response = await fetch('/api/airtable/queue/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        const data = await response.json()
        setQueueItems(data.queueItems || [])
      } else {
        console.error('Failed to fetch queue items')
      }
    } catch (error) {
      console.error('Error fetching queue items:', error)
    } finally {
      setIsLoadingQueue(false)
    }
  }, [])

  useEffect(() => {
    fetchBankedImages()
    fetchQueueItems()
  }, [fetchBankedImages, fetchQueueItems])

  const deleteQueueItem = async (itemId: string) => {
    try {
      const response = await fetch('/api/airtable/queue/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recordId: itemId }),
      })

      if (response.ok) {
        setQueueItems(prev => prev.filter(item => item.id !== itemId))
      } else {
        alert('Failed to delete item from queue')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Error deleting item from queue')
    }
  }

  const moveQueueItem = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    const email = localStorage.getItem('uploader_email')
    if (!email) return

    setIsReordering(true)
    try {
      const newOrder = [...queueItems]
      const [movedItem] = newOrder.splice(fromIndex, 1)
      newOrder.splice(toIndex, 0, movedItem)

      const response = await fetch('/api/airtable/queue/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: email,
          newOrder: newOrder.map(item => item.id)
        }),
      })

      if (response.ok) {
        setQueueItems(newOrder)
      } else {
        console.error('Failed to reorder queue items')
      }
    } catch (error) {
      console.error('Error reordering queue items:', error)
    } finally {
      setIsReordering(false)
    }
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

    const draggedIndex = queueItems.findIndex(item => item.id === draggedItem)
    const targetIndex = queueItems.findIndex(item => item.id === targetId)

    if (draggedIndex !== -1 && targetIndex !== -1) {
      moveQueueItem(draggedIndex, targetIndex)
    }
    setDraggedItem(null)
  }

  const toggleImageSelection = (imageId: string) => {
    const newSelected = new Set(selectedImages)
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId)
    } else {
      newSelected.add(imageId)
    }
    setSelectedImages(newSelected)
  }

  const selectAll = () => {
    if (selectedImages.size === bankedImages.length) {
      setSelectedImages(new Set())
    } else {
      setSelectedImages(new Set(bankedImages.map(img => img.id)))
    }
  }

  const approveImages = async () => {
    if (selectedImages.size === 0) return

    const email = localStorage.getItem('uploader_email')
    if (!email) return

    setIsLoading(true)
    try {
      // Update localStorage
      const bankKey = `imageBank_${email}`
      const bankedData = JSON.parse(localStorage.getItem(bankKey) || '[]')

      const updatedData = bankedData.map((item: Record<string, unknown>) =>
        selectedImages.has(item.id as string) ? { ...item, approved: true } : item
      )

      localStorage.setItem(bankKey, JSON.stringify(updatedData))

      // Keep images selected after approval so user can immediately move to queue
      fetchBankedImages()
    } catch (error) {
      console.error('Error approving images:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const moveToQueue = async () => {
    if (selectedImages.size === 0) return

    const email = localStorage.getItem('uploader_email')
    if (!email) return

    // Check if all selected images are approved
    const unapprovedImages = bankedImages.filter(
      img => selectedImages.has(img.id) && !img.approved
    )

    if (unapprovedImages.length > 0) {
      alert('All images must be approved before moving to queue. Please approve them first.')
      return
    }

    // Validate required fields
    if (!publishDate) {
      alert('Please select a publish date before moving images to queue.')
      return
    }

    if (!publishTime) {
      alert('Please select a publish time before moving images to queue.')
      return
    }

    setIsLoading(true)
    try {
      // Get image data from localStorage
      const bankKey = `imageBank_${email}`
      const bankedData = JSON.parse(localStorage.getItem(bankKey) || '[]')

      // Get workspace code from localStorage
      const workspaceCode = localStorage.getItem('theme_password') || undefined

      const promises = Array.from(selectedImages).map(recordId => {
        const imageData = bankedData.find((item: Record<string, unknown>) => item.id === recordId)
        if (!imageData) return Promise.resolve()

        return fetch('/api/airtable/bank/move-to-queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            recordId,
            publishDate,
            publishTime,
            imageData,
            workspaceCode
          })
        })
      })

      await Promise.all(promises)

      // Remove moved images from localStorage
      const remainingData = bankedData.filter((item: Record<string, unknown>) => !selectedImages.has(item.id as string))
      localStorage.setItem(bankKey, JSON.stringify(remainingData))

      setSelectedImages(new Set())
      setPublishDate('')
      setPublishTime('')
      fetchBankedImages()
      fetchQueueItems() // Refresh queue to show newly added items
    } catch (error) {
      console.error('Error moving images to queue:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openEditModal = (imageId: string) => {
    const email = localStorage.getItem('uploader_email')
    if (!email) return

    const bankKey = `imageBank_${email}`
    const bankedData = JSON.parse(localStorage.getItem(bankKey) || '[]')
    const image = bankedData.find((item: Record<string, unknown>) => item.id === imageId)

    if (!image) return

    setEditFormData({
      filename: image.fileName || '',
      owner: image.owner || '',
      notes: image.notes || '',
      publishDate: image.publishDate || ''
    })
    setEditingImageId(imageId)
  }

  const saveEdit = () => {
    if (!editingImageId) return

    const email = localStorage.getItem('uploader_email')
    if (!email) return

    const bankKey = `imageBank_${email}`
    const bankedData = JSON.parse(localStorage.getItem(bankKey) || '[]')

    const updatedData = bankedData.map((item: Record<string, unknown>) =>
      item.id === editingImageId
        ? {
            ...item,
            fileName: editFormData.filename,
            owner: editFormData.owner,
            notes: editFormData.notes,
            publishDate: editFormData.publishDate
          }
        : item
    )

    localStorage.setItem(bankKey, JSON.stringify(updatedData))
    setEditingImageId(null)
    fetchBankedImages()
  }

  const closeEditModal = () => {
    setEditingImageId(null)
  }

  const deleteImage = (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    const email = localStorage.getItem('uploader_email')
    if (!email) return

    const bankKey = `imageBank_${email}`
    const bankedData = JSON.parse(localStorage.getItem(bankKey) || '[]')
    const remainingData = bankedData.filter((item: Record<string, unknown>) => item.id !== imageId)

    localStorage.setItem(bankKey, JSON.stringify(remainingData))

    // Remove from selected if it was selected
    const newSelected = new Set(selectedImages)
    newSelected.delete(imageId)
    setSelectedImages(newSelected)

    fetchBankedImages()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: theme.colors.background }}>
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.text }}>
            Image Bank
          </h1>
          <p className="text-lg" style={{ color: theme.colors.textSecondary }}>
            Manage your banked images and move them to the publishing queue when ready
          </p>
        </div>

        {/* Action Bar */}
        {bankedImages.length > 0 && (
          <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={selectAll}
                  className="px-4 py-2 rounded-lg border transition-colors"
                  style={{
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                    backgroundColor: selectedImages.size === bankedImages.length ? theme.colors.accent : 'transparent'
                  }}
                >
                  {selectedImages.size === bankedImages.length ? 'Deselect All' : 'Select All'}
                </button>

                <span style={{ color: theme.colors.textSecondary }}>
                  {selectedImages.size} selected
                </span>
              </div>

              {selectedImages.size > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={approveImages}
                    disabled={isLoading}
                    className="px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white'
                    }}
                  >
                    Approve Selected
                  </button>

                  <input
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    placeholder="Publish Date *"
                    required
                    className="px-3 py-2 rounded-lg border"
                    style={{
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text
                    }}
                  />

                  <input
                    type="time"
                    value={publishTime}
                    onChange={(e) => setPublishTime(e.target.value)}
                    required
                    className="px-3 py-2 rounded-lg border"
                    style={{
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text
                    }}
                  />

                  <button
                    onClick={moveToQueue}
                    disabled={isLoading}
                    className="px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                    style={{
                      backgroundColor: theme.colors.accent,
                      color: theme.colors.background
                    }}
                  >
                    Move to Queue
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Images Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 rounded-full animate-spin"
              style={{
                borderWidth: '4px',
                borderStyle: 'solid',
                borderLeftColor: theme.colors.accent,
                borderRightColor: theme.colors.accent,
                borderBottomColor: theme.colors.accent,
                borderTopColor: 'transparent'
              }}
            />
            <p className="mt-4" style={{ color: theme.colors.textSecondary }}>Loading banked images...</p>
          </div>
        ) : bankedImages.length === 0 ? (
          <div className="text-center py-12 rounded-lg border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.textSecondary }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium mb-2" style={{ color: theme.colors.text }}>
              No banked images
            </h3>
            <p className="mb-4" style={{ color: theme.colors.textSecondary }}>
              Upload images with the &quot;Save to Image Bank&quot; option to see them here
            </p>
            <button
              onClick={() => router.push('/upload')}
              className="px-6 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: theme.colors.accent,
                color: theme.colors.background
              }}
            >
              Go to Upload
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bankedImages.map((image) => (
              <div
                key={image.id}
                onClick={() => toggleImageSelection(image.id)}
                className="group rounded-lg border overflow-hidden cursor-pointer transition-all hover:shadow-lg"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: selectedImages.has(image.id) ? theme.colors.accent : theme.colors.border,
                  borderWidth: selectedImages.has(image.id) ? '3px' : '1px'
                }}
              >
                <div className="relative aspect-square">
                  <img
                    src={image.imageUrl}
                    alt={image.filename}
                    className="w-full h-full object-cover"
                  />
                  {selectedImages.has(image.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: theme.colors.accent }}>
                      <svg className="w-4 h-4" fill="white" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {/* Edit/Delete buttons on hover */}
                  <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditModal(image.id)
                      }}
                      className="p-2 bg-white text-gray-800 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                      title="Edit image details"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteImage(image.id)
                      }}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      title="Delete image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium truncate" style={{ color: theme.colors.text }}>
                      {image.filename}
                    </h3>
                    {image.approved && (
                      <span className="ml-2 px-2 py-1 text-xs rounded-full" style={{ backgroundColor: '#10b981', color: 'white' }}>
                        ✓ Approved
                      </span>
                    )}
                  </div>
                  {image.owner && (
                    <p className="text-sm mb-1" style={{ color: theme.colors.textSecondary }}>
                      Owner: {image.owner}
                    </p>
                  )}
                  <p className="text-sm mb-1" style={{ color: theme.colors.textSecondary }}>
                    {formatFileSize(image.size)}
                  </p>
                  <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                    Banked: {formatDate(image.uploadedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Publishing Queue Sidebar */}
      <div className="w-80 min-w-80 max-w-80 shadow-lg border-l transition-all duration-300 z-30 h-screen max-h-screen overflow-hidden" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
        <div className="h-full flex flex-col">
          {/* Queue Header */}
          <div className="p-3 border-b flex-shrink-0" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.secondary }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: theme.colors.text }}>
                Publishing Queue ({queueItems.length})
              </h3>
              <button
                onClick={fetchQueueItems}
                disabled={isLoadingQueue}
                className="p-1.5 rounded-md transition-all disabled:opacity-50 hover:bg-white hover:bg-opacity-20"
                style={{ color: theme.colors.textSecondary }}
                title="Refresh queue"
              >
                <svg className={`w-4 h-4 ${isLoadingQueue ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {queueItems.length > 0 ? (
              <div className="space-y-3">
                {queueItems.map((item, index) => (
                  <div
                    key={item.id}
                    draggable={!isReordering}
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, item.id)}
                    className={`bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-all cursor-move ${
                      draggedItem === item.id ? 'opacity-50' : ''
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
                              onClick={() => deleteQueueItem(item.id)}
                              className="p-1 text-red-400 hover:text-red-600 transition-colors"
                              title="Remove from queue"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          <div className="text-xs text-gray-500">
                            <div>Uploaded: {new Date(item.uploadDate).toLocaleDateString()}</div>
                            {item.publishDate && (
                              <div>Publish: {item.publishDate} {item.publishTime && `at ${item.publishTime}`}</div>
                            )}
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
                <p className="text-sm text-gray-500">Approved images will appear here</p>
                <p className="text-xs text-gray-400 mt-2">Move images to queue to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Image Details Modal */}
      {editingImageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="max-w-md w-full rounded-2xl p-6 shadow-2xl" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: theme.colors.text }}>Edit Image Details</h3>
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
                  value={editFormData.filename}
                  onChange={(e) => setEditFormData({ ...editFormData, filename: e.target.value })}
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
