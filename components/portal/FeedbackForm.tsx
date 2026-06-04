'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { fetchWithAuth } from '@/lib/auth'

export function FeedbackForm() {
    const [projects, setProjects] = useState<any[]>([])
    const [selectedProject, setSelectedProject] = useState<number | null>(null)
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [feedback, setFeedback] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const { addToast } = useToast()

    useEffect(() => {
        loadCompletedProjects()
    }, [])

    const loadCompletedProjects = async () => {
        try {
            const response = await fetchWithAuth('/api/customer/projects')
            const data = await response.json() as any

            if (data.success) {
                const completed = data.data.filter((p: any) => p.status === 'completed')
                setProjects(completed)
                if (completed.length > 0) {
                    setSelectedProject(completed[0].id)
                }
            }
        } catch (error) {
            console.error('Failed to load projects:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (rating === 0) {
            addToast({
                type: 'error',
                message: 'Please select a rating',
            })
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetchWithAuth('/api/customer/feedback', {
                method: 'POST',
                body: JSON.stringify({
                    projectId: selectedProject,
                    rating,
                    feedback,
                }),
            })

            const data = await response.json() as any

            if (!data.success) {
                throw new Error(data.error || 'Failed to submit feedback')
            }

            addToast({
                type: 'success',
                message: 'Thank you for your feedback!',
            })

            // Reset form
            setRating(0)
            setFeedback('')
            loadCompletedProjects()
        } catch (error) {
            addToast({
                type: 'error',
                message: error instanceof Error ? error.message : 'Failed to submit feedback',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="card text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-hopeful-teal border-t-transparent mb-4"></div>
                <p className="text-gray-600">Loading projects...</p>
            </div>
        )
    }

    if (projects.length === 0) {
        return (
            <div className="card text-center py-12">
                <div className="text-5xl mb-4">⭐</div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">
                    No Completed Projects Yet
                </h3>
                <p className="text-gray-600">
                    Feedback can be submitted after your first project is completed.
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Project Selection */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Project
                    </label>
                    <select
                        value={selectedProject || ''}
                        onChange={(e) => setSelectedProject(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hopeful-teal focus:border-transparent"
                        required
                    >
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                Project #{project.id} - {project.service_type}
                                {project.completed_at && ` (${new Date(project.completed_at).toLocaleDateString()})`}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Star Rating */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        How would you rate your experience?
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="text-4xl transition-transform hover:scale-110 focus:outline-none"
                            >
                                {star <= (hoveredRating || rating) ? '⭐' : '☆'}
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <p className="text-sm text-gray-600 mt-2">
                            {rating === 5 && 'Excellent! We\'re thrilled you loved it!'}
                            {rating === 4 && 'Great! Thank you for your positive feedback.'}
                            {rating === 3 && 'Good! We appreciate your honest feedback.'}
                            {rating === 2 && 'We\'re sorry to hear that. Please tell us more below.'}
                            {rating === 1 && 'We apologize for your experience. Your feedback helps us improve.'}
                        </p>
                    )}
                </div>

                {/* Feedback Text */}
                <Textarea
                    label="Your Feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us about your experience... What did we do well? What could we improve?"
                    rows={6}
                    required
                    helperText="Your feedback helps us serve you better and may be featured on our website (with your permission)"
                />

                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting || rating === 0}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
            </form>

            {/* Thank You Note */}
            <div className="mt-6 p-4 bg-warm-cream rounded-lg text-center">
                <p className="text-sm text-gray-700">
                    💚 Thank you for choosing Evergrow Landscaping! Your feedback means the world to us.
                </p>
            </div>
        </div>
    )
}
