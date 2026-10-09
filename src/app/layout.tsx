import type {
  Metadata,
} from "next";

import "./globals.css";

import {
  Footer,
} from "@/components/layout/Footer";

import {
  Header,
} from "@/components/layout/Header";

import {
  ScrollRecommendations,
} from "@/components/recommendations/ScrollRecommendations";


const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://venuvella.vercel.app";


export const metadata: Metadata = {
  metadataBase:
    new URL(
      siteUrl
    ),

  title: {
    default:
      "Venuvella — Discover what’s worth having.",

    template:
      "%s | Venuvella",
  },

  description:
    "Thoughtful recommendations across beauty, home, fitness and style — edited to help you discover what is worth having.",

  applicationName:
    "Venuvella",

  category:
    "lifestyle",

  creator:
    "Venuvella",

  publisher:
    "Venuvella",

  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },

      {
        url: "/favicon.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],

    apple: "/apple-touch-icon.png",
  },

  openGraph: {
    type:
      "website",

    siteName:
      "Venuvella",

    title:
      "Venuvella — Discover what’s worth having.",

    description:
      "Thoughtful recommendations across beauty, home, fitness and style — edited to help you discover what is worth having.",

    images: [
      {
        url:
          "/og-default.jpg",

        width:
          1200,

        height:
          630,

        alt:
          "Venuvella editorial lifestyle discovery",
      },
    ],
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "Venuvella — Discover what’s worth having.",

    description:
      "Thoughtful recommendations across beauty, home, fitness and style — edited to help you discover what is worth having.",

    images: [
      "/og-default.jpg",
    ],
  },

  robots: {
    index:
      true,

    follow:
      true,

    googleBot: {
      index:
        true,

      follow:
        true,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,

      "max-video-preview":
        -1,
    },
  },
};


const organizationStructuredData = {
  "@context":
    "https://schema.org",

  "@type":
    "Organization",

  name:
    "Venuvella",

  url:
    siteUrl,

  logo:
    new URL(
      "/logo-profile.png",
      siteUrl
    ).toString(),
};


const websiteStructuredData = {
  "@context":
    "https://schema.org",

  "@type":
    "WebSite",

  name:
    "Venuvella",

  url:
    siteUrl,

  description:
    "Thoughtful recommendations across beauty, home, fitness and style.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify([
                organizationStructuredData,
                websiteStructuredData,
              ]).replace(
                /</g,
                "\\u003c"
              ),
          }}
        />

        <Header />

        {children}

        <Footer />

        <ScrollRecommendations />
      </body>
    </html>
  );
}
