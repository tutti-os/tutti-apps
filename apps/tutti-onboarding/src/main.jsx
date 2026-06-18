import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/lexend";

import App from "./App";
import i18n from "./i18n";
import { readQueryLocale, resolveAppLocale } from "./i18n/app-context";
import "./styles.css";

const initialLocale = resolveAppLocale(
  import.meta.env.DEV ? readQueryLocale() : null,
  typeof navigator === "undefined" ? "en-US" : navigator.language,
);

document.documentElement.lang = initialLocale;
void i18n.changeLanguage(initialLocale);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
