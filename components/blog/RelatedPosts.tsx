import { PostCard } from './PostCard'

interface RelatedPostsProps {
    currentPostId: number
    category: string
}

// Mock data - will be replaced with API call
const allPosts = [
    {
        id: 1,
        title: 'How to Choose a Reliable Landscaper in El Dorado',
        slug: 'how-to-choose-reliable-landscaper-el-dorado',
        excerpt: 'Finding a trustworthy landscaping company shouldn\'t be a gamble.',
        featuredImage: '/images/blog/choosing-landscaper.jpg',
        category: 'Landscaping Tips',
        author: 'Evergrow Team',
        publishedAt: '2025-01-20',
        readTime: '5 min read',
    },
    {
        id: 2,
        title: 'Spring Lawn Care Tips for Oklahoma Homeowners',
        slug: 'spring-lawn-care-tips-oklahoma',
        excerpt: 'Oklahoma\'s unpredictable spring weather requires a strategic approach to lawn care.',
        featuredImage: '/images/blog/spring-lawn-care.jpg',
        category: 'Lawn Care',
        author: 'Evergrow Team',
        publishedAt: '2025-01-15',
        readTime: '7 min read',
    },
    {
        id: 3,
        title: 'Flower Bed Ideas That Thrive in Our Climate',
        slug: 'flower-bed-ideas-oklahoma-climate',
        excerpt: 'Discover native and hardy plant options that look beautiful and require less maintenance.',
        featuredImage: '/images/blog/flower-bed-ideas.jpg',
        category: 'Flower Beds',
        author: 'Evergrow Team',
        publishedAt: '2025-01-10',
        readTime: '6 min read',
    },
    {
        id: 4,
        title: 'Why Regular Lawn Maintenance Saves You Money',
        slug: 'why-regular-lawn-maintenance-saves-money',
        excerpt: 'Here\'s why skipping lawn care actually costs more in the long run.',
        featuredImage: '/images/blog/lawn-maintenance-savings.jpg',
        category: 'Lawn Care',
        author: 'Evergrow Team',
        publishedAt: '2025-01-05',
        readTime: '4 min read',
    },
    {
        id: 5,
        title: 'Pressure Washing: What Homeowners Need to Know',
        slug: 'pressure-washing-guide-homeowners',
        excerpt: 'Thinking about pressure washing your driveway or deck? Learn about the benefits.',
        featuredImage: '/images/blog/pressure-washing-guide.jpg',
        category: 'Pressure Washing',
        author: 'Evergrow Team',
        publishedAt: '2025-01-01',
        readTime: '5 min read',
    },
]

export function RelatedPosts({ currentPostId, category }: RelatedPostsProps) {
    // Filter posts by category and exclude current post
    // For mock validity, since we ignore category in filtering for now as mock data is small:
    const relatedPosts = allPosts
        .filter(post => post.id !== currentPostId)
        .slice(0, 3)

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    )
}
