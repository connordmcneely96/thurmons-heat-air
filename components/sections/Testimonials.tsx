'use client';

import { Star, Quote } from 'lucide-react';
import { MotionDiv } from '@/components/ui/MotionDiv';
import { siteConfig } from '@/lib/site.config';
import reviews from '@/data/reviews.json';

export default function Testimonials() {
    const { aggregate, googleProfileUrl } = {
        aggregate: siteConfig.reviews.aggregate,
        googleProfileUrl: siteConfig.social.googleProfileUrl,
    };

    if (!reviews || reviews.length === 0) return null;

    return (
        <section className="py-20 bg-white" id="reviews">
            <div className="container">
                <div className="text-center mb-16">
                    <span className="text-forest-green font-bold uppercase tracking-wider text-sm mb-2 block">Testimonials</span>
                    <h2 className="text-h2 font-heading font-bold text-4xl text-deep-charcoal mb-4">
                        Hear from Your Neighbors
                    </h2>
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-5 h-5 ${i < Math.round(aggregate.rating) ? 'text-vibrant-gold fill-vibrant-gold' : 'text-gray-300'}`} />
                            ))}
                        </div>
                        <span className="font-bold text-deep-charcoal">{aggregate.rating.toFixed(1)}</span>
                        <span className="text-gray-500">from {aggregate.count} {aggregate.source} reviews</span>
                    </div>
                    <div className="w-24 h-1 bg-vibrant-gold mx-auto mb-6"></div>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        We are proud to serve El Dorado and South Arkansas. Here is what our neighbors have to say about our work.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((review, i) => (
                        <MotionDiv
                            key={review.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: (i % 3) * 0.1, duration: 0.5 }}
                            className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm relative flex flex-col h-full"
                        >
                            <Quote className="absolute top-6 right-6 w-8 h-8 text-forest-green/10" />

                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, idx) => (
                                    <Star
                                        key={idx}
                                        className={`w-5 h-5 ${idx < review.rating ? 'text-vibrant-gold fill-vibrant-gold' : 'text-gray-300'}`}
                                    />
                                ))}
                            </div>

                            <p className="text-gray-700 italic mb-6 flex-grow leading-relaxed">
                                "{review.feedback}"
                            </p>

                            <div className="mt-auto pt-6 border-t border-gray-200">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h4 className="font-bold text-deep-charcoal text-lg">{review.customerName}</h4>
                                        <span className="text-sm text-gray-500">{review.date}</span>
                                    </div>
                                    <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100">
                                        via {review.source}
                                    </span>
                                </div>
                            </div>
                        </MotionDiv>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <a
                        href={googleProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-bold text-forest-green hover:text-vibrant-gold-700 underline underline-offset-4 transition-colors"
                    >
                        Read all our reviews on Google &rarr;
                    </a>
                </div>
            </div>
        </section>
    );
}
