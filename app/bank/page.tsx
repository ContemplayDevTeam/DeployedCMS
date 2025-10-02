'use client'

import { useState, useEffect, useCallback } from 'react'
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
}

export default function ImageBank() {
  const router = useRouter()
  const { theme } = useTheme()
  const [bankedImages, setBankedImages] = useState<BankedImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [publishDate, setPublishDate] = useState('')

  const fetchBankedImages = useCallback(async () => {
    const email = localStorage.getItem('uploader_email')
    if (!email) {
      router.push('/login')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/airtable/bank/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        const data = await response.json()
        setBankedImages(data.bankedItems || [])
      }
    } catch (error) {
      console.error('Error fetching banked images:', error)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchBankedImages()
  }, [fetchBankedImages])

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

  const moveToQueue = async () => {
    if (selectedImages.size === 0) return

    const email = localStorage.getItem('uploader_email')
    if (!email) return

    setIsLoading(true)
    try {
      const promises = Array.from(selectedImages).map(recordId =>
        fetch('/api/airtable/bank/move-to-queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recordId, publishDate: publishDate || undefined })
        })
      )

      await Promise.all(promises)

      // Create notification
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          type: 'system',
          title: 'Images Moved to Queue',
          message: `Successfully moved ${selectedImages.size} image${selectedImages.size > 1 ? 's' : ''} from Image Bank to publishing queue`
        })
      })

      setSelectedImages(new Set())
      setPublishDate('')
      fetchBankedImages()
    } catch (error) {
      console.error('Error moving images to queue:', error)
    } finally {
      setIsLoading(false)
    }
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
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background }}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <input
                    type="datetime-local"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="px-3 py-2 rounded-lg border"
                    style={{
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text
                    }}
                    placeholder="Publish date (optional)"
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
                borderColor: theme.colors.accent,
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
                className="rounded-lg border overflow-hidden cursor-pointer transition-all hover:shadow-lg"
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
                </div>

                <div className="p-4">
                  <h3 className="font-medium mb-2 truncate" style={{ color: theme.colors.text }}>
                    {image.filename}
                  </h3>
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
    </div>
  )
}
