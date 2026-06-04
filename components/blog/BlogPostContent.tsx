'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { RelatedPosts } from '@/components/blog/RelatedPosts'
import { ShareButtons } from '@/components/blog/ShareButtons'

interface BlogPost {
    id: number
    title: string
    slug: string
    excerpt: string
    content: string
    featured_image_url: string | null
    category: string
    author: string
    published_at: string
    tags: string[]
    meta_title?: string
    meta_description?: string
}

interface BlogPostContentProps {
    slug: string
}

export function BlogPostContent({ slug }: BlogPostContentProps) {
    const [post, setPost] = useState<BlogPost | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchPost() {
            try {
                const response = await fetch(`/api/blog/${slug}`)
                const data = await response.json() as any

                if (!response.ok || !data.success) {
                    setError('Post not found')
                    return
                }

                const postData = data.post
                setPost({
                    ...postData,
                    tags: typeof postData.tags === 'string'
                        ? JSON.parse(postData.tags)
                        : postData.tags || [],
                })
            } catch {
                setError('Failed to load post')
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            fetchPost()
        }
    }, [slug])

    useEffect(() => {
        if (post) {
            document.title = post.meta_title || `${post.title} | Evergrow Landscaping Blog`
        }
    }, [post])

    if (loading) {
        return (
            <main className="section py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="animate-pulse space-y-6">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-10 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-[300px] bg-gray-200 rounded-xl"></div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        )
    }

    if (error || !post) {
        return (
            <main className="section py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-3xl font-heading font-bold text-forest-green mb-4">Post Not Found</h1>
                        <p className="text-gray-600 mb-8">The blog post you are looking for does not exist or has been removed.</p>
                        <Link href="/blog">
                            <Button variant="primary">Back to Blog</Button>
                        </Link>
                    </div>
                </div>
            </main>
        )
    }

    const formattedDate = new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })

    const readTimeMinutes = Math.max(1, Math.ceil((post.content?.length || 0) / 1200))
    const readTime = `${readTimeMinutes} min read`

    return (
        <main>
            {/* Article Header */}
            <article className="section py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Breadcrumb */}
                        <nav className="mb-6">
                            <ol className="flex items-center gap-2 text-sm text-gray-500">
                                <li>
                                    <Link href="/" className="hover:text-forest-green transition-colors">Home</Link>
                                </li>
                                <li>&rarr;</li>
                                <li>
                                    <Link href="/blog" className="hover:text-forest-green transition-colors">Blog</Link>
                                </li>
                                <li>&rarr;</li>
                                <li className="text-gray-900 font-medium truncate">{post.title}</li>
                            </ol>
                        </nav>

                        {/* Category Badge */}
                        {post.category && (
                            <Badge variant="info" className="mb-4">
                                {post.category}
                            </Badge>
                        )}

                        {/* Title */}
                        <h1 className="text-3xl md:text-5xl font-heading font-bold text-forest-green mb-6 leading-tight">
                            {post.title}
                        </h1>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-8 max-md:text-sm">
                            <span className="font-semibold text-forest-green">By {post.author}</span>
                            <span className="hidden md:inline">&bull;</span>
                            <span>{formattedDate}</span>
                            <span className="hidden md:inline">&bull;</span>
                            <span>{readTime}</span>
                        </div>

                        {/* Featured Image */}
                        {post.featured_image_url && (
                            <div className="relative h-[250px] md:h-[500px] w-full rounded-xl overflow-hidden mb-10 shadow-lg">
                                <Image
                                    src={post.featured_image_url}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 1024px"
                                />
                            </div>
                        )}

                        {/* Share Buttons */}
                        <ShareButtons title={post.title} />

                        {/* Article Content */}
                        <div
                            className="prose prose-lg prose-headings:text-forest-green prose-a:text-forest-green prose-a:font-semibold hover:prose-a:text-vibrant-gold prose-img:rounded-lg max-w-none mb-12"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Tags */}
                        {post.tags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mb-10 border-t border-gray-100 pt-8">
                                <span className="text-gray-600 font-semibold mr-2">Tags:</span>
                                {post.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="hover:bg-gray-200 cursor-pointer">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Author CTA */}
                        <div className="bg-vibrant-gold-50 p-8 rounded-xl border border-vibrant-gold-100 text-center md:text-left md:flex md:items-center md:justify-between gap-6">
                            <div>
                                <h3 className="text-xl font-heading font-bold text-forest-green mb-2">
                                    Ready to Get Started?
                                </h3>
                                <p className="text-gray-600 mb-4 md:mb-0 max-w-xl">
                                    If you found this article helpful and you are looking for reliable landscaping services in El Dorado or Oklahoma City, we would love to help.
                                </p>
                            </div>
                            <Link href="/quote-request" className="flex-shrink-0">
                                <Button variant="primary" size="lg" className="bg-vibrant-gold text-white hover:bg-forest-green-700 border-none shadow-md">
                                    Get Your Free Quote
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </article>

            {/* Related Posts */}
            <section className="section py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-h2 font-heading text-forest-green mb-10 text-center">
                            Related Articles
                        </h2>
                        <RelatedPosts currentPostId={post.id} category={post.category} />
                    </div>
                </div>
            </section>
        </main>
    )
}
