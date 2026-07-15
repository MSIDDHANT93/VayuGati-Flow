import React, { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  onImageUpload: (file: File) => void
  loading?: boolean
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, loading }) => {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      onImageUpload(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Upload className="w-4 h-4 text-mission-info" />
        <span className="text-xs font-semibold text-gray-400">IMAGE UPLOAD</span>
      </div>

      {preview ? (
        <div className="relative">
          <div className="bg-mission-dark rounded border border-mission-border overflow-hidden">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-48 object-cover"
            />
          </div>
          <button
            onClick={handleRemove}
            disabled={loading}
            className="absolute top-2 right-2 bg-mission-danger text-white p-1 rounded hover:bg-red-600 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-mission-accent bg-mission-accent/10' 
              : 'border-mission-border hover:border-mission-info'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            disabled={loading}
            className="hidden"
          />
          <ImageIcon className="w-8 h-8 text-mission-border mx-auto mb-2" />
          <p className="text-xs text-gray-400 mb-2">
            Drag & drop image here or
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="text-xs text-mission-accent hover:text-mission-info disabled:opacity-50"
          >
            browse files
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Supports: JPG, PNG, WebP
          </p>
        </div>
      )}
    </div>
  )
}

export default ImageUpload
