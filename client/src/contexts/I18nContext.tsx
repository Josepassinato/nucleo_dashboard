import React, { createContext, useContext, useState, useEffect } from "react";
import translations from "@/i18n/translations.json";

type Language = "pt-BR" | "en-US";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  locale: {
    currency: string;
    currencyCode: string;
    dateFormat: string;
    timeFormat: string;
    timezone: string;
  };
  formatCurrency: (value: number) => string;
  formatDate: (date: Date) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language") as Language | null;
    return saved || "pt-BR";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };

  const locale = {
    currency: translations[language].common.currency,
    currencyCode: translations[language].common.currencyCode,
    dateFormat: translations[language].common.dateFormat,
    timeFormat: translations[language].common.timeFormat,
    timezone: translations[language].common.timezone,
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat(language, {
      style: "currency",
      currency: locale.currencyCode,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(language, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, locale, formatCurrency, formatDate }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n deve ser usado dentro de I18nProvider");
  }
  return context;
}
