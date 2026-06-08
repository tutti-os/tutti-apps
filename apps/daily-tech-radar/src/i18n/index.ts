import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enRadar from "./locales/en-US/radar.json";
import zhRadar from "./locales/zh-CN/radar.json";

export const supportedLocales = ["zh-CN", "en-US"] as const;

void i18n.use(initReactI18next).init({
  fallbackLng: "zh-CN",
  interpolation: {
    escapeValue: false,
  },
  lng: "zh-CN",
  ns: ["radar"],
  defaultNS: "radar",
  resources: {
    "en-US": {
      radar: enRadar,
    },
    "zh-CN": {
      radar: zhRadar,
    },
  },
});

export default i18n;
