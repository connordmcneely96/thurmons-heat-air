interface ServiceFeaturesProps {
    features: {
        icon: React.ReactNode
        title: string
        description: string
    }[]
}

export function ServiceFeatures({ features }: ServiceFeaturesProps) {
    return (
        <section className="section">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="flex space-x-4">
                            <div className="flex-shrink-0">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-vibrant-gold-100 text-forest-green">
                                    {feature.icon}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-heading font-bold text-forest-green mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
