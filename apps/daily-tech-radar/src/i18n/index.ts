import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enRadar from "./locales/en-US/radar.json";
import zhRadar from "./locales/zh-CN/radar.json";

export const supportedLocales = ["en-US", "zh-CN"] as const;

void i18n.use(initReactI18next).init({
  fallbackLng: "en-US",
  interpolation: {
    escapeValue: false,
  },
  lng: "en-US",
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
