'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        zipCode: '',
        password: '',
        confirmPassword: '',
    })
    const [isLoading, setIsLoading] = useState(false)
    const { register } = useAuth()
    const { addToast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            addToast({
                type: 'error',
                message: 'Passwords do not match',
            })
            return
        }

        if (formData.password.length < 8) {
            addToast({
                type: 'error',
                message: 'Password must be at least 8 characters',
            })
            return
        }

        setIsLoading(true)

        try {
            const { confirmPassword, ...registerData } = formData
            await register(registerData)
        } catch (error) {
            addToast({
                type: 'error',
                message: error instanceof Error ? error.message : 'Registration failed',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    return (
        <div className="min-h-screen bg-forest-green flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-hard p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-4xl mb-4">🌳</div>
                    <h1 className="text-2xl font-heading font-bold text-forest-green mb-2">
                        Create Account
                    </h1>
                    <p className="text-gray-600">
                        Join Evergrow Landscaping to manage your projects
                    </p>
                </div>

                {/* Register Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="John Smith"
                        required
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                        required
                    />

                    <Input
                        label="Phone Number"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="(XXX) XXX-XXXX"
                        required
                    />

                    <Input
                        label="Property Address"
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder="123 Main St, El Dorado, AR"
                        required
                    />

                    <Input
                        label="Zip Code"
                        value={formData.zipCode}
                        onChange={(e) => handleChange('zipCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                        placeholder="71730"
                        maxLength={5}
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        placeholder="At least 8 characters"
                        required
                        helperText="Must be at least 8 characters"
                    />

                    <Input
                        label="Confirm Password"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        placeholder="Re-enter your password"
                        required
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center space-y-3">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-vibrant-gold-600 font-semibold hover:underline">
                            Sign In
                        </Link>
                    </p>
                    <p className="text-sm text-gray-600">
                        <Link href="/" className="text-forest-green hover:underline">
                            ← Back to Homepage
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
