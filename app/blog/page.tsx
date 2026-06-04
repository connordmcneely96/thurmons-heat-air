'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Post {
    id: number
    title: string
    slug: string
    excerpt: string
    featuredImageUrl: string | null
    category: string | null
    publishedAt: string | null
    readTime: string
}

export default function BlogPage() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/blog/posts?limit=20')
            .then(r => r.json() as Promise<{ success?: boolean; posts?: Post[] }>)
            .then((data) => {
                if (data.success && data.posts) {
                    setPosts(data.posts)
                }
            })
            .catch(err => console.error('Failed to load blog posts:', err))
            .finally(() => setLoading(false))
    }, [])

    return (
        <main>
            <section className="relative bg-forest-green py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <h1 className="text-h1 font-heading font-bold mb-4">
                            Landscaping Tips &amp; Insights
                        </h1>
                        <p className="text-xl">
                            Expert advice for homeowners in El Dorado and Oklahoma City
                        </p>
                    </div>
                </div>
            </section>

            <section className="section py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">Loading posts...</div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No blog posts published yet. Check back soon!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {posts.map(post => (
                                    <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                        {post.featuredImageUrl && (
                                            <div className="h-48 bg-gray-100 overflow-hidden">
                                                <img
                                                    src={post.featuredImageUrl}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="p-5">
                                            {post.category && (
                                                <span className="text-xs font-semibold text-forest-green uppercase tracking-wider">
                                                    {post.category}
                                                </span>
                                            )}
                                            <h2 className="text-lg font-bold text-gray-900 mt-1 mb-2 leading-tight">
                                                <Link href={`/blog/${post.slug}`} className="hover:text-forest-green transition-colors">
                                                    {post.title}
                                                </Link>
                                            </h2>
                                            {post.excerpt && (
                                                <p className="text-gray-600 text-sm line-clamp-3 mb-3">{post.excerpt}</p>
                                            )}
                                            <div className="flex items-center justify-between text-xs text-gray-400 mt-3">
                                                <span>{post.publishedAt ? formatDate(post.publishedAt) : ''}</span>
                                                <span>{post.readTime}</span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    )
}
