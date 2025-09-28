'use client'

interface FileDropzoneProps {
  getRootProps: () => Record<string, unknown>
  getInputProps: () => Record<string, unknown>
}

export default function FileDropzone({ getRootProps, getInputProps }: FileDropzoneProps) {
  return (
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
          <span className="text-xs" style={{ color: '#4A5555' }}>JPG, PNG, GIF up to 10MB</span>
        </div>
        <div className="mt-2 text-xs" style={{ color: '#6B7280' }}>
          ✨ All images are automatically converted to WebP for optimal compression
        </div>
      </div>
    </div>
  )
}