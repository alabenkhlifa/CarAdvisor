import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import MobileNav from './MobileNav';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 w-full mx-auto max-w-lg md:max-w-4xl px-4 py-6">
        {children}
      </main>

      <Footer />
      <MobileNav />

      {/* Bottom padding on mobile to account for fixed nav */}
      <div className="h-14 md:hidden" aria-hidden="true" />
    </div>
  );
}
