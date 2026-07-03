import type { Metadata } from 'next'
import { Briefcase, MapPin, Users, TrendingUp, DollarSign, Heart } from 'lucide-react'
import JobApplicationForm from '@/components/forms/JobApplicationForm'

export const metadata: Metadata = {
    title: "Careers - Join Our Team | Thurmon's Heat & Air",
    description: "Join the Thurmon's Heat & Air team. Help us keep El Dorado & South Arkansas comfortable. Apply today for HVAC positions.",
    keywords: ['HVAC jobs', 'careers', 'El Dorado AR jobs', 'South Arkansas jobs', 'HVAC employment'],
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
                            Join the Thurmon&apos;s Heat &amp; Air Team
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 mb-4">
                            Help us keep El Dorado &amp; South Arkansas comfortable
                        </p>
                        <p className="text-lg text-white/75">
                            We&apos;re growing and looking for passionate HVAC professionals to join our team
                        </p>
                    </div>
                </div>
            </section>

            {/* Why Work at Thurmon's */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                        Why Work at Thurmon&apos;s?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <div className="text-center">
                            <div className="bg-hopeful-teal/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapPin className="w-8 h-8 text-hopeful-teal" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Local Opportunities</h3>
                            <p className="text-gray-600">
                                Work across El Dorado and South Arkansas with opportunities to grow
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-vibrant-gold/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="w-8 h-8 text-vibrant-gold" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Commercial &amp; Residential</h3>
                            <p className="text-gray-600">
                                Diverse projects with both commercial and residential customers
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
                                Join a tight-knit team where you&apos;re valued and owner-managed
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="bg-vibrant-gold/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-8 h-8 text-vibrant-gold" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Growth Opportunities</h3>
                            <p className="text-gray-600">
                                Expand your skills with a growing HVAC company
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
                                        HVAC Technician - El Dorado, AR
                                    </h3>
                                    <p className="text-gray-600 mb-2">
                                        Full-time position servicing residential and commercial customers in the El Dorado area.
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
                                        HVAC Installer - South Arkansas
                                    </h3>
                                    <p className="text-gray-600 mb-2">
                                        Full-time position installing heating and cooling systems for residential and commercial customers.
                                    </p>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        El Dorado &amp; South Arkansas
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-vibrant-gold">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        HVAC Service Technician (Multi-Area)
                                    </h3>
                                    <p className="text-gray-600 mb-2">
                                        Full-time position covering multiple service calls across our South Arkansas service area.
                                    </p>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        South Arkansas
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-forest-green">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Commercial HVAC Specialist
                                    </h3>
                                    <p className="text-gray-600 mb-2">
                                        Experienced HVAC technician focused on large commercial systems and multi-site service.
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
                                        Part-time and seasonal positions available for peak heating and cooling season.
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
