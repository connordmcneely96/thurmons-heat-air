import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'

export interface Post {
    id: number
    title: string
    slug: string
    excerpt: string
    featuredImage: string
    category: string
    author: string
    publishedAt: string
    readTime: string
}

interface PostCardProps {
    post: Post
    featured?: boolean
}

export function PostCard({ post, featured = false }: PostCardProps) {
    const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })

    if (featured) {
        return (
            <Link href={`/blog/${post.slug}`} className="block group">
                <div className="grid md:grid-cols-2 gap-8 items-center p-6 md:p-8">
                    {/* Image */}
                    <div className="relative h-64 md:h-80 w-full rounded-lg overflow-hidden shadow-md">
                        <Image
                            src={post.featuredImage}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute top-4 left-4">
                            <Badge variant="warning" className="shadow-sm">Featured</Badge>
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <Badge variant="info" className="mb-3">
                            {post.category}
                        </Badge>

                        <h2 className="text-3xl font-heading font-bold text-forest-green mb-4 group-hover:text-vibrant-gold transition-colors">
                            {post.title}
                        </h2>

                        <p className="text-gray-600 mb-6 text-lg line-clamp-3">
                            {post.excerpt}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                            <span>{formattedDate}</span>
                            <span>•</span>
                            <span>{post.readTime}</span>
                        </div>

                        <div>
                            <span className="text-forest-green font-semibold group-hover:text-vibrant-gold group-hover:underline transition-colors">
                                Read Article →
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        )
    }

    return (
        <Link href={`/blog/${post.slug}`} className="block group h-full">
            <div className="card h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                {/* Image */}
                <div className="relative h-48 rounded-lg overflow-hidden mb-4 bg-gray-100">
                    <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                    <Badge variant="info" className="mb-3 self-start">
                        {post.category}
                    </Badge>

                    <h3 className="text-xl font-heading font-bold text-forest-green mb-3 group-hover:text-vibrant-gold transition-colors">
                        {post.title}
                    </h3>

                    <p className="text-gray-600 mb-4 flex-1 line-clamp-3">
                        {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100 mt-auto">
                        <span>{formattedDate}</span>
                        <span>{post.readTime}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
