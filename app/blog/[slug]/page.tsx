import { BlogPostContent } from '@/components/blog/BlogPostContent'
import { buildPageMetadata } from '@/lib/seo'

// Known blog post slugs for static generation
// These match the posts listed on the blog index page
// New posts added via the admin API will also work via client-side fetching
export async function generateStaticParams() {
    return [
        { slug: 'how-to-choose-reliable-landscaper-el-dorado' },
        { slug: 'spring-lawn-care-tips-oklahoma' },
        { slug: 'flower-bed-ideas-oklahoma-climate' },
        { slug: 'why-regular-lawn-maintenance-saves-money' },
        { slug: 'pressure-washing-guide-homeowners' },
    ]
}

interface PageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params
    return <BlogPostContent slug={slug} />
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params
    const title = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

    return buildPageMetadata({
        title: `${title} | Evergrow Landscaping Blog`,
        description: 'Read landscaping tips and advice from the Evergrow Landscaping team.',
        path: `/blog/${slug}/`,
    })
}
