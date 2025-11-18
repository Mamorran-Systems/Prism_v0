import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Prism Iterate',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen w-screen bg-neutral-950 text-neutral-50">
        {children}
      </body>
    </html>
  );
}

