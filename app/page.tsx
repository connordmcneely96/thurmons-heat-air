import Link from 'next/link';
import { ArrowRight, CheckCircle, Star, MapPin, Shield, Clock } from 'lucide-react';
import Image from 'next/image';
import { MotionDiv } from '@/components/ui/MotionDiv';
import Testimonials from '@/components/sections/Testimonials';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Evergrow Landscaping | Professional Landscaping Services | Residential and Commercial',
  description: 'Professional Landscaping Services in Arkansas and Oklahoma. Lawncare, Landscaping, Seasonal Cleanups, Pressure Washing',
  path: '/',
});

export default function HomePage() {
  return (
    <main className="flex-col">
      {/* Hero Section */}
      <section
        className="relative flex flex-col overflow-hidden bg-forest-green"
        style={{
          backgroundImage: "url('/api/assets/home-hero-bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50 z-10" />

        <div className="container relative z-20 px-4 pt-24 pb-8 lg:pt-28 lg:pb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10 lg:gap-16">

            {/* Text Column */}
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex-1 text-center lg:text-left"
            >
              {/* Serving Badge */}
              <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1 mb-6">
                <span className="text-white font-bold text-sm tracking-wider uppercase">SERVING ARKANSAS &amp; OKLAHOMA</span>
              </div>

              {/* Full Logo in Hero */}
              <div className="mb-8 flex justify-center lg:justify-start">
                <Image
                  src="/images/Logo- Transparent & No Buffer .png"
                  alt="Evergrow Landscaping"
                  width={280}
                  height={112}
                  className="w-full max-w-[200px] md:max-w-[280px] h-auto"
                  priority
                />
              </div>

              {/* Headline */}
              <h1 className="text-white font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight drop-shadow-lg">
                Professional Landscaping Services
              </h1>

              {/* Subheadline */}
              <p className="text-gray-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Managing 100+ properties | Maintaining Millions of Square Footage
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <Link
                  href="/commercial"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-lg bg-vibrant-gold text-white font-bold text-lg hover:bg-forest-green-700 hover:scale-105 transition-all shadow-xl"
                >
                  Commercial Inquiries
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="/quote-request"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-lg bg-white/10 border-2 border-white text-white font-bold text-lg hover:bg-white hover:text-forest-green transition-all shadow-lg"
                >
                  Residential Quote
                </Link>
              </div>
            </MotionDiv>

          </div>
        </div>

        {/* Credentials Bar — positioned at bottom of hero section */}
        <div className="relative z-20 bg-black/30 backdrop-blur-sm border-t border-white/10">
          <div className="container px-4 py-4">
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 md:gap-10 text-white/90 text-sm md:text-base font-medium">
              <div className="flex items-center"><Shield className="w-5 h-5 text-vibrant-gold mr-2 flex-shrink-0" /> Licensed &amp; Insured</div>
              <div className="flex items-center"><MapPin className="w-5 h-5 text-vibrant-gold mr-2 flex-shrink-0" /> 100+ Properties Managed</div>
              <div className="flex items-center"><CheckCircle className="w-5 h-5 text-vibrant-gold mr-2 flex-shrink-0" /> 1M+ Square Footage Maintained</div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro / About Section (Restored) */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-100">
                <Image
                  src="/api/assets/company-image.png"
                  alt="Evergrow Landscaping company"
                  width={600}
                  height={400}
                  className="w-full h-[400px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-forest-green text-white p-6 rounded-xl shadow-xl hidden md:block">
                <p className="text-3xl font-bold font-heading">Since</p>
                <p className="text-sm opacity-80 uppercase tracking-wider">2023</p>
              </div>
            </div>
            <div>
              <span className="text-forest-green font-bold uppercase tracking-wider text-sm mb-2 block">About Our Company</span>
              <h2 className="text-4xl font-heading font-bold text-deep-charcoal mb-6">Creating Outdoor Spaces That Stand Out Year-Round</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                With consistent maintenance and attention to detail, we take the stress out of lawn care so you can simply enjoy a beautiful, polished yard that stands out in your neighborhood. Our team brings expertise and passion to every project.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="mt-1 mr-3 flex-shrink-0 w-6 h-6 rounded-full bg-forest-green/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-forest-green" />
                  </div>
                  <span className="text-gray-700">Professional grade equipment and materials</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 mr-3 flex-shrink-0 w-6 h-6 rounded-full bg-forest-green/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-forest-green" />
                  </div>
                  <span className="text-gray-700">Customized solutions for every property</span>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 mr-3 flex-shrink-0 w-6 h-6 rounded-full bg-forest-green/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-forest-green" />
                  </div>
                  <span className="text-gray-700">Reliable, on-time service you can count on</span>
                </li>
              </ul>
              <Link href="/quote-request" className="text-forest-green font-bold text-lg hover:text-vibrant-gold transition-colors inline-flex items-center">
                Schedule Consultation <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section bg-gray-50" id="services">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-forest-green font-bold uppercase tracking-wider text-sm mb-2 block">What We Offer</span>
            <h2 className="text-h2 font-heading font-bold text-4xl text-deep-charcoal mb-4">
              Our Professional Services
            </h2>
            <div className="w-24 h-1 bg-vibrant-gold mx-auto mb-6"></div>
            <p className="text-lg text-gray-600">
              Comprehensive landscaping solutions tailored to transform and maintain your outdoor spaces throughout every season.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Service 1 */}
            <Link href="/services/lawn-care" className="group h-full">
              <MotionDiv whileHover={{ y: -5 }} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                <div className="h-48 overflow-hidden">
                  <img
                    src="/api/assets/service-lawn-care.png"
                    alt="Lawn Care & Maintenance"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-forest-green mb-3 group-hover:text-vibrant-gold transition-colors">
                    Lawn Care & Maintenance
                  </h3>
                  <p className="text-gray-600 mb-6 flex-grow text-sm">
                    Weekly mowing, trimming, edging, fertilization, and weed control to keep your grass strong and vibrant.
                  </p>
                  <span className="text-forest-green font-bold text-sm uppercase tracking-wide flex items-center group-hover:underline mt-auto">
                    Learn More <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </MotionDiv>
            </Link>

            {/* Service 2 */}
            <Link href="/services/flower-beds" className="group h-full">
              <MotionDiv whileHover={{ y: -5 }} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                <div className="h-48 overflow-hidden">
                  <img
                    src="/api/assets/service-landscaping-design.png"
                    alt="Landscaping & Design"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-forest-green mb-3 group-hover:text-vibrant-gold transition-colors">
                    Landscaping & Design
                  </h3>
                  <p className="text-gray-600 mb-6 flex-grow text-sm">
                    Custom installation, plant selection, flower beds, mulch, and rock layouts to enhance beauty.
                  </p>
                  <span className="text-forest-green font-bold text-sm uppercase tracking-wide flex items-center group-hover:underline mt-auto">
                    Learn More <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </MotionDiv>
            </Link>

            {/* Service 3 */}
            <Link href="/services/seasonal-cleanup" className="group h-full">
              <MotionDiv whileHover={{ y: -5 }} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                <div className="h-48 overflow-hidden">
                  <img
                    src="/api/assets/service-seasonal-cleanups.png"
                    alt="Seasonal Cleanups"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-forest-green mb-3 group-hover:text-vibrant-gold transition-colors">
                    Seasonal Cleanups
                  </h3>
                  <p className="text-gray-600 mb-6 flex-grow text-sm">
                    Spring and fall cleanups, leaf removal, debris clearing, and bed preparation.
                  </p>
                  <span className="text-forest-green font-bold text-sm uppercase tracking-wide flex items-center group-hover:underline mt-auto">
                    Learn More <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </MotionDiv>
            </Link>

            {/* Service 4 */}
            <Link href="/services/pressure-washing" className="group h-full">
              <MotionDiv whileHover={{ y: -5 }} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                <div className="h-48 overflow-hidden">
                  <img
                    src="/api/assets/service-pressure-washing.png"
                    alt="Pressure Washing & Soft Washing"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-forest-green mb-3 group-hover:text-vibrant-gold transition-colors">
                    Pressure Washing & Soft Washing
                  </h3>
                  <p className="text-gray-600 mb-6 flex-grow text-sm">
                    Restore driveways, patios, siding, decks, and walkways by removing dirt and grime.
                  </p>
                  <span className="text-forest-green font-bold text-sm uppercase tracking-wide flex items-center group-hover:underline mt-auto">
                    Learn More <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </MotionDiv>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section bg-white" id="why-us">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-forest-green font-bold uppercase tracking-wider text-sm mb-2 block">Why Choose Us</span>
            <h2 className="text-h2 font-heading font-bold text-4xl text-deep-charcoal">
              Quality You Can Trust
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="group p-8 rounded-2xl bg-gray-50 hover:bg-forest-green hover:text-white transition-all duration-300 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-forest-green group-hover:bg-white rounded-2xl flex items-center justify-center transition-colors">
                <Star className="w-8 h-8 text-white group-hover:text-forest-green" />
              </div>
              <h3 className="text-xl font-bold text-deep-charcoal group-hover:text-white mb-3">Quality Work</h3>
              <p className="text-gray-600 group-hover:text-white/75">We take pride in every project, ensuring exceptional results that exceed your expectations.</p>
            </div>

            {/* Card 2 */}
            <div className="group p-8 rounded-2xl bg-gray-50 hover:bg-forest-green hover:text-white transition-all duration-300 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-forest-green group-hover:bg-white rounded-2xl flex items-center justify-center transition-colors">
                <Clock className="w-8 h-8 text-white group-hover:text-forest-green" />
              </div>
              <h3 className="text-xl font-bold text-deep-charcoal group-hover:text-white mb-3">Reliable Service</h3>
              <p className="text-gray-600 group-hover:text-white/75">Count on us to show up on time, every time, with consistent and dependable service.</p>
            </div>

            {/* Card 3 */}
            <div className="group p-8 rounded-2xl bg-gray-50 hover:bg-forest-green hover:text-white transition-all duration-300 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-forest-green group-hover:bg-white rounded-2xl flex items-center justify-center transition-colors">
                <Shield className="w-8 h-8 text-white group-hover:text-forest-green" />
              </div>
              <h3 className="text-xl font-bold text-deep-charcoal group-hover:text-white mb-3">Expert Team</h3>
              <p className="text-gray-600 group-hover:text-white/75">Our experienced professionals bring skill, care, and attention to detail to every project.</p>
            </div>

            {/* Card 4 */}
            <div className="group p-8 rounded-2xl bg-gray-50 hover:bg-forest-green hover:text-white transition-all duration-300 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-forest-green group-hover:bg-white rounded-2xl flex items-center justify-center transition-colors">
                <CheckCircle className="w-8 h-8 text-white group-hover:text-forest-green" />
              </div>
              <h3 className="text-xl font-bold text-deep-charcoal group-hover:text-white mb-3">Customer Care</h3>
              <p className="text-gray-600 group-hover:text-white/75">Your satisfaction is our priority. We treat every property like our own.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Service Area Section */}
      <section className="section bg-gray-50 border-t border-gray-200">
        <div className="container">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-forest-green font-bold uppercase tracking-wider text-sm mb-2 block">Service Area</span>
            <h2 className="text-4xl font-heading font-bold text-deep-charcoal mb-4">Proudly Serving Arkansas &amp; Oklahoma</h2>
            <p className="text-lg text-gray-600 mb-4">We focus on consistent, reliable services across both states.</p>
            <p className="text-base text-gray-500">
              Professional landscaping services dedicated to transforming and maintaining spaces across Arkansas &amp; Oklahoma.
            </p>
          </div>

          {/* Commercial + Residential — side-by-side on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Commercial */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h3 className="text-2xl font-heading font-bold text-forest-green mb-3">Commercial</h3>
              <p className="text-gray-600 mb-2 flex items-center">
                <MapPin className="w-4 h-4 text-forest-green mr-2 flex-shrink-0" />
                OKC · Tulsa · Fayetteville · Little Rock · El Dorado — and surrounding areas
              </p>
              <p className="text-sm text-gray-500 mb-6">Multi-location property management across both states.</p>
              {/* TODO: Wire to commercial zip validation when Karson provides zip list */}
              <button
                className="w-full sm:w-auto px-6 py-3 rounded-lg font-bold text-white text-sm uppercase tracking-wide transition-colors"
                style={{ backgroundColor: '#4DB8AC' }}
              >
                Check Commercial Coverage
              </button>

              {/* Oklahoma Map */}
              <div className="mt-6 rounded-xl overflow-hidden shadow">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d200000!2d-97.5164!3d35.4676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87ac8fac09a2070d%3A0x1!2sOklahoma+City%2C+OK!5e0!3m2!1sen!2sus!4v1"
                  width="100%"
                  height="300"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Evergrow Landscaping – Oklahoma Service Area"
                />
              </div>
            </div>

            {/* Residential */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h3 className="text-2xl font-heading font-bold text-forest-green mb-3">Residential</h3>
              <p className="text-gray-600 mb-2 flex items-center">
                <MapPin className="w-4 h-4 text-forest-green mr-2 flex-shrink-0" />
                El Dorado · Oklahoma City — and surrounding areas
              </p>
              <p className="text-sm text-gray-500 mb-6">Consistent residential service for homeowners in AR &amp; OK.</p>
              {/* TODO: Wire to residential zip validation when Karson provides zip list */}
              <button
                className="w-full sm:w-auto px-6 py-3 rounded-lg font-bold text-white text-sm uppercase tracking-wide transition-colors"
                style={{ backgroundColor: '#4DB8AC' }}
              >
                Check Residential Coverage
              </button>

              {/* Arkansas/El Dorado Map */}
              <div className="mt-6 rounded-xl overflow-hidden shadow">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106000!2d-92.6663!3d33.2079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x862f51f2e85fffff%3A0x1!2sEl+Dorado%2C+AR!5e0!3m2!1sen!2sus!4v1"
                  width="100%"
                  height="300"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Evergrow Landscaping – Arkansas Service Area"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-forest-green relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-vibrant-gold rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-vibrant-gold rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="container relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-white text-sm font-bold tracking-wider uppercase mb-6 backdrop-blur-sm border border-white/20">Get Started</span>
          <h2 className="text-h2 font-heading font-bold text-4xl md:text-5xl text-white mb-6">
            Ready for a Yard You Love Coming Home To?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            From weekly maintenance to full landscape upgrades, Evergrow Landscaping makes it easy to keep your outdoor space beautiful.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/quote-request"
              className="inline-flex items-center justify-center px-10 py-5 rounded-lg bg-vibrant-gold text-white font-bold text-xl hover:bg-forest-green-700 transform hover:-translate-y-1 transition-all shadow-lg"
            >
              Get Your Free Quote
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-10 py-5 rounded-lg border-2 border-white text-white font-bold text-xl hover:bg-white hover:text-forest-green transform hover:-translate-y-1 transition-all"
            >
              Explore All Services
            </Link>
          </div>
          <p className="mt-6 text-white/60 text-sm">
            Fast, free estimates • No credit card required
          </p>
        </div>
      </section>
    </main>
  );
}
