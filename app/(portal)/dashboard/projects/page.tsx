'use client'

import { useEffect, useState } from 'react'
import { ProjectCard } from '@/components/portal/ProjectCard'
import { Badge } from '@/components/ui/Badge'
import { fetchWithAuth } from '@/lib/auth'

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

const statusFilters = [
    { value: 'all', label: 'All Projects' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
]

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState('all')

    useEffect(() => {
        loadProjects()
    }, [])

    useEffect(() => {
        if (activeFilter === 'all') {
            setFilteredProjects(projects)
        } else {
            setFilteredProjects(projects.filter(p => p.status === activeFilter))
        }
    }, [activeFilter, projects])

    const loadProjects = async () => {
        try {
            const response = await fetchWithAuth('/api/customer/projects')
            const data = await response.json() as any

            if (data.success) {
                setProjects(data.data)
                setFilteredProjects(data.data)
            }
        } catch (error) {
            console.error('Failed to load projects:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-hopeful-teal border-t-transparent mb-4"></div>
                    <p className="text-gray-600">Loading projects...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-ocean-blue mb-2">
                    Your Projects
                </h1>
                <p className="text-gray-600">
                    Track and manage all your landscaping projects.
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {statusFilters.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setActiveFilter(filter.value)}
                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeFilter === filter.value
                                ? 'bg-hopeful-teal text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {filter.label}
                            {filter.value !== 'all' && (
                                <span className="ml-2 text-xs">
                                    ({projects.filter(p => p.status === filter.value).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Projects List */}
            {filteredProjects.length > 0 ? (
                <div className="space-y-6">
                    {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} onUpdate={loadProjects} />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center py-12">
                    <div className="text-5xl mb-4">📋</div>
                    <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">
                        No {activeFilter !== 'all' ? activeFilter : ''} projects found
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {activeFilter === 'all'
                            ? "You don't have any projects yet."
                            : `You don't have any ${activeFilter} projects.`}
                    </p>
                </div>
            )}
        </div>
    )
}
