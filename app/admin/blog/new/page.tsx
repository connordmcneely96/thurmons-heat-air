'use client'

import Link from 'next/link'
import BlogEditor from '@/components/admin/BlogEditor'

export default function AdminBlogNewPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/admin/blog" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                    ← Blog
                </Link>
                <span className="text-gray-700">/</span>
                <h1 className="text-2xl font-bold text-white">New Post</h1>
            </div>
            <BlogEditor />
        </div>
    )
}
