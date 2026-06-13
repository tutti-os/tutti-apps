import { useEffect, useState } from "react";

import type { Locale } from "@/features/radar/types";

type HostLocaleValue = {
  language?: unknown;
  locale?: unknown;
};

type HostAppContext = HostLocaleValue & {
  get?: () => HostLocaleValue | Promise<HostLocaleValue>;
  getLocale?: () => string | Promise<string>;
  onLocaleChanged?: (listener: (locale: string | null) => void) => () => void;
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
  nextop?: {
    appContext?: HostAppContext;
  };
  nextopAppContext?: HostAppContext;
  tutti?: {
    appContext?: HostAppContext;
  };
  tuttiAppContext?: HostAppContext;
};

export const defaultLocale: Locale = "en-US";

function currentHost(): HostWindow {
  return typeof window === "undefined" ? {} : window;
}

function getAppContext(host: HostWindow) {
  return (
    host.tutti?.appContext ||
    host.tuttiAppContext ||
    host.nextop?.appContext ||
    host.nextopAppContext
  );
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
  const appContext = getAppContext(host);

  if (typeof appContext?.get === "function") {
    const context = await appContext.get();
    return resolveLocale(context?.locale || context?.language);
  }

  if (typeof appContext?.locale === "string") {
    return resolveLocale(appContext.locale);
  }

  if (typeof appContext?.language === "string") {
    return resolveLocale(appContext.language);
  }

  if (typeof appContext?.getLocale === "function") {
    return resolveLocale(await appContext.getLocale());
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
  const appContext = getAppContext(host);

  if (typeof appContext?.subscribe === "function") {
    return appContext.subscribe((context) => {
      listener(resolveLocale(context?.locale || context?.language));
    });
  }

  if (typeof appContext?.onLocaleChanged === "function") {
    return appContext.onLocaleChanged((locale) => {
      listener(resolveLocale(locale));
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
