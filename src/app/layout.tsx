import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HomeVision',
  description: 'Smart Energy Dashboard by jarvis5976',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground transition-colors duration-300">{children}</body>
    </html>
  );
}
