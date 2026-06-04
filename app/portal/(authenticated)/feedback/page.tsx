'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/portal/AuthContext'
import { Button } from '@/components/ui/Button'
import { Star } from 'lucide-react'
import Link from 'next/link'

export default function FeedbackPage() {
    const { token } = useAuth()
    const [completedProjects, setCompletedProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)

    // Form State
    const [rating, setRating] = useState(5)
    const [feedback, setFeedback] = useState('')
    const [allowDisplay, setAllowDisplay] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchCompletedProjects() {
            if (!token) return
            try {
                const res = await fetch('/api/customer/projects?status=completed&limit=20', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const data = await res.json() as any
                if (data.success && data.projects) {
                    setCompletedProjects(data.projects)
                    if (data.projects.length > 0) {
                        setSelectedProjectId(data.projects[0].id)
                    }
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchCompletedProjects()
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedProjectId) return

        setSubmitting(true)
        setError('')

        try {
            const res = await fetch('/api/customer/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId: selectedProjectId,
                    rating,
                    feedback,
                    allowDisplay
                })
            })

            const data = await res.json() as any
            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit feedback')
            }

            setSubmitSuccess(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-4">Loading...</div>

    if (submitSuccess) {
        return (
            <div className="max-w-xl mx-auto py-12 px-4 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-vibrant-gold-100 mb-4">
                    <Star className="h-6 w-6 text-forest-green" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
                <p className="text-gray-500 mb-6">Your feedback helps us grow and improve our services.</p>
                <Link href="/portal">
                    <Button variant="primary">Return to Dashboard</Button>
                </Link>
            </div>
        )
    }

    if (completedProjects.length === 0) {
        return (
            <div className="max-w-xl mx-auto py-12 px-4 text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">No Completed Projects</h2>
                <p className="text-gray-500">You can only leave feedback for completed projects.</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Share Your Experience</h1>

            <div className="bg-white shadow sm:rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
                        <select
                            value={selectedProjectId || ''}
                            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-ocean-blue focus:border-ocean-blue sm:text-sm rounded-md"
                        >
                            {completedProjects.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.serviceName} - {new Date(p.createdAt).toLocaleDateString()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none"
                                >
                                    <Star
                                        className={`h-8 w-8 ${star <= rating ? 'text-vibrant-gold fill-current' : 'text-gray-300'}`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Feedback</label>
                        <textarea
                            rows={4}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="shadow-sm focus:ring-ocean-blue focus:border-ocean-blue block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Tell us what you liked or how we can improve..."
                        />
                    </div>

                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="allow"
                                type="checkbox"
                                checked={allowDisplay}
                                onChange={(e) => setAllowDisplay(e.target.checked)}
                                className="focus:ring-ocean-blue h-4 w-4 text-ocean-blue border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="allow" className="font-medium text-gray-700">Allow us to feature this review</label>
                            <p className="text-gray-500">We may display your feedback on our website with your first name.</p>
                        </div>
                    </div>

                    {error && <div className="text-red-600 text-sm">{error}</div>}

                    <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                </form>
            </div>
        </div>
    )
}
