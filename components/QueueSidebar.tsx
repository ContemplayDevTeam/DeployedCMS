'use client'

import { memo } from 'react'
import Image from 'next/image'

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

interface QueueSidebarProps {
  airtableQueueItems: AirtableQueueItem[]
  isLoadingAirtableQueue: boolean
  draggedAirtableItem: string | null
  isReorderingAirtable: boolean
  onRefresh: () => void
  onDelete: (id: string) => void
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, targetId: string) => void
  sidebarScrollRef: React.RefObject<HTMLDivElement>
}

const QueueSidebar = memo(function QueueSidebar({
  airtableQueueItems,
  isLoadingAirtableQueue,
  draggedAirtableItem,
  isReorderingAirtable,
  onRefresh,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  sidebarScrollRef
}: QueueSidebarProps) {
  return (
    <div className="w-80 min-w-80 max-w-80 shadow-xl border-l-2 border-r-2 border-t-2 border-b-2 transition-all duration-300 z-30 h-screen max-h-screen overflow-hidden" style={{ backgroundColor: '#D0DADA', borderColor: '#4A5555' }}>
      <div className="h-full flex flex-col">
        {/* Queue Header */}
        <div className="p-3 border-b-2 flex-shrink-0" style={{ borderColor: '#4A5555', backgroundColor: '#8FA8A8' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: '#4A5555' }}>
              Publishing Queue ({airtableQueueItems.length})
            </h3>
            <button
              onClick={onRefresh}
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
                  onDragStart={(e) => onDragStart(e, item.id)}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, item.id)}
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
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200 relative">
                      <Image
                        src={item.imageUrl}
                        alt={item.fileName || 'Image'}
                        fill
                        className="object-cover"
                        sizes="48px"
                        loading="lazy"
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
                            onClick={() => onDelete(item.id)}
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
  )
})

export default QueueSidebar