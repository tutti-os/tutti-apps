import { describe, expect, it } from "vitest";

import i18n, { supportedLocales } from "./index";

describe("daily tech radar i18n", () => {
  it("exposes the supported locales for route and UI language sync", () => {
    expect(supportedLocales).toEqual(["en-US", "zh-CN"]);
    expect(i18n.language).toBe("en-US");
  });

  it("translates interpolated UI copy in both supported languages", () => {
    expect(
      i18n.t("card.open", {
        lng: "zh-CN",
        ns: "radar",
        title: "Minimi",
      }),
    ).toBe("查看 Minimi");
    expect(
      i18n.t("card.open", {
        lng: "en-US",
        ns: "radar",
        title: "Minimi",
      }),
    ).toBe("Open Minimi");
  });
});
