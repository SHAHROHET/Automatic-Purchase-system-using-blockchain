'use client';

import './globals.css';
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return (
      <html lang="en">
        <head>
          <title>WADEIN - Purchase Order System</title>
          <meta name="description" content="Automated Purchase Order Management System with Blockchain Integration" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <title>WADEIN - Purchase Order System</title>
        <meta name="description" content="Automated Purchase Order Management System with Blockchain Integration" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-[280px]">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
