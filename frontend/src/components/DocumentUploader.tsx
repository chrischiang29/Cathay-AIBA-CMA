import { useState, useRef } from 'react'
import type { DragEvent, ChangeEvent } from 'react'

interface Props {
  onFileSelect: (file: File) => void
  disabled?: boolean
}

export default function DocumentUploader({ onFileSelect, disabled = false }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('請上傳 PDF 格式的文件')
      return
    }
    setSelectedFile(file)
    onFileSelect(file)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      className={`border-2 border-dashed rounded-xl p-5 text-center transition-all select-none ${
        disabled
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
          : isDragging
          ? 'border-blue-400 bg-blue-50 cursor-copy'
          : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
      }`}
      onClick={() => { if (!disabled) inputRef.current?.click() }}
      onKeyDown={(e) => { if (!disabled && e.key === 'Enter') inputRef.current?.click() }}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      {selectedFile ? (
        <div>
          <div className="text-3xl mb-2">📄</div>
          <p className="text-sm font-semibold text-gray-800 truncate max-w-xs mx-auto">
            {selectedFile.name}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {(selectedFile.size / 1024).toFixed(1)} KB
          </p>
          {!disabled && (
            <p className="text-xs text-blue-500 mt-2">點擊或拖曳以更換檔案</p>
          )}
        </div>
      ) : (
        <div>
          <div className="text-3xl mb-2">📤</div>
          <p className="text-sm font-semibold text-gray-700">
            拖曳或點擊上傳 PDF
          </p>
          <p className="text-xs text-gray-400 mt-1">
            支援研報文件、House View、產品說明書
          </p>
        </div>
      )}
    </div>
  )
}
