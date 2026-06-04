'use client'

import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface PhotoUploadProps {
    projectId: number
    token: string
    onUploadSuccess: () => void
}

export function PhotoUpload({ projectId, token, onUploadSuccess }: PhotoUploadProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [caption, setCaption] = useState('')
    const [phase, setPhase] = useState<'before' | 'progress' | 'after' | ''>('')
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            setError('File too large. Max size is 10MB.')
            return
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic']
        if (!validTypes.includes(file.type)) {
            setError('Invalid file type. Please use JPG, PNG, or HEIC.')
            return
        }

        setSelectedFile(file)
        setError(null)

        // Create preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleUpload = async () => {
        if (!selectedFile) return

        setIsUploading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('file', selectedFile)
            if (caption) formData.append('caption', caption)
            if (phase) formData.append('phase', phase)

            const response = await fetch(`/api/projects/${projectId}/photos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            })

            const result = await response.json() as any

            if (result.success) {
                // Reset form
                setSelectedFile(null)
                setCaption('')
                setPhase('')
                setPreviewUrl(null)
                setIsOpen(false)

                // Notify parent to refresh photos
                onUploadSuccess()
            } else {
                setError(result.error || 'Upload failed')
            }
        } catch (err) {
            setError('Failed to upload photo')
            console.error('Upload error:', err)
        } finally {
            setIsUploading(false)
        }
    }

    const handleCancel = () => {
        setSelectedFile(null)
        setCaption('')
        setPhase('')
        setPreviewUrl(null)
        setError(null)
        setIsOpen(false)
    }

    return (
        <>
            <Button
                variant="primary"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2"
            >
                <Upload className="w-4 h-4" />
                Add Photos
            </Button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Upload Photo</h3>
                            <button
                                onClick={handleCancel}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* File input */}
                            {!selectedFile ? (
                                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-forest-green transition-colors">
                                    <div className="text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-600">
                                            <span className="font-semibold text-forest-green">Click to upload</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            JPG, PNG, HEIC up to 10MB
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/heic"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </label>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={previewUrl!}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <button
                                        onClick={() => {
                                            setSelectedFile(null)
                                            setPreviewUrl(null)
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {selectedFile && (
                                <>
                                    {/* Caption */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Caption (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={caption}
                                            onChange={(e) => setCaption(e.target.value)}
                                            placeholder="Add a description..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-forest-green"
                                        />
                                    </div>

                                    {/* Phase */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Project Phase (Optional)
                                        </label>
                                        <select
                                            value={phase}
                                            onChange={(e) => setPhase(e.target.value as any)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-forest-green"
                                        >
                                            <option value="">Select phase...</option>
                                            <option value="before">Before</option>
                                            <option value="progress">Progress</option>
                                            <option value="after">After</option>
                                        </select>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCancel}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="primary"
                                            onClick={handleUpload}
                                            disabled={isUploading}
                                            className="flex-1"
                                        >
                                            {isUploading ? 'Uploading...' : 'Upload'}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
