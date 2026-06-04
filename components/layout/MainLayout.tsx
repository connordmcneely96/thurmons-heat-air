'use client';
import { usePathname } from 'next/navigation';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    // If Home page, no padding (so hero goes under header).
    // If not Home page, add padding (so content is below header).
    const mainClasses = isHomePage ? "flex-grow" : "flex-grow pt-[72px] lg:pt-[88px]";

    return <main className={mainClasses}>{children}</main>;
}
