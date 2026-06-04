'use client'

import { Suspense, useEffect, useState } from 'react'
import { useAuth } from '@/components/portal/AuthContext'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, DollarSign, FileText } from 'lucide-react'
import { PhotoGallery } from '@/components/portal/PhotoGallery'
import { PhotoUpload } from '@/components/portal/PhotoUpload'

type TabType = 'details' | 'photos'

function ProjectDetailContent() {
    const { token } = useAuth()
    const searchParams = useSearchParams()
    const projectId = searchParams.get('id') || ''

    const [project, setProject] = useState<any>(null)
    const [photos, setPhotos] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState<TabType>('details')
    const [loading, setLoading] = useState(true)
    const [photosLoading, setPhotosLoading] = useState(false)

    useEffect(() => {
        if (!token || !projectId) return
        fetchProject()
    }, [token, projectId])

    useEffect(() => {
        if (activeTab === 'photos' && token && projectId) {
            fetchPhotos()
        }
    }, [activeTab, token, projectId])

    async function fetchProject() {
        try {
            const res = await fetch(`/api/customer/projects?projectId=${projectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json() as any
            if (data.success && data.projects && data.projects.length > 0) {
                setProject(data.projects[0])
            }
        } catch (error) {
            console.error('Failed to fetch project', error)
        } finally {
            setLoading(false)
        }
    }

    async function fetchPhotos() {
        setPhotosLoading(true)
        try {
            const res = await fetch(`/api/projects/${projectId}/photos`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json() as any
            if (data.success) {
                setPhotos(data.photos || [])
            }
        } catch (error) {
            console.error('Failed to fetch photos', error)
        } finally {
            setPhotosLoading(false)
        }
    }

    if (loading) {
        return <div className="p-4">Loading project...</div>
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Project not found</p>
                <Link href="/portal/projects" className="text-ocean-blue hover:underline mt-4 inline-block">
                    Back to Projects
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/portal/projects">
                        <button className="p-2 hover:bg-gray-100 rounded-md">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{project.serviceName}</h1>
                        <p className="text-sm text-gray-500">Project #{project.id}</p>
                    </div>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full
                    ${project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                    {project.statusDisplay}
                </span>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'details'
                                ? 'border-forest-green text-forest-green'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <FileText className="w-4 h-4 inline mr-2" />
                        Details
                    </button>
                    <button
                        onClick={() => setActiveTab('photos')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'photos'
                                ? 'border-forest-green text-forest-green'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Photos {photos.length > 0 && `(${photos.length})`}
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow p-6">
                {activeTab === 'details' && (
                    <div className="space-y-6">
                        {/* Description */}
                        {project.description && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                                <p className="text-gray-600">{project.description}</p>
                            </div>
                        )}

                        {/* Schedule */}
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                                Scheduled: {project.scheduledDate ? new Date(project.scheduledDate).toLocaleDateString() : 'TBD'}
                            </span>
                        </div>

                        {/* Amount */}
                        <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                                Total: {project.totalAmount > 0 ? `$${project.totalAmount.toFixed(2)}` : 'To be quoted'}
                            </span>
                        </div>

                        {/* Payment Status */}
                        {project.totalAmount > 0 && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Payment Status</h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Deposit:</span>
                                        <span className={project.depositPaid ? 'text-forest-green font-medium' : 'text-gray-900'}>
                                            {project.depositPaid ? 'Paid' : `$${(project.depositAmount || 0).toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Balance:</span>
                                        <span className={project.balancePaid ? 'text-forest-green font-medium' : 'text-gray-900'}>
                                            {project.balancePaid ? 'Paid' : `$${(project.totalAmount - (project.depositAmount || 0)).toFixed(2)}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'photos' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Project Photos</h3>
                                <p className="text-sm text-gray-500 mt-1">Document your project progress</p>
                            </div>
                            {token && <PhotoUpload projectId={Number(projectId)} token={token} onUploadSuccess={fetchPhotos} />}
                        </div>

                        {photosLoading ? (
                            <div className="text-center py-12 text-gray-500">Loading photos...</div>
                        ) : (
                            <PhotoGallery photos={photos} />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ProjectDetailPage() {
    return (
        <Suspense fallback={<div className="p-4">Loading project...</div>}>
            <ProjectDetailContent />
        </Suspense>
    )
}
