import Image from 'next/image'

interface ServiceGalleryProps {
  images: Array<{
    src: string
    alt: string
  }>
  title?: string
}

export function ServiceGallery({ images, title = 'Photo Gallery' }: ServiceGalleryProps) {
  return (
    <section className="section bg-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-deep-charcoal mb-4">
            {title}
          </h2>
          <div className="w-24 h-1 bg-vibrant-gold mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 group"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
