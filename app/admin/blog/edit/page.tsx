'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import BlogEditor from '@/components/admin/BlogEditor'
import { fetchWithAuth } from '@/lib/auth'

interface PostData {
    id: number
    title: string
    slug: string
    content: string
    excerpt: string | null
    featuredImageUrl: string | null
    category: string | null
    tags: string[]
    metaTitle: string | null
    metaDescription: string | null
    published: boolean
    publishedAt: string | null
}

export default function AdminBlogEditPage() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const [post, setPost] = useState<PostData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) {
            setError('No post ID provided')
            setLoading(false)
            return
        }
        async function load() {
            try {
                const res = await fetchWithAuth(`/api/admin/blog/${id}`)
                const data = await res.json() as { success: boolean; post?: PostData; error?: string }
                if (data.success && data.post) {
                    setPost(data.post)
                } else {
                    setError(data.error || 'Post not found')
                }
            } catch (err) {
                console.error('Load error:', err)
                setError('Failed to load post')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/admin/blog" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                    ← Blog
                </Link>
                <span className="text-gray-700">/</span>
                <h1 className="text-2xl font-bold text-white">
                    {loading ? 'Loading...' : post ? 'Edit Post' : 'Post Not Found'}
                </h1>
            </div>

            {loading ? (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                    <p className="text-gray-400">Loading post...</p>
                </div>
            ) : error ? (
                <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-red-400">{error}</div>
            ) : post ? (
                <BlogEditor
                    initialData={{
                        id: post.id,
                        title: post.title,
                        slug: post.slug,
                        content: post.content,
                        excerpt: post.excerpt || '',
                        featuredImageUrl: post.featuredImageUrl || '',
                        category: post.category || '',
                        tags: post.tags.join(', '),
                        metaTitle: post.metaTitle || '',
                        metaDescription: post.metaDescription || '',
                        published: post.published,
                    }}
                />
            ) : null}
        </div>
    )
}
