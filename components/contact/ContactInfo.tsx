export function ContactInfo() {
    const contactMethods = [
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            ),
            title: 'Phone',
            content: '405-479-5794',
            link: 'tel:4054795794',
            description: 'Mon-Fri, 8AM-5PM',
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            title: 'Email',
            content: 'contact@evergrowlandscaping.com',
            link: 'mailto:contact@evergrowlandscaping.com',
            description: '24-hour response time',
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            title: 'Locations',
            content: 'El Dorado, AR 71730',
            description: 'Serving El Dorado & Oklahoma City areas',
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-h2 font-heading text-forest-green mb-4">
                    Contact Information
                </h2>
                <p className="text-gray-600 mb-6">
                    Prefer to reach out directly? Here's how you can get in touch.
                </p>
            </div>

            <div className="space-y-6">
                {contactMethods.map((method, index) => (
                    <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-vibrant-gold-100 text-forest-green">
                                {method.icon}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-heading font-bold text-forest-green mb-1">
                                {method.title}
                            </h3>
                            {method.link ? (
                                <a
                                    href={method.link}
                                    className="text-forest-green hover:underline font-semibold"
                                >
                                    {method.content}
                                </a>
                            ) : (
                                <p className="text-gray-900 font-semibold">{method.content}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Business Hours */}
            <div className="bg-vibrant-gold-50 p-6 rounded-lg">
                <h3 className="font-heading font-bold text-forest-green mb-4">
                    Business Hours
                </h3>
                <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between">
                        <span>Monday - Friday</span>
                        <span className="font-semibold">8:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Saturday</span>
                        <span className="font-semibold">Closed</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Sunday</span>
                        <span className="font-semibold">Closed</span>
                    </div>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                    Emergency services available upon request
                </p>
            </div>

            {/* Quick Links */}
            <div>
                <h3 className="font-heading font-bold text-forest-green mb-4">
                    Quick Links
                </h3>
                <div className="space-y-2">
                    <a href="/quote-request" className="block text-forest-green hover:underline">
                        → Request a Free Quote
                    </a>
                    <a href="/about" className="block text-forest-green hover:underline">
                        → View Our Work
                    </a>
                    <a href="/#services" className="block text-forest-green hover:underline">
                        → See Our Services
                    </a>
                    <a href="/about" className="block text-forest-green hover:underline">
                        → Learn About Us
                    </a>
                </div>
            </div>
        </div>
    )
}
