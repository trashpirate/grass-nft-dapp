import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { headers } from "next/headers";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_PROJECT_NAME,
  description: process.env.NEXT_PUBLIC_PROJECT_DESCRIPTION,
  applicationName: process.env.NEXT_PUBLIC_PROJECT_NAME,
  twitter: {
    card: "summary_large_image",
    site: "touchbasedgrass.com",
    creator: "@touchbasedgrass",
    images: "https://app.touchbasedgrass.com/preview.jpg",
  },
  openGraph: {
    type: "website",
    url: "https://app.touchbasedgrass.com",
    title: process.env.NEXT_PUBLIC_PROJECT_NAME,
    description:
      process.env.NEXT_PUBLIC_PROJECT_DESCRIPTION,
    siteName: process.env.NEXT_PUBLIC_PROJECT_NAME,
    images: [
      {
        url: "https://app.touchbasedgrass.com/preview.jpg",
      },
    ],
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookie = headers().get("cookie");
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers cookie={cookie}>{children}</Providers>
      </body>
    </html>
  );
}