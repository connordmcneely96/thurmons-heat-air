'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface Project {
    id: number
    service_type: string
    total_amount: number
    deposit_amount: number
    deposit_paid: boolean
    scheduled_date: string | null
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
    completed_at: string | null
    created_at: string
}

interface ProjectCardProps {
    project: Project
    onUpdate: () => void
}

export function ProjectCard({ project, onUpdate }: ProjectCardProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const statusColors = {
        scheduled: 'info',
        in_progress: 'warning',
        completed: 'success',
        cancelled: 'destructive',
    } as const

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not scheduled'
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        })
    }

    const formatServiceType = (type: string) => {
        return type
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div className="mb-4 md:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-heading font-bold text-gray-900">
                            {formatServiceType(project.service_type)}
                        </h3>
                        <Badge variant={statusColors[project.status]}>
                            {project.status.replace('_', ' ')}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                        Project #{project.id} • Created {formatDate(project.created_at)}
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-2xl font-heading font-bold text-ocean-blue">
                        ${project.total_amount.toFixed(2)}
                    </p>
                    {project.deposit_amount > 0 && (
                        <p className="text-sm text-gray-600">
                            Deposit: ${project.deposit_amount.toFixed(2)}
                            {project.deposit_paid ? (
                                <span className="text-forest-green ml-1">✓ Paid</span>
                            ) : (
                                <span className="text-orange-600 ml-1">Pending</span>
                            )}
                        </p>
                    )}
                </div>
            </div>

            {/* Project Details */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Scheduled Date</p>
                    <p className="text-gray-900">{formatDate(project.scheduled_date)}</p>
                </div>

                {project.completed_at && (
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Completed Date</p>
                        <p className="text-gray-900">{formatDate(project.completed_at)}</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                {!project.deposit_paid && project.deposit_amount > 0 && (
                    <Link href="/dashboard/invoices">
                        <Button variant="primary" size="sm">
                            Pay Deposit
                        </Button>
                    </Link>
                )}

                {project.status === 'completed' && (
                    <Link href="/dashboard/feedback">
                        <Button variant="outline" size="sm">
                            Leave Feedback
                        </Button>
                    </Link>
                )}

                <Link href="/contact">
                    <Button variant="outline" size="sm">
                        Contact About Project
                    </Button>
                </Link>
            </div>
        </div>
    )
}
