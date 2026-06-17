import { useEffect, useState } from "react";

import type { Locale } from "@/features/radar/types";

type HostLocaleValue = {
  language?: unknown;
  locale?: unknown;
};

type HostExternalApp = {
  getContext?: () => HostLocaleValue | Promise<HostLocaleValue>;
  subscribe?: (listener: (context: HostLocaleValue) => void) => () => void;
};

type HostWindow = {
  document?: {
    documentElement?: {
      lang?: string;
    };
  };
  navigator?: {
    language?: string;
    languages?: readonly string[];
  };
  tuttiExternal?: {
    app?: HostExternalApp;
  };
};

export const defaultLocale: Locale = "en-US";

function currentHost(): HostWindow {
  return typeof window === "undefined" ? {} : window;
}

function getExternalApp(host: HostWindow) {
  return host.tuttiExternal?.app;
}

export function resolveLocale(locale: unknown): Locale {
  return locale === "zh-CN" ? "zh-CN" : defaultLocale;
}

export function resolveAppLocale(
  appLocale: unknown,
  hostLocale: unknown,
): Locale {
  if (appLocale === "zh-CN" || appLocale === "en-US") {
    return appLocale;
  }

  return resolveLocale(hostLocale);
}

export async function readHostLocale(host: HostWindow = currentHost()) {
  const externalApp = getExternalApp(host);

  if (typeof externalApp?.getContext === "function") {
    const context = await externalApp.getContext();
    return resolveLocale(context?.locale || context?.language);
  }

  return resolveLocale(
    host.document?.documentElement?.lang ||
      host.navigator?.languages?.[0] ||
      host.navigator?.language,
  );
}

export function subscribeHostLocale(
  listener: (locale: Locale) => void,
  host: HostWindow = currentHost(),
) {
  const externalApp = getExternalApp(host);

  if (typeof externalApp?.subscribe === "function") {
    return externalApp.subscribe((context) => {
      listener(resolveLocale(context?.locale || context?.language));
    });
  }

  return () => {};
}

export function useHostLocale() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    let isMounted = true;

    void readHostLocale().then((nextLocale) => {
      if (isMounted) {
        setLocale(nextLocale);
      }
    });

    const unsubscribe = subscribeHostLocale((nextLocale) => {
      if (isMounted) {
        setLocale(nextLocale);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return locale;
}
