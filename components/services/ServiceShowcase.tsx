'use client'

import { useEffect, useRef, useState } from 'react'

export interface ShowcaseItem {
    eyebrow?: string        // small label, e.g. "01" or "Rooftop Install"
    title: string
    body: string
    image: string           // e.g. /images/services/ac-repair-1.jpg
    alt?: string
    afterImage?: string     // optional before/after second image (hover to reveal)
    afterAlt?: string
}

interface ServiceShowcaseProps {
    heading?: string
    intro?: string
    items: ShowcaseItem[]
}

/**
 * Scroll-reveal showcase (Clay-style): text + photo rows that fade/lift/un-crop
 * as they enter the viewport. Library-free — IntersectionObserver toggles state,
 * CSS transitions on inline styles do the animation.
 */
export function ServiceShowcase({ heading, intro, items }: ServiceShowcaseProps) {
    const itemRefs = useRef<Array<HTMLLIElement | null>>([])
    const [active, setActive] = useState<boolean[]>(() => items.map(() => false))

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const idx = Number((entry.target as HTMLElement).dataset.idx)
                    if (Number.isNaN(idx)) return
                    setActive((prev) => {
                        if (prev[idx] === entry.isIntersecting) return prev
                        const next = [...prev]
                        next[idx] = entry.isIntersecting
                        return next
                    })
                })
            },
            { threshold: 0.35, rootMargin: '0px 0px -10% 0px' }
        )
        itemRefs.current.forEach((el) => el && observer.observe(el))
        return () => observer.disconnect()
    }, [items.length])

    return (
        <section className="section bg-white">
            <div className="container">
                {(heading || intro) && (
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        {heading && (
                            <h2 className="text-h2 font-heading font-bold text-4xl text-deep-charcoal mb-4">{heading}</h2>
                        )}
                        <div className="w-24 h-1 bg-vibrant-gold mx-auto mb-6" />
                        {intro && <p className="text-lg text-gray-600">{intro}</p>}
                    </div>
                )}

                <ul className="space-y-20 lg:space-y-28">
                    {items.map((item, i) => {
                        const isActive = active[i]
                        const imageRight = i % 2 === 0
                        const revealStyle: React.CSSProperties = {
                            transition:
                                'opacity .7s cubic-bezier(0.16,1,0.3,1), transform .9s cubic-bezier(0.16,1,0.3,1), clip-path .9s cubic-bezier(0.16,1,0.3,1), -webkit-clip-path .9s cubic-bezier(0.16,1,0.3,1)',
                            opacity: isActive ? 1 : 0,
                            transform: isActive ? 'translateY(0)' : 'translateY(32px)',
                            clipPath: isActive ? 'inset(0)' : 'inset(8% 0% 8% 0%)',
                            WebkitClipPath: isActive ? 'inset(0)' : 'inset(8% 0% 8% 0%)',
                        }
                        const textStyle: React.CSSProperties = {
                            transition: 'opacity .8s ease .1s, transform 1s cubic-bezier(0.16,1,0.3,1) .1s',
                            opacity: isActive ? 1 : 0,
                            transform: isActive ? 'translateY(0)' : 'translateY(20px)',
                        }
                        return (
                            <li
                                key={i}
                                data-idx={i}
                                ref={(el) => { itemRefs.current[i] = el }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
                            >
                                {/* Text */}
                                <div style={textStyle} className={imageRight ? 'lg:order-1' : 'lg:order-2'}>
                                    {item.eyebrow && (
                                        <span className="text-forest-green font-bold uppercase tracking-wider text-sm mb-2 block">
                                            {item.eyebrow}
                                        </span>
                                    )}
                                    <h3 className="text-2xl md:text-3xl font-heading font-bold text-deep-charcoal mb-4">
                                        {item.title}
                                    </h3>
                                    <p className="text-lg text-gray-600 leading-relaxed">{item.body}</p>
                                </div>

                                {/* Image */}
                                <div className={imageRight ? 'lg:order-2' : 'lg:order-1'}>
                                    <div
                                        style={revealStyle}
                                        className="group relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3] bg-gray-100"
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.alt || item.title}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-cover"
                                        />
                                        {item.afterImage && (
                                            <>
                                                <img
                                                    src={item.afterImage}
                                                    alt={item.afterAlt || `${item.title} after`}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                                />
                                                <span className="absolute bottom-3 left-3 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded pointer-events-none">
                                                    Hover for after
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </section>
    )
}
