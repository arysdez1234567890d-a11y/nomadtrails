import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "@/styles/globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "NOMADTRAILS — Premium Kyrgyzstan Nomadic Tours",
  description:
    "Discover Kyrgyzstan's majestic mountains, authentic nomadic culture, and hidden trails. Premium nomadic experiences, yurt stays, and mountain expeditions.",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  }
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

import BackgroundMusic from "@/components/BackgroundMusic";
import { Providers } from "@/components/Providers";
import { IntlProvider } from "@/components/IntlProvider";

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "ru" | "ky")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico?v=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-inter antialiased">
        <IntlProvider locale={locale} messages={messages}>
          <Providers>
            {children}
            <BackgroundMusic />
          </Providers>
        </IntlProvider>
      </body>
    </html>
  );
}
