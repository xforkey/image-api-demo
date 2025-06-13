import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { prefetchImages } from "@/lib/server-prefetch";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Image Api Demo",
  description: "A React CRUD application for managing images",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Prefetch images data on the server
  let initialImagesData;
  try {
    initialImagesData = await prefetchImages();
  } catch (error) {
    console.error('Failed to prefetch images:', error);
    // Let the error boundary handle it - don't throw here to avoid breaking the layout
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers initialImagesData={initialImagesData}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
