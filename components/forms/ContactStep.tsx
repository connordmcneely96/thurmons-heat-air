'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ContactData {
    name: string
    email: string
    phone: string
    address: string
}

interface ContactStepProps {
    initialData: ContactData
    onBack: () => void
    onNext: (data: ContactData) => void
}

export function ContactStep({ initialData, onBack, onNext }: ContactStepProps) {
    const [formData, setFormData] = useState(initialData)
    const [errors, setErrors] = useState<Partial<Record<keyof ContactData, string>>>({})

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof ContactData, string>> = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email address'
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required'
        } else if (formData.phone.replace(/\D/g, '').length < 10) {
            newErrors.phone = 'Phone number must be at least 10 digits'
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Address is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validate()) {
            onNext(formData)
        }
    }

    const handleChange = (field: keyof ContactData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }))
        }
    }

    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/\D/g, '')
        if (numbers.length <= 3) return numbers
        if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
        return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
    }

    return (
        <div>
            <h2 className="text-2xl font-heading font-bold text-forest-green mb-2">
                Your Contact Information
            </h2>
            <p className="text-gray-600 mb-6">
                We'll use this to send you a quote and schedule your service.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Input
                        label="Full Name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="John Smith"
                        required
                    />
                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                    <Input
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="john@example.com"
                        required
                        helperText="We'll send your quote here"
                    />
                    {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                    <Input
                        label="Phone Number"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', formatPhoneNumber(e.target.value))}
                        placeholder="(405) XXX-XXXX"
                        required
                        helperText="We'll call if we need clarification"
                    />
                    {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
                </div>

                <div>
                    <Input
                        label="Property Address"
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder="Your Property Address"
                        required
                        helperText="Where will the work be done?"
                    />
                    {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
                </div>

                <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                        Back
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1">
                        Continue
                    </Button>
                </div>
            </form>

            {/* Privacy Note */}
            <p className="text-xs text-gray-500 text-center mt-6">
                🔒 Your information is secure. We'll never share it with third parties.
            </p>
        </div>
    )
}
