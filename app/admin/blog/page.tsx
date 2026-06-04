'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchWithAuth } from '@/lib/auth'
import { formatDate } from '@/lib/utils'

interface BlogPost {
    id: number
    title: string
    slug: string
    excerpt: string | null
    category: string | null
    published: boolean
    publishedAt: string | null
    createdAt: string
    updatedAt: string
}

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)

    async function loadPosts() {
        try {
            const res = await fetchWithAuth('/api/admin/blog/posts')
            const data = await res.json() as { success: boolean; posts?: BlogPost[]; error?: string }
            if (data.success && data.posts) {
                setPosts(data.posts)
            } else {
                setError(data.error || 'Failed to load posts')
            }
        } catch (err) {
            console.error('Failed to load blog posts:', err)
            setError('Failed to load posts')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadPosts() }, [])

    async function handleDelete(post: BlogPost) {
        if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return
        setDeletingId(post.id)
        try {
            const res = await fetchWithAuth(`/api/admin/blog/${post.id}`, { method: 'DELETE' })
            const data = await res.json() as { success: boolean; error?: string }
            if (data.success) {
                setPosts(prev => prev.filter(p => p.id !== post.id))
            } else {
                alert(data.error || 'Failed to delete post')
            }
        } catch (err) {
            console.error('Delete error:', err)
            alert('Failed to delete post')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Blog Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Create and manage blog posts</p>
                </div>
                <Link
                    href="/admin/blog/new"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    New Post
                </Link>
            </div>

            {loading ? (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                    <p className="text-gray-400">Loading posts...</p>
                </div>
            ) : error ? (
                <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-red-400">{error}</div>
            ) : posts.length === 0 ? (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                    <p className="text-gray-400 mb-4">No blog posts yet.</p>
                    <Link href="/admin/blog/new" className="text-green-400 hover:text-green-300 font-medium">
                        Create your first post →
                    </Link>
                </div>
            ) : (
                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-800 text-gray-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3 text-left">Title</th>
                                <th className="px-4 py-3 text-left">Category</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {posts.map(post => (
                                <tr key={post.id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-white truncate max-w-xs">{post.title}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">/blog/{post.slug}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400">
                                        {post.category || <span className="text-gray-600 italic">Uncategorized</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        {post.published ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-800">
                                                Published
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
                                                Draft
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">
                                        {post.publishedAt
                                            ? formatDate(post.publishedAt)
                                            : formatDate(post.createdAt)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/blog/edit?id=${post.id}`}
                                                className="text-blue-400 hover:text-blue-300 text-xs font-medium px-2 py-1 rounded hover:bg-blue-900/20 transition-colors"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(post)}
                                                disabled={deletingId === post.id}
                                                className="text-red-400 hover:text-red-300 text-xs font-medium px-2 py-1 rounded hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                            >
                                                {deletingId === post.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
