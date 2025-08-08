import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Calendar App',
  description: 'Google Calendar Dashboard',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
