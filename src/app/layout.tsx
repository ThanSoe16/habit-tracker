import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_APP_NAME!,
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME}`,
  },
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
  manifest: "/manifest.json",

  openGraph: {
    type: "website",
    title: process.env.NEXT_PUBLIC_APP_NAME,
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: process.env.NEXT_PUBLIC_APP_NAME,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/cover-image.png`,
        width: 1200,
        height: 630,
        alt: process.env.NEXT_PUBLIC_APP_NAME,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: process.env.NEXT_PUBLIC_APP_NAME,
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/cover-image.png`],
  },

  icons: {
    icon: "/favicon.ico",
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: process.env.NEXT_PUBLIC_APP_NAME,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
