'use client'

import { useState, useEffect } from 'react'

interface FieldMappingResult {
  success: boolean
  status: 'PASS' | 'FAIL'
  message: string
  schemaVerification: {
    users: {
      success: boolean
      fields: string[]
      missing: string[]
      extra: string[]
      typeMismatches: Array<{
        field: string
        expected: string
        actual: string
      }>
      error?: string
    }
    queue: {
      success: boolean
      fields: string[]
      missing: string[]
      extra: string[]
      typeMismatches: Array<{
        field: string
        expected: string
        actual: string
      }>
      error?: string
    }
  }
  testResults: {
    userCreation: { success: boolean; error: string | null }
    userRetrieval: { success: boolean; error: string | null }
    queueCreation: { success: boolean; error: string | null }
  }
  summary: {
    schemasValid: boolean
    fieldsMatch: boolean
    testsPass: boolean
    missingFields: {
      users: string[]
      queue: string[]
    }
    typeMismatches: {
      users: Array<{ field: string; expected: string; actual: string }>
      queue: Array<{ field: string; expected: string; actual: string }>
    }
  }
  expectedMappings: {
    users: Record<string, string>
    queue: Record<string, string>
  }
}

export default function FieldMappingTest() {
  const [result, setResult] = useState<FieldMappingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runTest = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/airtable/verify-field-mapping')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify field mapping')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTest()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#8FA8A8' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Verifying field mapping...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#8FA8A8' }}>
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">Field Mapping Test Failed</h1>
          <p className="text-white mb-4">{error}</p>
          <button
            onClick={runTest}
            className="px-6 py-3 bg-white text-gray-800 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!result) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#8FA8A8' }}>
      {/* Header */}
      <header className="backdrop-blur-sm shadow-sm border-b" style={{ backgroundColor: '#8FA8A8', borderColor: '#4A5555' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold" style={{ color: '#D0DADA' }}>
              Airtable Field Mapping Verification
            </h1>
            <button
              onClick={runTest}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: '#4A5555', color: '#D0DADA' }}
            >
              Refresh Test
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Status */}
        <div className="mb-8">
          <div className={`p-6 rounded-2xl ${result.status === 'PASS' ? 'bg-green-100' : 'bg-red-100'}`}>
            <div className="flex items-center">
              <div className={`text-4xl mr-4 ${result.status === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
                {result.status === 'PASS' ? '✅' : '❌'}
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#4A5555' }}>
                  {result.status === 'PASS' ? 'All Tests Passed' : 'Issues Detected'}
                </h2>
                <p className="text-gray-600">{result.message}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Schema Verification */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Users Table */}
          <div className="p-6 rounded-2xl" style={{ backgroundColor: '#D0DADA' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#4A5555' }}>
              👥 Users Table
            </h3>
            <SchemaVerificationTable data={result.schemaVerification.users} />
          </div>

          {/* Queue Table */}
          <div className="p-6 rounded-2xl" style={{ backgroundColor: '#D0DADA' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#4A5555' }}>
              📤 Queue Table
            </h3>
            <SchemaVerificationTable data={result.schemaVerification.queue} />
          </div>
        </div>

        {/* Functional Tests */}
        <div className="p-6 rounded-2xl mb-8" style={{ backgroundColor: '#D0DADA' }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: '#4A5555' }}>
            🧪 Functional Tests
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TestResultCard
              title="User Creation"
              result={result.testResults.userCreation}
            />
            <TestResultCard
              title="User Retrieval"
              result={result.testResults.userRetrieval}
            />
            <TestResultCard
              title="Queue Creation"
              result={result.testResults.queueCreation}
            />
          </div>
        </div>

        {/* Expected Mappings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-2xl" style={{ backgroundColor: '#D0DADA' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#4A5555' }}>
              📋 Expected User Fields
            </h3>
            <FieldMappingTable fields={result.expectedMappings.users} />
          </div>
          <div className="p-6 rounded-2xl" style={{ backgroundColor: '#D0DADA' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#4A5555' }}>
              📋 Expected Queue Fields
            </h3>
            <FieldMappingTable fields={result.expectedMappings.queue} />
          </div>
        </div>
      </div>
    </div>
  )
}

function SchemaVerificationTable({ data }: { data: FieldMappingResult['schemaVerification']['users'] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center">
        <span className={`w-3 h-3 rounded-full mr-2 ${data.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
        <span className="text-sm font-medium" style={{ color: '#4A5555' }}>
          Schema Access: {data.success ? 'Success' : 'Failed'}
        </span>
      </div>
      
      {data.success && (
        <>
          <div>
            <span className="text-sm font-medium" style={{ color: '#4A5555' }}>Fields Found:</span>
            <div className="mt-1 text-sm text-gray-600">
              {data.fields.join(', ')}
            </div>
          </div>
          
          {data.missing.length > 0 && (
            <div>
              <span className="text-sm font-medium text-red-600">Missing Fields:</span>
              <div className="mt-1 text-sm text-red-500">
                {data.missing.join(', ')}
              </div>
            </div>
          )}
          
          {data.extra.length > 0 && (
            <div>
              <span className="text-sm font-medium text-yellow-600">Extra Fields:</span>
              <div className="mt-1 text-sm text-yellow-600">
                {data.extra.join(', ')}
              </div>
            </div>
          )}
          
          {data.typeMismatches.length > 0 && (
            <div>
              <span className="text-sm font-medium text-orange-600">Type Mismatches:</span>
              <div className="mt-1 space-y-1">
                {data.typeMismatches.map((mismatch, index) => (
                  <div key={index} className="text-sm text-orange-600">
                    {mismatch.field}: expected {mismatch.expected}, got {mismatch.actual}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
      {!data.success && data.error && (
        <div className="text-sm text-red-600">
          Error: {data.error}
        </div>
      )}
    </div>
  )
}

function TestResultCard({ title, result }: { title: string; result: { success: boolean; error: string | null } }) {
  return (
    <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium" style={{ color: '#4A5555' }}>{title}</h4>
        <span className={`text-2xl ${result.success ? 'text-green-600' : 'text-red-600'}`}>
          {result.success ? '✅' : '❌'}
        </span>
      </div>
      {!result.success && result.error && (
        <p className="text-sm text-red-600">{result.error}</p>
      )}
    </div>
  )
}

function FieldMappingTable({ fields }: { fields: Record<string, string> }) {
  return (
    <div className="space-y-2">
      {Object.entries(fields).map(([field, type]) => (
        <div key={field} className="flex justify-between items-center py-2 border-b border-gray-200">
          <span className="font-medium" style={{ color: '#4A5555' }}>{field}</span>
          <span className="text-sm px-2 py-1 rounded bg-gray-200 text-gray-700">{type}</span>
        </div>
      ))}
    </div>
  )
} 