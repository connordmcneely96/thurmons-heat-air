interface GalleryImage {
    src: string
    alt?: string
    caption?: string
}

interface ServiceGalleryProps {
    heading?: string
    intro?: string
    images: GalleryImage[]
}

/**
 * Compact proof grid for supporting photos. Static (no JS), lazy-loaded,
 * subtle hover zoom, optional caption overlay. Pairs with ServiceShowcase:
 * showcase tells the story, gallery shows the volume.
 */
export function ServiceGallery({ heading, intro, images }: ServiceGalleryProps) {
    return (
        <section className="section bg-gray-50">
            <div className="container">
                {(heading || intro) && (
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        {heading && (
                            <h2 className="text-h2 font-heading font-bold text-3xl text-deep-charcoal mb-4">{heading}</h2>
                        )}
                        <div className="w-24 h-1 bg-vibrant-gold mx-auto mb-6" />
                        {intro && <p className="text-lg text-gray-600">{intro}</p>}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map((img, i) => (
                        <figure
                            key={i}
                            className="group relative rounded-xl overflow-hidden shadow-md aspect-[4/3] bg-gray-100"
                        >
                            <img
                                src={img.src}
                                alt={img.alt || img.caption || 'Field photo'}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {img.caption && (
                                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent text-white text-sm p-3 pt-8">
                                    {img.caption}
                                </figcaption>
                            )}
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    )
}
