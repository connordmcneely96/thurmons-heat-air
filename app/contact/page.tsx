import { ContactForm } from '@/components/contact/ContactForm'
import { ContactInfo } from '@/components/contact/ContactInfo'
import { ServiceAreaMap } from '@/components/ServiceAreaMap'

export default function ContactPage() {
    return (
        <main>
            {/* Hero Section */}
            <section className="relative bg-forest-green py-16">
                <div className="container">
                    <div className="max-w-3xl mx-auto text-center text-white">
                        <h1 className="text-h1 font-heading font-bold mb-4">
                            Get in Touch
                        </h1>
                        <p className="text-xl">
                            Have a question? Need a quote? We're here to help.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="section">
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Form */}
                        <div>
                            <h2 className="text-h2 font-heading text-forest-green mb-4">
                                Send Us a Message
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Fill out the form below and we'll get back to you within 24 hours.
                            </p>
                            <ContactForm />
                        </div>

                        {/* Contact Info */}
                        <div>
                            <ContactInfo />
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section (Optional) */}
            <section className="section section-alt">
                <div className="container">
                    <h2 className="text-h2 font-heading text-forest-green mb-8 text-center">
                        Our Service Areas
                    </h2>
                    <div className="max-w-4xl mx-auto">
                        <ServiceAreaMap height={384} showBadge={false} />
                    </div>
                </div>
            </section>
        </main>
    )
}

export const metadata = {
    title: 'Contact Us | Evergrow Landscaping',
    description: 'Contact Evergrow Landscaping for a free quote. Serving El Dorado, AR and Oklahoma City, OK. Phone, email, or contact form available.',
}
