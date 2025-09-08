import { useState, useEffect } from 'react'

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  readOnly?: boolean
}

export function JsonEditor({ value, onChange, placeholder, readOnly = false }: JsonEditorProps) {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Validate JSON when value changes
    if (value.trim()) {
      try {
        JSON.parse(value)
        setError(null)
      } catch (err) {
        setError('Invalid JSON format')
      }
    } else {
      setError(null)
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const formatJson = () => {
    try {
      const parsed = JSON.parse(value)
      onChange(JSON.stringify(parsed, null, 2))
    } catch (err) {
      // Don't format if invalid JSON
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`textarea min-h-[200px] font-mono text-sm ${
            error ? 'border-red-300 dark:border-red-600' : ''
          } ${readOnly ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
        />
        {!readOnly && (
          <button
            onClick={formatJson}
            className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Format
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
