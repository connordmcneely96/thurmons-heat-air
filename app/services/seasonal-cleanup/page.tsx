import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ServiceFeatures } from '@/components/services/ServiceFeatures'
import { ServiceProcess } from '@/components/services/ServiceProcess'
import { ServiceFAQ } from '@/components/services/ServiceFAQ'
import { ServiceCTA } from '@/components/services/ServiceCTA'
import { ServiceShowcase } from '@/components/services/ServiceShowcase'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'
import { siteConfig } from '@/lib/site.config'

const check = (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
)

const features = [
  { icon: check, title: 'Right-Sized Systems', description: 'We size your new system to your home, so you get even comfort and lower energy bills.' },
  { icon: check, title: 'High-Efficiency Options', description: 'Modern, efficient AC and heating equipment that can cut your monthly costs.' },
  { icon: check, title: 'Financing Available', description: 'Flexible financing options so a new system fits your budget, not just your need.' },
]

const showcaseItems = [
  {
    eyebrow: 'Recent install',
    title: 'Two New Luxaire Systems, Installed Clean',
    body: 'A recent dual-system installation: two new Luxaire packaged units set on solid pads and tied in neatly. Luxaire is part of the York family we install and stand behind. Packaged units like these put heating and cooling in one outdoor cabinet, which makes them a smart, space-saving fit for manufactured and smaller homes. New equipment means quieter operation, a fresh manufacturer warranty, and lower bills than the worn-out system it replaced.',
    image: '/api/assets/services/installation/luxaire-dual-install.jpg',
    alt: 'Two new Luxaire packaged HVAC units installed on pads beside a manufactured home',
  },
]

const process = [
  { number: '1', title: 'Free In-Home Estimate', description: 'We assess your home and needs, then recommend the right system with a clear written quote.' },
  { number: '2', title: 'Choose Your System', description: 'We walk you through your options and financing so you can pick with confidence. No pressure.' },
  { number: '3', title: 'Professional Install', description: 'Our team installs cleanly and respectfully, then tests everything and walks you through it.' },
]

const faqs = [
  { question: 'What brands do you install?', answer: 'We install and stand behind York and Luxaire equipment, including all-in-one packaged units that are a great fit for manufactured and smaller homes.' },
  { question: 'Do you offer financing on new systems?', answer: 'Yes. We offer flexible financing options so a new system does not have to be paid all at once.' },
  { question: 'How much does a new system cost?', answer: 'It depends on your home size and the system you choose. We provide a free, exact written quote after an in-home assessment.' },
  { question: 'How long does an install take?', answer: 'Most residential installs are completed in a single day. We will give you a clear timeline up front.' },
]

export default function InstallationPage() {
  return (
    <main>
      <section className="relative bg-forest-green pt-20">
        <div className="container relative z-10 py-16">
          <div className="max-w-3xl">
            <h1 className="text-white font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
              New System Installation
            </h1>
            <p className="text-white/90 text-xl md:text-2xl mb-8">
              New high-efficiency AC and heating systems, sized right for your home, with free estimates and financing available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/quote-request"><Button variant="primary" size="lg" className="w-full sm:w-auto">Get Free Estimate</Button></Link>
              <a href={`tel:${siteConfig.phoneRaw}`}><Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 border-white text-white hover:bg-white hover:text-forest-green">Call {siteConfig.phone}</Button></a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h2 font-heading text-forest-green mb-4">Comfort That Pays You Back.</h2>
            <p className="text-lg text-gray-600 mb-4">An old, oversized, or failing system wastes money every month. A right-sized, high-efficiency system keeps your home comfortable and lowers your bills.</p>
            <p className="text-lg text-gray-600">We give you a free in-home estimate, honest options, and financing that fits your budget. No high-pressure sales, just the right system for your home.</p>
          </div>
        </div>
      </section>

      <ServiceShowcase
        heading="Recent Installs"
        intro="Real systems we have installed around El Dorado. Quality equipment, set and tied in right."
        items={showcaseItems}
      />

      <ServiceFeatures features={features} />
      <ServiceProcess steps={process} />
      <ServiceFAQ faqs={faqs} />
      <ServiceCTA
        title="Ready for a System That Pays You Back?"
        description={`Get a free in-home estimate and financing options that fit your budget. Call ${siteConfig.phone} or request your estimate.`}
        buttonText="Get Free Estimate"
        buttonLink="/quote-request"
      />
    </main>
  )
}

export const metadata: Metadata = buildPageMetadata({
  title: 'AC & Heating System Installation in El Dorado, AR',
  description: 'New high-efficiency AC and heating system installation in El Dorado, Arkansas. York and Luxaire equipment, free estimates, right-sized systems, and financing available.',
  path: '/services/seasonal-cleanup/',
})
