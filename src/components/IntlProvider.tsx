"use client";

import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

type Props = {
  locale: string;
  messages: any;
  children: ReactNode;
};

export function IntlProvider({ locale, messages, children }: Props) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Bishkek">
      {children}
    </NextIntlClientProvider>
  );
}

export default IntlProvider;
