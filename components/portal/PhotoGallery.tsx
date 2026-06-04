'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface Photo {
    id: number
    photo_url: string
    uploader_type: 'customer' | 'business'
    caption?: string
    phase?: 'before' | 'progress' | 'after'
    uploaded_at: string
}

interface PhotoGalleryProps {
    photos: Photo[]
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)

    // Group photos by phase
    const beforePhotos = photos.filter(p => p.phase === 'before')
    const progressPhotos = photos.filter(p => p.phase === 'progress')
    const afterPhotos = photos.filter(p => p.phase === 'after')
    const untaggedPhotos = photos.filter(p => !p.phase)

    const PhotoGrid = ({ photos, title }: { photos: Photo[], title: string }) => {
        if (photos.length === 0) return null

        return (
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                        <div
                            key={photo.id}
                            className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-forest-green transition-colors"
                            onClick={() => setSelectedPhoto(photo)}
                        >
                            <div className="aspect-square">
                                <img
                                    src={photo.photo_url}
                                    alt={photo.caption || 'Project photo'}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                <span className="text-xs text-white font-medium">
                                    {photo.uploader_type === 'customer' ? '👤 Customer' : '🏢 Business'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div>
            {photos.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
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
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">No photos yet</p>
                    <p className="text-xs text-gray-500 mt-1">Upload photos to document your project progress</p>
                </div>
            ) : (
                <>
                    <PhotoGrid photos={beforePhotos} title="Before Photos" />
                    <PhotoGrid photos={progressPhotos} title="Progress Photos" />
                    <PhotoGrid photos={afterPhotos} title="After Photos" />
                    <PhotoGrid photos={untaggedPhotos} title="Other Photos" />
                </>
            )}

            {/* Lightbox */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={selectedPhoto.photo_url}
                            alt={selectedPhoto.caption || 'Project photo'}
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                        />
                        {selectedPhoto.caption && (
                            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <p className="text-white">{selectedPhoto.caption}</p>
                            </div>
                        )}
                        <div className="mt-2 text-center text-sm text-gray-300">
                            Uploaded by {selectedPhoto.uploader_type === 'customer' ? 'Customer' : 'Evergrow Landscaping'}
                            {' • '}
                            {new Date(selectedPhoto.uploaded_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
