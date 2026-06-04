'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'

export function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    })

    const { addToast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (response.ok) {
                addToast({
                    type: 'success',
                    message: 'Message sent! We\'ll respond within 24 hours.',
                })

                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: '',
                })
            } else {
                throw new Error((data as any).error || 'Failed to send message')
            }
        } catch (error) {
            addToast({
                type: 'error',
                message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="Name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
            />

            <Input
                label="Email"
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@email.com"
            />

            <Input
                label="Phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(405) XXX-XXXX"
                helperText="Optional - we'll call if you prefer"
            />

            <Input
                label="Subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                placeholder="What can we help you with?"
            />

            <Textarea
                label="Message"
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more about your project or question..."
                rows={6}
            />

            <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>

            <p className="text-sm text-gray-500 text-center">
                We respond to all messages within 24 hours
            </p>
        </form>
    )
}
