import type { Metadata } from 'next'
import { Briefcase, MapPin, Users, TrendingUp, DollarSign, Heart } from 'lucide-react'
import JobApplicationForm from '@/components/forms/JobApplicationForm'

export const metadata: Metadata = {
    title: 'Careers - Join Our Team | Evergrow Landscaping',
    description: 'Join the Evergrow Landscaping team. We manage 80+ properties across Arkansas and Oklahoma. Apply today for landscaping positions.',
    keywords: ['landscaping jobs', 'careers', 'El Dorado AR jobs', 'Oklahoma City jobs', 'landscaping employment'],
}

export default function CareersPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-forest-green text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <Briefcase className="w-16 h-16 mx-auto mb-6" />
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            Join the Evergrow Team
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 mb-4">
                            Help us manage 80+ properties across Arkansas and Oklahoma
                        </p>
                        <p className="text-lg text-white/75">
                            We're growing fast and looking for passionate landscaping professionals to join our team
                        </p>
                    </div>
                </div>
            </section>

            {/* Why Work at Evergrow */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Why Work at Evergrow?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <div className="text-center">
                            <div className="bg-hopeful-teal/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapPin className="w-8 h-8 text-hopeful-teal" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Multi-Location Opportunities</h3>
                            <p className="text-gray-600">
                                Work across Arkansas and Oklahoma with opportunities to travel and grow
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-vibrant-gold/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="w-8 h-8 text-vibrant-gold" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Commercial & Residential</h3>
                            <p className="text-gray-600">
                                Diverse projects with both commercial and residential properties
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-forest-green/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <DollarSign className="w-8 h-8 text-forest-green" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Competitive Pay</h3>
                            <p className="text-gray-600">
                                Fair wages with steady work and opportunities for advancement
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-hopeful-teal/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-8 h-8 text-hopeful-teal" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Family-Owned Business</h3>
                            <p className="text-gray-600">
                                Join a tight-knit team where you're valued and owner-managed
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-vibrant-gold/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-8 h-8 text-vibrant-gold" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Growth Opportunities</h3>
                            <p className="text-gray-600">
                                Expand your skills with a growing company managing multiple locations
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-forest-green/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-forest-green" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Team Environment</h3>
                            <p className="text-gray-600">
                                Work alongside experienced professionals in a supportive atmosphere
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Open Positions */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Open Positions
                    </h2>
                    <div className="max-w-4xl mx-auto space-y-4">
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-hopeful-teal">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Landscaping Crew - El Dorado, AR
                                    </h3>
                                    <p className="text-gray-600 mb-2">
                                        Full-time position maintaining residential and commercial properties in the El Dorado area.
                                    </p>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        El Dorado, Arkansas
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-hopeful-teal">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Landscaping Crew - Oklahoma City, OK
                                    </h3>
                                    <p className="text-gray-600 mb-2">
                                        Full-time position managing commercial properties in the Oklahoma City metropolitan area.
                                    </p>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        Oklahoma City, Oklahoma
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-vibrant-gold">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Multi-Location Landscaper (Travel Required)
                                    </h3>
                                    <p className="text-gray-600 mb-2">
                                        Full-time position traveling between our AR and OK locations to manage multiple properties.
                                    </p>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        Arkansas & Oklahoma
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-forest-green">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Commercial Property Specialist
                                    </h3>
                                    <p className="text-gray-600 mb-2">
                                        Experienced landscaper focused on large commercial properties and multi-site management.
                                    </p>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        All Locations
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-400">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Seasonal Workers (All Locations)
                                    </h3>
                                    <p className="text-gray-600 mb-2">
                                        Part-time and seasonal positions available for peak landscaping season.
                                    </p>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        All Locations
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Application Form */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Apply Today
                        </h2>
                        <p className="text-lg text-gray-600">
                            Fill out the application form below to join our growing team. We review all applications and will contact qualified candidates within 5 business days.
                        </p>
                    </div>
                    <JobApplicationForm />
                </div>
            </section>
        </div>
    )
}
