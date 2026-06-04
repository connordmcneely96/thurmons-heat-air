'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone, Shield } from 'lucide-react';

const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Commercial', href: '/commercial' },
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
];

const services = [
    { name: 'Lawn Care & Maintenance', href: '/services/lawn-care' },
    { name: 'Landscaping & Design', href: '/services/flower-beds' },
    { name: 'Seasonal Cleanups', href: '/services/seasonal-cleanup' },
    { name: 'Pressure Washing & Soft Washing', href: '/services/pressure-washing' },
];

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
    const pathname = usePathname();

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
        setActiveSubmenu(null);
    }, [pathname]);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex items-center h-16">
                    {/* Logo — icon only (crop to the circular icon portion of the SVG) */}
                    <Link href="/" className="flex items-center flex-shrink-0 group">
                        <img
                            src="/images/logo-icon.svg"
                            alt="Evergrow Landscaping"
                            width={52}
                            height={52}
                            style={{ width: '52px', height: '52px' }}
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-10 ml-10">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-sm font-semibold uppercase tracking-wider text-forest-green hover:text-vibrant-gold transition-colors"
                            >
                                {item.name}
                            </Link>
                        ))}
                        <div className="relative group">
                            <button className="text-sm font-semibold uppercase tracking-wider text-forest-green hover:text-vibrant-gold transition-colors flex items-center">
                                Services
                            </button>
                            <div className="absolute top-full left-0 pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <div className="bg-white rounded-lg shadow-xl py-2 overflow-hidden">
                                    {services.map((service) => (
                                        <Link
                                            key={service.href}
                                            href={service.href}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-vibrant-gold-50 hover:text-forest-green"
                                        >
                                            {service.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* Desktop CTA Buttons */}
                    <div className="hidden lg:flex items-center space-x-6 ml-auto">
                        <a
                            href="tel:+14054795794"
                            className="flex items-center space-x-2 text-forest-green font-semibold hover:text-vibrant-gold transition-colors"
                        >
                            <Phone className="w-4 h-4" />
                            <span>405-479-5794</span>
                        </a>
                        <Link
                            href="/pay"
                            className="text-sm font-semibold uppercase tracking-wider text-forest-green hover:text-vibrant-gold transition-colors"
                        >
                            Make a Payment
                        </Link>
                        <Link
                            href="/portal"
                            className="text-sm font-semibold uppercase tracking-wider text-forest-green hover:text-vibrant-gold transition-colors"
                        >
                            Client Login
                        </Link>
                        <Link
                            href="/admin/login"
                            className="flex items-center space-x-1 text-sm font-semibold uppercase tracking-wider text-forest-green hover:text-vibrant-gold transition-colors"
                        >
                            <Shield className="w-4 h-4" />
                            <span>Admin</span>
                        </Link>
                        <Link
                            href="/quote-request"
                            className="bg-forest-green text-white px-6 py-2.5 rounded-md font-bold uppercase text-sm tracking-wide hover:bg-forest-green-700 transition-colors shadow-md"
                        >
                            Get a Quote
                        </Link>
                    </div>

                    {/* Mobile Actions — Phone, Login, Quote always visible outside hamburger */}
                    <div className="flex lg:hidden items-center gap-1 ml-auto">
                        {/* Phone — icon always, number on ≥380px */}
                        <a
                            href="tel:+14054795794"
                            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-forest-green"
                            aria-label="Call us at 405-479-5794"
                        >
                            <Phone className="w-5 h-5" />
                            <span className="hidden min-[380px]:inline ml-1 text-sm font-semibold whitespace-nowrap">
                                405-479-5794
                            </span>
                        </a>

                        {/* Client Login — shown on ≥380px */}
                        <Link
                            href="/portal"
                            className="hidden min-[380px]:flex min-h-[44px] min-w-[44px] items-center justify-center text-xs font-semibold uppercase tracking-wider text-forest-green px-2 whitespace-nowrap"
                        >
                            Login
                        </Link>

                        {/* Get Quote CTA — always visible */}
                        <Link
                            href="/quote-request"
                            className="min-h-[44px] flex items-center justify-center bg-forest-green text-white px-3 py-2 rounded-md font-bold text-xs uppercase tracking-wide whitespace-nowrap"
                        >
                            Get Quote
                        </Link>

                        {/* Hamburger */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="min-w-[44px] min-h-[44px] p-2 rounded-md text-forest-green flex items-center justify-center"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay — nav links only */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 lg:hidden overflow-y-auto max-h-[80vh]"
                    >
                        <div className="container mx-auto px-4 py-6 flex flex-col space-y-4">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-lg font-semibold text-deep-charcoal border-b border-gray-100 pb-2"
                                >
                                    {item.name}
                                </Link>
                            ))}

                            <div className="border-b border-gray-100 pb-2">
                                <button
                                    onClick={() => setActiveSubmenu(activeSubmenu === 'services' ? null : 'services')}
                                    className="flex items-center justify-between w-full text-lg font-semibold text-deep-charcoal"
                                >
                                    Services
                                    <span className={`transform transition-transform ${activeSubmenu === 'services' ? 'rotate-180' : ''}`}>▼</span>
                                </button>
                                <AnimatePresence>
                                    {activeSubmenu === 'services' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-gray-50 rounded-md mt-2"
                                        >
                                            {services.map((service) => (
                                                <Link
                                                    key={service.href}
                                                    href={service.href}
                                                    className="block px-4 py-3 text-sm text-gray-600 border-b border-gray-200 last:border-0"
                                                >
                                                    {service.name}
                                                </Link>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="pt-4 flex flex-col space-y-3">
                                <Link
                                    href="/portal/login"
                                    className="bg-forest-green text-white py-3 rounded-lg font-bold uppercase text-center tracking-wide shadow-md"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/pay"
                                    className="bg-hopeful-teal text-white py-3 rounded-lg font-bold uppercase text-center tracking-wide shadow-md"
                                >
                                    Make a Payment
                                </Link>
                                <Link
                                    href="/admin/login"
                                    className="flex items-center justify-center space-x-2 bg-deep-charcoal text-white py-3 rounded-lg font-bold uppercase tracking-wide shadow-md"
                                >
                                    <Shield className="w-5 h-5" />
                                    <span>Admin Panel</span>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
