'use client'

import { useState } from 'react'
import { useAuth } from '@/components/portal/AuthContext'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError('')

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json() as any

            if (!res.ok) {
                throw new Error(data.error || 'Login failed')
            }

            login(data.token, data.user)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-warm-cream/30">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center mb-6">
                    {/* Placeholder for Logo, using text for now or existing standard logo if available */}
                    <h1 className="text-3xl font-heading font-bold text-forest-green tracking-tight">
                        Evergrow
                    </h1>
                </Link>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Don&apos;t have an account?{' '}
                    <Link href="/portal/register" className="font-medium text-ocean-blue hover:text-ocean-blue/80">
                        Sign up
                    </Link>
                    {' '}or{' '}
                    <Link href="/quote-request" className="font-medium text-ocean-blue hover:text-ocean-blue/80">
                        request a new quote
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-ocean-blue focus:outline-none focus:ring-ocean-blue sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-ocean-blue focus:outline-none focus:ring-ocean-blue sm:text-sm"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full flex justify-center py-2 px-4"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/pay"
                            className="text-sm text-gray-500 hover:text-hopeful-teal transition-colors"
                        >
                            Just need to pay an invoice? Pay without an account
                        </Link>
                    </div>
                </div>

                {/* Create Account CTA */}
                <div className="mt-6 bg-white py-6 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
                    <h3 className="text-center text-lg font-semibold text-gray-900 mb-3">
                        New here? Create a free account
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-2 mb-5">
                        <li className="flex items-start">
                            <span className="text-hopeful-teal font-bold mr-2 mt-0.5">&#10003;</span>
                            View and pay invoices from your dashboard
                        </li>
                        <li className="flex items-start">
                            <span className="text-hopeful-teal font-bold mr-2 mt-0.5">&#10003;</span>
                            Track your active projects and timelines
                        </li>
                        <li className="flex items-start">
                            <span className="text-hopeful-teal font-bold mr-2 mt-0.5">&#10003;</span>
                            Browse and upload project photos
                        </li>
                        <li className="flex items-start">
                            <span className="text-hopeful-teal font-bold mr-2 mt-0.5">&#10003;</span>
                            See your outstanding balance at a glance
                        </li>
                    </ul>
                    <Link
                        href="/portal/register"
                        className="block w-full text-center py-2.5 px-4 rounded-md bg-forest-green text-white font-semibold hover:bg-forest-green-700 transition-colors"
                    >
                        Create an Account
                    </Link>
                </div>
            </div>
        </div>
    )
}
