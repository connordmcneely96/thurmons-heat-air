'use client'

import { FeedbackForm } from '@/components/portal/FeedbackForm'

export default function FeedbackPage() {
    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-ocean-blue mb-2">
                    Share Your Feedback
                </h1>
                <p className="text-gray-600">
                    We'd love to hear about your experience with Evergrow Landscaping.
                </p>
            </div>

            {/* Feedback Form */}
            <FeedbackForm />
        </div>
    )
}
