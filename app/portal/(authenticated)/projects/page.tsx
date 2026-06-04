'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/portal/AuthContext'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ProjectsPage() {
    const { token } = useAuth()
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProjects() {
            if (!token) return
            try {
                const res = await fetch('/api/customer/projects?limit=50', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const data = await res.json() as any
                if (data.success && data.projects) {
                    setProjects(data.projects)
                }
            } catch (error) {
                console.error('Failed to fetch projects', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProjects()
    }, [token])

    if (loading) {
        return <div className="p-4">Loading projects...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
                <Link href="/quote-request">
                    <button className="px-4 py-2 min-h-[44px] bg-forest-green text-white rounded-md hover:bg-forest-green-700 shadow-sm text-sm font-medium">
                        New Project
                    </button>
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md overflow-x-auto">
                <ul role="list" className="divide-y divide-gray-200">
                    {projects.length === 0 ? (
                        <li className="px-4 py-8 text-gray-500 text-center">
                            No projects found. <Link href="/quote-request" className="text-ocean-blue hover:underline">Request your first service!</Link>
                        </li>
                    ) : (
                        projects.map((project: any) => (
                            <li key={project.id}>
                                <Link href={`/portal/projects/detail?id=${project.id}`} className="block px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-ocean-blue">{project.serviceName}</span>
                                            <span className="text-xs text-gray-400">ID: #{project.id}</span>
                                        </div>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                       ${project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                            {project.statusDisplay}
                                        </span>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-500">
                                        {project.description}
                                    </div>
                                    <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                                        <span>Scheduled: {project.scheduledDate ? new Date(project.scheduledDate).toLocaleDateString() : 'TBD'}</span>
                                        <span className="font-medium text-gray-900">
                                            {project.totalAmount > 0 ? `$${project.totalAmount.toFixed(2)}` : 'Quoted'}
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    )
}
