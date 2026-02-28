import { motion } from "framer-motion";
import { useI18n } from "@/contexts/I18nContext";
import { Globe } from "lucide-react";

export default function LanguageSelector() {
  const { language, setLanguage } = useI18n();

  const languages = [
    { code: "pt-BR", label: "🇧🇷 Português", flag: "🇧🇷" },
    { code: "en-US", label: "🇺🇸 English", flag: "🇺🇸" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-lg p-2"
    >
      <Globe className="w-4 h-4 text-gray-400" />
      <div className="flex gap-1">
        {languages.map((lang) => (
          <motion.button
            key={lang.code}
            onClick={() => setLanguage(lang.code as "pt-BR" | "en-US")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
              language === lang.code
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/50"
                : "text-gray-400 hover:text-white hover:bg-slate-700/50"
            }`}
          >
            {lang.flag} {lang.code === "pt-BR" ? "PT" : "EN"}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
