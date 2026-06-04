'use client'

import { useEffect, useState, useCallback } from 'react'

interface Props {
    photos: string[]
    initialIndex: number
    onClose: () => void
}

export default function PhotoModal({ photos, initialIndex, onClose }: Props) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)

    const handlePrev = useCallback(() => {
        setCurrentIndex(i => (i - 1 + photos.length) % photos.length)
    }, [photos.length])

    const handleNext = useCallback(() => {
        setCurrentIndex(i => (i + 1) % photos.length)
    }, [photos.length])

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = ''
        }
    }, [])

    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowLeft') handlePrev()
            if (e.key === 'ArrowRight') handleNext()
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [onClose, handlePrev, handleNext])

    const currentPhoto = photos[currentIndex]

    return (
        <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            {/* X close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white text-2xl w-10 h-10 flex items-center justify-center bg-black/40 rounded-full hover:bg-black/60 transition-colors z-10"
                aria-label="Close"
            >
                ×
            </button>

            {/* Prev arrow */}
            {photos.length > 1 && (
                <button
                    onClick={e => { e.stopPropagation(); handlePrev() }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl w-12 h-12 flex items-center justify-center bg-black/40 rounded-full hover:bg-black/60 transition-colors z-10"
                    aria-label="Previous photo"
                >
                    ‹
                </button>
            )}

            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={currentPhoto}
                alt={`Photo ${currentIndex + 1} of ${photos.length}`}
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                onClick={e => e.stopPropagation()}
            />

            {/* Next arrow */}
            {photos.length > 1 && (
                <button
                    onClick={e => { e.stopPropagation(); handleNext() }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl w-12 h-12 flex items-center justify-center bg-black/40 rounded-full hover:bg-black/60 transition-colors z-10"
                    aria-label="Next photo"
                >
                    ›
                </button>
            )}

            {/* Counter */}
            {photos.length > 1 && (
                <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/40 px-3 py-1 rounded-full">
                    {currentIndex + 1} of {photos.length}
                </p>
            )}
        </div>
    )
}
