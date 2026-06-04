'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { api } from '@/lib/api'

interface ServiceData {
    serviceType: string
    propertySize: string
    description: string
    photos: File[]
}

interface FullFormData {
    name: string
    email: string
    phone: string
    address: string
    location: string
    zipCode: string
}

interface ServiceStepProps {
    initialData: ServiceData
    fullFormData: FullFormData
    onBack: () => void
    onSuccess: () => void
}

interface UploadPhotoResponse {
    success: boolean
    url?: string
    error?: string
}

const serviceTypes = [
    { id: 'lawn-care', label: 'Lawn Care & Maintenance' },
    { id: 'flower-beds', label: 'Flower Bed Installation' },
    { id: 'seasonal-cleanup', label: 'Seasonal Cleanup' },
    { id: 'pressure-washing', label: 'Pressure Washing' },
    { id: 'multiple', label: 'Multiple Services' },
    { id: 'other', label: 'Other / Not Sure' },
]

const propertySizes = [
    { id: 'small', label: 'Small (< 5,000 sq ft)' },
    { id: 'medium', label: 'Medium (5,000-10,000 sq ft)' },
    { id: 'large', label: 'Large (10,000-20,000 sq ft)' },
    { id: 'xlarge', label: 'Extra Large (> 20,000 sq ft)' },
    { id: 'unsure', label: 'Not Sure' },
]

export function ServiceStep({ initialData, fullFormData, onBack, onSuccess }: ServiceStepProps) {
    const [formData, setFormData] = useState(initialData)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploadingPhotos, setIsUploadingPhotos] = useState(false)
    const [errors, setErrors] = useState<any>({})
    const [isDragging, setIsDragging] = useState(false)
    const { addToast } = useToast()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            const validFiles = newFiles.filter(file => {
                // Validate file size (10MB max)
                if (file.size > 10 * 1024 * 1024) {
                    addToast({
                        type: 'error',
                        message: `${file.name} is too large. Max size is 10MB.`
                    })
                    return false
                }
                // Validate file type
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic']
                if (!validTypes.includes(file.type)) {
                    addToast({
                        type: 'error',
                        message: `${file.name} is not a valid image type. Please use JPG, PNG, or HEIC.`
                    })
                    return false
                }
                return true
            })

            setFormData((prev) => ({
                ...prev,
                photos: [...prev.photos, ...validFiles].slice(0, 6), // Max 6 photos
            }))
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files)
            const validFiles = newFiles.filter(file => {
                // Validate file size (10MB max)
                if (file.size > 10 * 1024 * 1024) {
                    addToast({
                        type: 'error',
                        message: `${file.name} is too large. Max size is 10MB.`
                    })
                    return false
                }
                // Validate file type
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic']
                if (!validTypes.includes(file.type)) {
                    addToast({
                        type: 'error',
                        message: `${file.name} is not a valid image type. Please use JPG, PNG, or HEIC.`
                    })
                    return false
                }
                return true
            })

            setFormData((prev) => ({
                ...prev,
                photos: [...prev.photos, ...validFiles].slice(0, 6), // Max 6 photos
            }))
        }
    }

    const removePhoto = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index),
        }))
    }

    const uploadPhotosToR2 = async (files: File[]): Promise<string[]> => {
        const uploadedUrls: string[] = []

        for (const file of files) {
            try {
                const formDataToSend = new FormData()
                formDataToSend.append('file', file)

                const response = await fetch('/api/quotes/upload-photo', {
                    method: 'POST',
                    body: formDataToSend,
                })

                const result = await response.json() as UploadPhotoResponse

                if (result.success && result.url) {
                    uploadedUrls.push(result.url)
                } else {
                    throw new Error(result.error || 'Upload failed')
                }
            } catch (error) {
                console.error('Photo upload error:', error)
                addToast({
                    type: 'error',
                    message: `Failed to upload ${file.name}`
                })
            }
        }

        return uploadedUrls
    }

    const validate = (): boolean => {
        const newErrors: any = {}

        if (!formData.serviceType) {
            newErrors.serviceType = 'Please select a service'
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Please describe your project'
        } else if (formData.description.trim().length < 10) {
            newErrors.description = 'Please provide more detail (at least 10 characters)'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validate()) return

        setIsSubmitting(true)

        try {
            let photoUrls: string[] = []

            // Upload photos to R2 if any
            if (formData.photos.length > 0) {
                setIsUploadingPhotos(true)
                photoUrls = await uploadPhotosToR2(formData.photos)
                setIsUploadingPhotos(false)

                if (photoUrls.length !== formData.photos.length) {
                    addToast({
                        type: 'info',
                        message: `${formData.photos.length - photoUrls.length} photo(s) failed to upload. Continuing with submission.`
                    })
                }
            }

            const completeData = {
                name: fullFormData.name,
                email: fullFormData.email,
                phone: fullFormData.phone,
                address: fullFormData.address,
                city: fullFormData.location, // Map location to city
                zipCode: fullFormData.zipCode,
                serviceType: formData.serviceType,
                propertySize: formData.propertySize,
                description: formData.description,
                photoUrls, // Send URLs instead of File objects
            }

            const result = await api.submitQuoteRequest(completeData)

            if (result.success) {
                addToast({
                    type: 'success',
                    message: 'Quote request submitted! Check your email for confirmation.',
                })
                onSuccess()
            } else {
                throw new Error(result.error || 'Failed to submit quote request')
            }
        } catch (error) {
            addToast({
                type: 'error',
                message: error instanceof Error ? error.message : 'Something went wrong',
            })
        } finally {
            setIsSubmitting(false)
            setIsUploadingPhotos(false)
        }
    }

    return (
        <div>
            <h2 className="text-2xl font-heading font-bold text-forest-green mb-2">
                Tell Us About Your Project
            </h2>
            <p className="text-gray-600 mb-6">
                The more details you provide, the more accurate your quote will be.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service Type */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        What service do you need? *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {serviceTypes.map((service) => (
                            <label
                                key={service.id}
                                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.serviceType === service.id
                                        ? 'border-forest-green bg-vibrant-gold-50'
                                        : 'border-gray-200 hover:border-vibrant-gold'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="serviceType"
                                    value={service.id}
                                    checked={formData.serviceType === service.id}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, serviceType: e.target.value }))
                                    }
                                    className="w-4 h-4 text-forest-green focus:ring-forest-green"
                                />
                                <span className="ml-3 text-sm font-medium text-gray-900">
                                    {service.label}
                                </span>
                            </label>
                        ))}
                    </div>
                    {errors.serviceType && (
                        <p className="text-sm text-red-600 mt-2">{errors.serviceType}</p>
                    )}
                </div>

                {/* Property Size */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Property Size (Optional)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {propertySizes.map((size) => (
                            <label
                                key={size.id}
                                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${formData.propertySize === size.id
                                        ? 'border-forest-green bg-vibrant-gold-50'
                                        : 'border-gray-200 hover:border-vibrant-gold'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="propertySize"
                                    value={size.id}
                                    checked={formData.propertySize === size.id}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, propertySize: e.target.value }))
                                    }
                                    className="w-4 h-4 text-forest-green focus:ring-forest-green"
                                />
                                <span className="ml-3 text-sm font-medium text-gray-900">
                                    {size.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <Textarea
                        label="Project Description"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="Tell us about your project... What are your goals? Any specific concerns or preferences?"
                        rows={6}
                        required
                        helperText="Be as detailed as possible for the most accurate quote"
                    />
                    {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                </div>

                {/* Photo Upload */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Upload Property Photos (Optional)
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                        Photos help us provide more accurate quotes (max 6 photos, 10MB each)
                    </p>

                    {formData.photos.length < 6 && (
                        <div className="mb-4">
                            <label
                                className={`flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                    isDragging
                                        ? 'border-forest-green bg-vibrant-gold-50'
                                        : 'border-gray-300 hover:border-forest-green'
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div className="text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-600">
                                        <span className="font-semibold text-forest-green">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        JPG, PNG, HEIC up to 10MB each
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/heic"
                                    multiple
                                    capture="environment"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    )}

                    {/* Photo Previews */}
                    {formData.photos.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {formData.photos.map((photo, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={URL.createObjectURL(photo)}
                                        alt={`Upload ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                        Back
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        disabled={isSubmitting || isUploadingPhotos}
                    >
                        {isUploadingPhotos
                            ? 'Uploading Photos...'
                            : isSubmitting
                                ? 'Submitting...'
                                : 'Submit Quote Request'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
