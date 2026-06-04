'use client'

import { useState } from 'react'

const categories = [
    { id: 'all', label: 'All Articles' },
    { id: 'lawn-care', label: 'Lawn Care' },
    { id: 'flower-beds', label: 'Flower Beds' },
    { id: 'landscaping-tips', label: 'Landscaping Tips' },
    { id: 'pressure-washing', label: 'Pressure Washing' },
    { id: 'seasonal', label: 'Seasonal Guides' },
]

export function CategoryFilter() {
    const [activeCategory, setActiveCategory] = useState('all')

    return (
        <div className="mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 ${activeCategory === category.id
                                ? 'bg-forest-green text-white shadow-md'
                                : 'bg-white text-gray-700 border border-gray-300 hover:border-forest-green hover:text-forest-green'
                            }`}
                    >
                        {category.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
