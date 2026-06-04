import Link from 'next/link';
import { Facebook, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';
import { siteConfig } from '@/lib/site.config';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-forest-green text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div>
                        <Link href="/" className="inline-block mb-4">
                            <span className="inline-flex bg-white rounded-xl p-3 shadow-md">
                                <img src="/images/logo-mark.png" alt="Thurmon's Heat & Air" className="h-24 w-auto" />
                            </span>
                        </Link>
                        <p className="text-gray-300 text-sm leading-relaxed mb-6">
                            Dependable heating &amp; air conditioning service for El Dorado and South Arkansas since {siteConfig.yearEstablished} — repairs, installs, ductwork, and maintenance done right.
                        </p>
                        <div className="flex space-x-4">
                            <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" className="bg-white/10 p-2 rounded-full hover:bg-vibrant-gold hover:text-deep-charcoal transition-colors" aria-label="Facebook">
                                <Facebook className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Services Column */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-vibrant-gold">Services</h3>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li><Link href="/services/lawn-care" className="hover:text-white transition-colors">AC Repair &amp; Service</Link></li>
                            <li><Link href="/services/flower-beds" className="hover:text-white transition-colors">Heating &amp; Furnace</Link></li>
                            <li><Link href="/services/seasonal-cleanup" className="hover:text-white transition-colors">System Installation</Link></li>
                            <li><Link href="/services/pressure-washing" className="hover:text-white transition-colors">Maintenance &amp; Mini-Splits</Link></li>
                            <li><Link href="/services/ductwork" className="hover:text-white transition-colors">Ductwork</Link></li>
                            <li><Link href="/services/ventilation" className="hover:text-white transition-colors">Ventilation</Link></li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-vibrant-gold">Contact Us</h3>
                        <ul className="space-y-4 text-sm text-gray-300">
                            <li className="flex items-start">
                                <MapPin className="w-5 h-5 mr-3 text-vibrant-gold flex-shrink-0" />
                                <span>{siteConfig.address.full}</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="w-5 h-5 mr-3 text-vibrant-gold flex-shrink-0" />
                                <a href={`tel:${siteConfig.phoneRaw}`} className="hover:text-white transition-colors">{siteConfig.phone}</a>
                            </li>
                            <li className="flex items-center">
                                <Mail className="w-5 h-5 mr-3 text-vibrant-gold flex-shrink-0" />
                                <a href={`mailto:${siteConfig.email}`} className="hover:text-white transition-colors break-all">{siteConfig.email}</a>
                            </li>
                            <li className="flex items-center">
                                <ShieldCheck className="w-5 h-5 mr-3 text-vibrant-gold flex-shrink-0" />
                                <span>AR License #{siteConfig.license}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-vibrant-gold">Company</h3>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                            <li><Link href="/quote-request" className="hover:text-white transition-colors">Get a Quote</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-300">
                    <p>&copy; {currentYear} {siteConfig.name}. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
