import { describe, expect, it, vi } from "vitest";

import {
  readHostLocale,
  resolveAppLocale,
  resolveLocale,
  subscribeHostLocale,
} from "./app-context";

describe("Tutti app context locale", () => {
  it("defaults to English when no host locale is available", async () => {
    expect(resolveLocale(null)).toBe("en-US");
    expect(await readHostLocale({})).toBe("en-US");
  });

  it("reads the locale from window.tutti.appContext.get", async () => {
    const host = {
      tutti: {
        appContext: {
          get: async () => ({ locale: "zh-CN" }),
        },
      },
    };

    expect(await readHostLocale(host)).toBe("zh-CN");
  });

  it("lets the app URL locale override the host locale without mutating host context", () => {
    expect(resolveAppLocale("en-US", "zh-CN")).toBe("en-US");
    expect(resolveAppLocale("zh-CN", "en-US")).toBe("zh-CN");
    expect(resolveAppLocale(undefined, "zh-CN")).toBe("zh-CN");
    expect(resolveAppLocale(undefined, undefined)).toBe("en-US");
  });

  it("subscribes to host locale changes and normalizes unsupported values", () => {
    const unsubscribe = vi.fn();
    const listener = vi.fn();
    const host = {
      tuttiAppContext: {
        subscribe: (callback: (context: { language: string }) => void) => {
          callback({ language: "fr-FR" });
          callback({ language: "zh-CN" });
          return unsubscribe;
        },
      },
    };

    expect(subscribeHostLocale(listener, host)).toBe(unsubscribe);
    expect(listener).toHaveBeenNthCalledWith(1, "en-US");
    expect(listener).toHaveBeenNthCalledWith(2, "zh-CN");
  });
});
