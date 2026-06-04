'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useAuth()
    const { addToast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await login(email, password)
        } catch (error) {
            addToast({
                type: 'error',
                message: error instanceof Error ? error.message : 'Login failed',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-forest-green flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-hard p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-4xl mb-4">🌳</div>
                    <h1 className="text-2xl font-heading font-bold text-forest-green mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600">
                        Sign in to access your customer portal
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center space-y-3">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-vibrant-gold-600 font-semibold hover:underline">
                            Create Account
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
