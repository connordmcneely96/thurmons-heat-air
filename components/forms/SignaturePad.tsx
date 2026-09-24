'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface SignaturePadProps {
    onChange: (dataUrl: string | null) => void
    height?: number
}

/**
 * Library-free signature pad. Pointer Events cover mouse, touch and stylus.
 * The canvas is scaled for devicePixelRatio so signatures stay crisp on phones.
 * Emits a PNG data URL on each completed stroke, or null when cleared.
 */
export function SignaturePad({ onChange, height = 180 }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const drawingRef = useRef(false)
    const lastRef = useRef<{ x: number; y: number } | null>(null)
    const [hasInk, setHasInk] = useState(false)
    const savedRef = useRef<string | null>(null) // last signature, redrawn after a resize

    const setupCanvas = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ratio = Math.max(window.devicePixelRatio || 1, 1)
        const width = canvas.offsetWidth
        canvas.width = width * ratio
        canvas.height = height * ratio
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.scale(ratio, ratio)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = '#111827'
    }, [height])

    useEffect(() => {
        setupCanvas()
        // Resizing a canvas wipes it (e.g. rotating a phone). Keep the signature by
        // redrawing the saved image scaled to the new size instead of clearing it.
        let lastWidth = canvasRef.current?.offsetWidth
        const onResize = () => {
            const canvas = canvasRef.current
            const w = canvas?.offsetWidth
            if (!canvas || !w || w === lastWidth) return
            lastWidth = w
            const saved = savedRef.current
            setupCanvas()
            if (!saved) return
            const img = new Image()
            img.onload = () => {
                const ctx = canvas.getContext('2d')
                if (!ctx) return
                ctx.drawImage(img, 0, 0, canvas.offsetWidth, height)
                const redrawn = canvas.toDataURL('image/png')
                savedRef.current = redrawn
                onChange(redrawn)
            }
            img.src = saved
        }
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [setupCanvas, onChange, height])

    const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        e.currentTarget.setPointerCapture(e.pointerId)
        drawingRef.current = true
        const p = point(e)
        lastRef.current = p
        const ctx = e.currentTarget.getContext('2d')
        if (ctx) {
            ctx.beginPath()
            ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2)
            ctx.fillStyle = '#111827'
            ctx.fill()
        }
    }

    const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawingRef.current || !lastRef.current) return
        e.preventDefault()
        const ctx = e.currentTarget.getContext('2d')
        if (!ctx) return
        const p = point(e)
        ctx.beginPath()
        ctx.moveTo(lastRef.current.x, lastRef.current.y)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()
        lastRef.current = p
    }

    const end = () => {
        if (!drawingRef.current) return
        drawingRef.current = false
        lastRef.current = null
        setHasInk(true)
        const canvas = canvasRef.current
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png')
            savedRef.current = dataUrl
            onChange(dataUrl)
        }
    }

    const clear = () => {
        savedRef.current = null
        setupCanvas()
        setHasInk(false)
        onChange(null)
    }

    return (
        <div>
            <div className="relative rounded-lg border-2 border-dashed border-gray-300 bg-white overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="block w-full cursor-crosshair"
                    style={{ height, touchAction: 'none' }}
                    onPointerDown={start}
                    onPointerMove={move}
                    onPointerUp={end}
                    onPointerCancel={end}
                    onPointerLeave={end}
                    aria-label="Signature pad. Draw your signature with your finger, stylus, or mouse."
                    role="img"
                />
                {!hasInk && (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-gray-400 text-sm select-none">
                        Sign here with your finger or mouse
                    </span>
                )}
                <div className="pointer-events-none absolute left-4 right-4 bottom-8 border-b border-gray-300" />
            </div>
            <div className="mt-2 flex justify-end">
                <button type="button" onClick={clear} className="text-sm font-medium text-gray-600 hover:text-forest-green underline">
                    Clear signature
                </button>
            </div>
        </div>
    )
}
