import Link from 'next/link';
import { ArrowRight, CheckCircle, Star, MapPin, Shield, Clock, Wind, Flame, Wrench, ClipboardCheck, DollarSign, Phone } from 'lucide-react';
import { MotionDiv } from '@/components/ui/MotionDiv';
import Testimonials from '@/components/sections/Testimonials';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site.config';

export const metadata: Metadata = buildPageMetadata({
  title: "Thurmon's Heat & Air | Heating & Air Conditioning | El Dorado, AR",
  description: 'Trusted HVAC service in El Dorado, AR since 2013. AC repair, heating and furnace service, installation, ductwork, ventilation, and mini-splits. Free estimates, Synchrony financing, 24/7 on-call.',
  path: '/',
});

const services = [
  { href: '/services/lawn-care', title: 'AC Repair & Service', desc: 'Fast diagnosis and repair for any make or model. We get your cooling back fast, often same day.', Icon: Wind },
  { href: '/services/flower-beds', title: 'Heating & Furnace', desc: 'Furnace and heat pump repair, tune-ups, and replacement to keep you warm through every cold snap.', Icon: Flame },
  { href: '/services/seasonal-cleanup', title: 'System Installation', desc: 'New high-efficiency AC and heating systems sized right for your home, with financing available.', Icon: Wrench },
  { href: '/services/pressure-washing', title: 'Maintenance & Mini-Splits', desc: 'Seasonal tune-ups and ductless mini-split installs that lower bills and extend equipment life.', Icon: ClipboardCheck },
];

const whyUs = [
  { Icon: Clock, title: 'Same-Day Service', desc: 'When your AC or heat goes out, you need it fixed now, not next week. We move fast.' },
  { Icon: DollarSign, title: 'Upfront Honest Pricing', desc: 'Straight quotes before we start. No pressure, no surprise upsells, just the work you need.' },
  { Icon: CheckCircle, title: 'Synchrony Financing', desc: 'Flexible financing through Synchrony so a new system fits your budget, not just your need.' },
  { Icon: Shield, title: 'Licensed & Insured', desc: `Arkansas licensed HVAC (#${siteConfig.license}), serving El Dorado since ${siteConfig.yearEstablished}.` },
];

const highlights = [
  `Serving El Dorado since ${siteConfig.yearEstablished} — ${siteConfig.combinedExperience}`,
  siteConfig.highlights.laborWarranty,
  siteConfig.highlights.seasonalVisits,
  siteConfig.highlights.financing,
  'Se habla espa\u00f1ol — service in English & Spanish',
];

const gallery = ['gallery-01', 'gallery-02', 'gallery-04', 'gallery-05', 'gallery-06', 'gallery-07'];

export default function HomePage() {
  return (
    <main className="flex-col">
      {/* Hero Section */}
      <section
        className="relative flex flex-col overflow-hidden bg-forest-green"
        style={{
          backgroundImage: "url('/images/gallery-07.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/60 z-10" />

        <div className="container relative z-20 px-4 pt-28 pb-12 lg:pt-32 lg:pb-16">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl text-center lg:text-left"
          >
            <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1 mb-6">
              <span className="text-white font-bold text-sm tracking-wider uppercase">Serving El Dorado &amp; South Arkansas Since {siteConfig.yearEstablished}</span>
            </div>

            <h1 className="text-white font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight drop-shadow-lg">
              Heating &amp; Air Conditioning You Can Count On
            </h1>

            <p className="text-gray-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Fast, dependable AC and heating service for El Dorado homes and businesses. Repairs, installs, and maintenance done right the first time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <Link
                href="/quote-request"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-lg bg-vibrant-gold text-deep-charcoal font-bold text-lg hover:bg-vibrant-gold-600 hover:scale-105 transition-all shadow-xl"
              >
                Get a Free Estimate
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <a
                href={`tel:${siteConfig.phoneRaw}`}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-lg bg-white/10 border-2 border-white text-white font-bold text-lg hover:bg-white hover:text-forest-green transition-all shadow-lg"
              >
                <Phone className="w-5 h-5 mr-2" /> {siteConfig.phone}
              </a>
            </div>
          </MotionDiv>
        </div>

        {/* Credentials Bar */}
        <div className="relative z-20 bg-black/40 backdrop-blur-sm border-t border-white/10">
          <div className="container px-4 py-4">
            <div className="flex flex-wrap justify-center lg:justify-start gap-5 md:gap-8 text-white/90 text-sm md:text-base font-medium">
              <div className="flex items-center"><Shield className="w-5 h-5 text-vibrant-gold mr-2 flex-shrink-0" /> Licensed &amp; Insured</div>
              <div className="flex items-center"><Clock className="w-5 h-5 text-vibrant-gold mr-2 flex-shrink-0" /> 24/7 On-Call</div>
              <div className="flex items-center"><CheckCircle className="w-5 h-5 text-vibrant-gold mr-2 flex-shrink-0" /> Free Estimates</div>
              <div className="flex items-center"><DollarSign className="w-5 h-5 text-vibrant-gold mr-2 flex-shrink-0" /> Financing Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro / About Section */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-100 h-[400px]">
                <img src="/images/gallery-06.jpg" alt="Thurmon's Heat & Air technician servicing an HVAC system in El Dorado, AR" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-forest-green text-white p-6 rounded-xl shadow-xl hidden md:block">
                <p className="text-2xl font-bold font-heading">Since</p>
                <p className="text-sm opacity-80 uppercase tracking-wider">{siteConfig.yearEstablished}</p>
              </div>
            </div>
            <div>
              <span className="text-forest-green font-bold uppercase tracking-wider text-sm mb-2 block">About Our Company</span>
              <h2 className="text-4xl font-heading font-bold text-deep-charcoal mb-6">Trusted Comfort for El Dorado Homes &amp; Businesses</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                When your heating or cooling quits, you want someone local who shows up fast and fixes it right. We have kept South Arkansas comfortable since {siteConfig.yearEstablished} with honest service, fair pricing, and workmanship we stand behind.
              </p>
              <ul className="space-y-4 mb-8">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start">
                    <div className="mt-1 mr-3 flex-shrink-0 w-6 h-6 rounded-full bg-forest-green/10 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-forest-green" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/quote-request" className="text-forest-green font-bold text-lg hover:text-vibrant-gold-700 transition-colors inline-flex items-center">
                Schedule Service <ArrowRight className="ml-2 w-5 h-5" />
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
            <h2 className="text-h2 font-heading font-bold text-4xl text-deep-charcoal mb-4">Our HVAC Services</h2>
            <div className="w-24 h-1 bg-vibrant-gold mx-auto mb-6"></div>
            <p className="text-lg text-gray-600">Complete heating and cooling solutions for El Dorado and the surrounding communities. Repair, replace, and maintain.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map(({ href, title, desc, Icon }) => (
              <Link key={href} href={href} className="group h-full">
                <MotionDiv whileHover={{ y: -5 }} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <div className="h-32 flex items-center justify-center bg-forest-green/10">
                    <Icon className="w-14 h-14 text-forest-green" />
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-forest-green mb-3 group-hover:text-vibrant-gold-700 transition-colors">{title}</h3>
                    <p className="text-gray-600 mb-6 flex-grow text-sm">{desc}</p>
                    <span className="text-forest-green font-bold text-sm uppercase tracking-wide flex items-center group-hover:underline mt-auto">
                      Learn More <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </MotionDiv>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section bg-white" id="why-us">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-forest-green font-bold uppercase tracking-wider text-sm mb-2 block">Why Choose Us</span>
            <h2 className="text-h2 font-heading font-bold text-4xl text-deep-charcoal">The El Dorado Difference</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyUs.map(({ Icon, title, desc }) => (
              <div key={title} className="group p-8 rounded-2xl bg-gray-50 hover:bg-forest-green hover:text-white transition-all duration-300 text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-forest-green group-hover:bg-white rounded-2xl flex items-center justify-center transition-colors">
                  <Icon className="w-8 h-8 text-white group-hover:text-forest-green" />
                </div>
                <h3 className="text-xl font-bold text-deep-charcoal group-hover:text-white mb-3">{title}</h3>
                <p className="text-gray-600 group-hover:text-white/75">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Projects Gallery */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-forest-green font-bold uppercase tracking-wider text-sm mb-2 block">Our Work</span>
            <h2 className="text-h2 font-heading font-bold text-4xl text-deep-charcoal mb-4">Recent Projects</h2>
            <div className="w-24 h-1 bg-vibrant-gold mx-auto mb-6"></div>
            <p className="text-lg text-gray-600">Real installs and service calls across El Dorado and South Arkansas.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((g) => (
              <div key={g} className="overflow-hidden rounded-xl shadow-sm aspect-[4/3]">
                <img
                  src={`/images/${g}.jpg`}
                  alt="Thurmon's Heat & Air recent HVAC install and service project in El Dorado, AR"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Service Area Section */}
      <section className="section bg-white border-t border-gray-200">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-forest-green font-bold uppercase tracking-wider text-sm mb-2 block">Service Area</span>
            <h2 className="text-4xl font-heading font-bold text-deep-charcoal mb-4">Proudly Serving El Dorado &amp; South Arkansas</h2>
            <p className="text-lg text-gray-600 mb-4">Fast, reliable heating and cooling service across Union County and the surrounding area.</p>
            <p className="text-base text-gray-500">
              El Dorado &middot; Magnolia &middot; Camden &middot; Smackover &middot; Norphlet &middot; Junction City &middot; Strong &middot; Huttig &mdash; and surrounding communities.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-50 rounded-2xl shadow-sm p-8">
              <h3 className="text-2xl font-heading font-bold text-forest-green mb-3">Based in El Dorado, AR</h3>
              <p className="text-gray-600 mb-2 flex items-center">
                <MapPin className="w-4 h-4 text-forest-green mr-2 flex-shrink-0" />
                {siteConfig.address.full}
              </p>
              <p className="text-sm text-gray-500 mb-6">Not sure if we cover your area? Give us a call. If you are near El Dorado, chances are we serve it.</p>
              <Link
                href="/quote-request"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-forest-green text-white font-bold text-sm uppercase tracking-wide hover:bg-forest-green-700 transition-colors"
              >
                Request Service
              </Link>

              <div className="mt-6 rounded-xl overflow-hidden shadow">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106000!2d-92.6663!3d33.2079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x862f51f2e85fffff%3A0x1!2sEl+Dorado%2C+AR!5e0!3m2!1sen!2sus!4v1"
                  width="100%"
                  height="300"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Thurmons Heat and Air - El Dorado Service Area"
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
          <h2 className="text-h2 font-heading font-bold text-4xl md:text-5xl text-white mb-6">AC Out? Heat Not Working? We Can Help.</h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">From emergency repairs to a brand-new system, {siteConfig.name} makes it easy to get comfortable again, fast.</p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/quote-request" className="inline-flex items-center justify-center px-10 py-5 rounded-lg bg-vibrant-gold text-deep-charcoal font-bold text-xl hover:bg-vibrant-gold-600 transform hover:-translate-y-1 transition-all shadow-lg">Get Your Free Estimate</Link>
            <a href={`tel:${siteConfig.phoneRaw}`} className="inline-flex items-center justify-center px-10 py-5 rounded-lg border-2 border-white text-white font-bold text-xl hover:bg-white hover:text-forest-green transform hover:-translate-y-1 transition-all"><Phone className="w-5 h-5 mr-2" /> Call {siteConfig.phone}</a>
          </div>
          <p className="mt-6 text-white/60 text-sm">Free estimates &bull; {siteConfig.highlights.laborWarranty} &bull; Synchrony financing</p>
        </div>
      </section>
    </main>
  );
}
