import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/context/AuthProvider";
import { GoogleAnalytics } from '@next/third-parties/google'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "woise",
  description: "create your AI Covers | convert any youtube video into your favorite artist voice",
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
    },
  },
  generator: 'Next.js',
  applicationName: 'woise',
  keywords: ['AI Covers', 'music', 'ai clone'],
  // openGraph: {
  //   title: 'woise',
  //   description: 'create your AI Covers | convert any youtube video into your favorite artist voice',
  //   siteName: 'woise',
  //   locale: 'en_US',
  //   type: 'website',
  // },
 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="h-screen w-screen dark:bg-black bg-white  dark:bg-grid-white/[0.2] bg-grid-black/[0.2] ">
          {/* Radial gradient for the container to give a faded look */}
          <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_60%,black)]"></div>

          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </div>
      </body>
      <GoogleAnalytics gaId="G-4NFJV8K5Y6" />
    </html>
  );
}
