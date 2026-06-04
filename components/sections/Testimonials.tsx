'use client';

import { useEffect, useState } from 'react';
import { Star, MapPin, Quote } from 'lucide-react';
import { MotionDiv } from '@/components/ui/MotionDiv';

interface Testimonial {
    id: number;
    rating: number;
    feedback: string;
    customerName: string;
    location: string;
    date: string;
}

interface TestimonialsResponse {
    success: boolean;
    testimonials: Testimonial[];
    total: number;
}

export default function Testimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchTestimonials() {
            try {
                const res = await fetch('/api/testimonials?featured=true&limit=3');
                if (!res.ok) throw new Error('Failed to fetch');
                const data: TestimonialsResponse = await res.json();
                if (data.success) {
                    setTestimonials(data.testimonials);
                }
            } catch (err) {
                console.error('Error loading testimonials:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchTestimonials();
    }, []);

    if (loading) {
        return (
            <section className="py-20 bg-gray-50">
                <div className="container text-center">
                    <h2 className="text-3xl font-bold font-heading text-deep-charcoal mb-8">What Our Customers Say</h2>
                    <div className="flex justify-center gap-2">
                        <div className="w-3 h-3 bg-forest-green rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-forest-green rounded-full animate-bounce delay-75"></div>
                        <div className="w-3 h-3 bg-forest-green rounded-full animate-bounce delay-150"></div>
                    </div>
                </div>
            </section>
        );
    }

    if (error || testimonials.length === 0) {
        return null; // Hide section if no data or error
    }

    return (
        <section className="py-20 bg-white" id="reviews">
            <div className="container">
                <div className="text-center mb-16">
                    <span className="text-forest-green font-bold uppercase tracking-wider text-sm mb-2 block">Testimonials</span>
                    <h2 className="text-h2 font-heading font-bold text-4xl text-deep-charcoal mb-4">
                        Hear from Your Neighbors
                    </h2>
                    <div className="w-24 h-1 bg-vibrant-gold mx-auto mb-6"></div>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        We are proud to serve the El Dorado and OKC community. Here's what they have to say about our work.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, i) => (
                        <MotionDiv
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm relative flex flex-col h-full"
                        >
                            <Quote className="absolute top-6 right-6 w-8 h-8 text-forest-green/10" />

                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < testimonial.rating ? 'text-vibrant-gold fill-vibrant-gold' : 'text-gray-300'}`}
                                    />
                                ))}
                            </div>

                            <p className="text-gray-700 italic mb-6 flex-grow leading-relaxed">
                                "{testimonial.feedback}"
                            </p>

                            <div className="mt-auto pt-6 border-t border-gray-200">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h4 className="font-bold text-deep-charcoal text-lg">{testimonial.customerName}</h4>
                                        {testimonial.location && (
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                {testimonial.location}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100">
                                        Verified Client
                                    </span>
                                </div>
                            </div>
                        </MotionDiv>
                    ))}
                </div>
            </div>
        </section>
    );
}
