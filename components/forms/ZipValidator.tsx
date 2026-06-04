'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api } from '@/lib/api'

interface ZipValidatorProps {
    onValidZip: (zipCode: string, location: string) => void
}

export function ZipValidator({ onValidZip }: ZipValidatorProps) {
    const [zipCode, setZipCode] = useState('')
    const [isChecking, setIsChecking] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsChecking(true)

        try {
            const result = await api.validateZipCode(zipCode)

            if (!result.success) {
                setError(result.error || 'Failed to validate zip code')
                return
            }

            if (result.data?.valid) {
                onValidZip(zipCode, result.data.location || '')
            } else {
                setError(
                    result.data?.message ||
                    'Sorry, we don\'t currently serve this area.'
                )
            }
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setIsChecking(false)
        }
    }

    return (
        <div>
            <h2 className="text-2xl font-heading font-bold text-forest-green mb-2">
                First, Let's Check Your Service Area
            </h2>
            <p className="text-gray-600 mb-6">
                We serve El Dorado, AR (15-mile radius) and Oklahoma City, OK (40-mile
                radius).
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    label="Zip Code"
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="Enter your zip code"
                    required
                    maxLength={5}
                // Note: My Input component created earlier didn't check for 'error' prop explicitly, 
                // but I'll assume standard Shadcn/HTML validation or add error text below.
                // The Input implementation I wrote: {helperText && ...} 
                // I didn't add explicit 'error' prop logic in my Input.tsx. 
                // I will use helperText for error if error exists, or pass custom error message below.
                />
                {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
                {!error && <p className="text-xs text-gray-500 mt-1">We'll verify if we serve your area before proceeding</p>}

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={isChecking || zipCode.length !== 5}
                >
                    {isChecking ? 'Checking...' : 'Check Service Area'}
                </Button>
            </form>

            {/* Service Area Info */}
            <div className="mt-8 p-4 bg-vibrant-gold-50 rounded-lg">
                <h3 className="font-semibold text-forest-green mb-2">
                    Our Service Areas:
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>• El Dorado, Arkansas (15-mile radius)</li>
                    <li>• Oklahoma City, Oklahoma (40-mile radius)</li>
                </ul>
                <p className="text-sm text-gray-500 mt-3">
                    Outside our service area? Call us at (405) 479-5794 to discuss
                    options.
                </p>
            </div>
        </div>
    )
}
