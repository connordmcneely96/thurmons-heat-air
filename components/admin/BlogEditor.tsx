'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchWithAuth } from '@/lib/auth'

const CATEGORIES = ['Lawn Care Tips', 'Seasonal', 'Company News', 'Landscaping']

interface BlogPost {
    id?: number
    title: string
    slug: string
    excerpt: string
    content: string
    category: string
    tags: string
    featuredImageUrl: string
    metaTitle: string
    metaDescription: string
    published: boolean
}

interface Props {
    initialData?: Partial<BlogPost> & { id?: number }
}

function slugify(text: string): string {
    return text.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}

export default function BlogEditor({ initialData }: Props) {
    const router = useRouter()
    const isEditing = Boolean(initialData?.id)

    const [form, setForm] = useState<BlogPost>({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        excerpt: initialData?.excerpt || '',
        content: initialData?.content || '',
        category: initialData?.category || '',
        tags: Array.isArray(initialData?.tags)
            ? (initialData.tags as unknown as string[]).join(', ')
            : (initialData?.tags || ''),
        featuredImageUrl: initialData?.featuredImageUrl || '',
        metaTitle: initialData?.metaTitle || '',
        metaDescription: initialData?.metaDescription || '',
        published: initialData?.published || false,
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const { name, value } = e.target
        setForm(prev => {
            const updated = { ...prev, [name]: value }
            if (name === 'title' && !isEditing) {
                updated.slug = slugify(value)
            }
            return updated
        })
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        setError(null)

        const tags = form.tags
            .split(',')
            .map(t => t.trim())
            .filter(Boolean)

        const payload = {
            title: form.title,
            slug: form.slug,
            excerpt: form.excerpt || null,
            content: form.content,
            category: form.category || null,
            tags,
            featuredImageUrl: form.featuredImageUrl || null,
            metaTitle: form.metaTitle || null,
            metaDescription: form.metaDescription || null,
            published: form.published,
        }

        try {
            let res: Response
            if (isEditing) {
                res = await fetchWithAuth(`/api/admin/blog/${initialData!.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                })
            } else {
                res = await fetchWithAuth('/api/admin/blog/posts', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                })
            }

            const data = await res.json() as { success: boolean; error?: string; post?: { id: number } }
            if (data.success) {
                router.push('/admin/blog')
            } else {
                setError(data.error || 'Failed to save post')
            }
        } catch (err) {
            console.error('Save error:', err)
            setError('Failed to save post')
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
            {error && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Title */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Post Details</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Title <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g. Spring Lawn Care Tips for Oklahoma Homeowners"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
                    <input
                        type="text"
                        name="slug"
                        value={form.slug}
                        onChange={handleChange}
                        placeholder="auto-generated-from-title"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">URL: /blog/{form.slug || 'slug'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                        >
                            <option value="">Select category...</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Tags (comma-separated)</label>
                        <input
                            type="text"
                            name="tags"
                            value={form.tags}
                            onChange={handleChange}
                            placeholder="lawn care, seasonal, tips"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Excerpt <span className="text-gray-500 text-xs">({form.excerpt.length}/160)</span>
                    </label>
                    <textarea
                        name="excerpt"
                        value={form.excerpt}
                        onChange={handleChange}
                        rows={2}
                        maxLength={160}
                        placeholder="Brief summary shown on blog listing page..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500 resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Featured Image URL</label>
                    <input
                        type="text"
                        name="featuredImageUrl"
                        value={form.featuredImageUrl}
                        onChange={handleChange}
                        placeholder="https://..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Content</h2>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                    Content <span className="text-red-400">*</span>
                </label>
                <textarea
                    name="content"
                    required
                    value={form.content}
                    onChange={handleChange}
                    rows={16}
                    placeholder="Write your blog post content here (markdown supported)..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500 resize-y font-mono"
                />
            </div>

            {/* SEO */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">SEO (optional)</h2>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Meta Title</label>
                    <input
                        type="text"
                        name="metaTitle"
                        value={form.metaTitle}
                        onChange={handleChange}
                        placeholder="SEO page title (defaults to post title)"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Meta Description <span className="text-gray-500 text-xs">({form.metaDescription.length}/160)</span>
                    </label>
                    <textarea
                        name="metaDescription"
                        value={form.metaDescription}
                        onChange={handleChange}
                        rows={2}
                        maxLength={160}
                        placeholder="SEO description (defaults to excerpt)"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500 resize-none"
                    />
                </div>
            </div>

            {/* Publish controls */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Publishing</h2>
                <label className="flex items-center gap-3 cursor-pointer">
                    <div
                        onClick={() => setForm(prev => ({ ...prev, published: !prev.published }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            form.published ? 'bg-green-600' : 'bg-gray-700'
                        }`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            form.published ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </div>
                    <span className="text-sm text-gray-300">
                        {form.published ? 'Published (visible on blog)' : 'Draft (not visible)'}
                    </span>
                </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <button
                    type="submit"
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Post'}
                </button>
                <button
                    type="button"
                    onClick={() => router.push('/admin/blog')}
                    className="text-gray-400 hover:text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}
