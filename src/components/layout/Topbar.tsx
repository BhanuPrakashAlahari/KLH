import { useState, useRef } from "react";
import { Search, Bell, User, ChevronDown, Check, LogOut, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
] as const;

export function Topbar() {
    const { language, setLanguage, t } = useLanguage();
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [user] = useState<any>(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });

    const langRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(langRef, () => setIsLangOpen(false));
    useOnClickOutside(profileRef, () => setIsProfileOpen(false));

    const currentLang = languages.find(l => l.code === language) || languages[0];

    return (
        <header className="h-20 w-full px-8 flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-2xl sticky top-0 z-40 transition-all">
            <div className="flex items-center gap-4 flex-1">
                {/* Smart Search */}
                <div className="relative group max-w-md w-full">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Search className="w-4 h-4 text-slate-400 group-focus-within:text-slate-700 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className={cn(
                            "w-full bg-slate-50/50 border border-slate-200 rounded-full py-2.5 pl-11 pr-4 text-sm outline-none transition-all",
                            "placeholder:text-slate-400 focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-100 shadow-sm"
                        )}
                        placeholder={t('searchPlaceholder')}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-500">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 pl-4">
                {/* Language selector */}
                <div className="relative" ref={langRef}>
                    <button
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                    >
                        <span className="text-lg leading-none">{currentLang.flag}</span>
                        <span className="text-sm font-medium hidden sm:block text-slate-700">{currentLang.name}</span>
                        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", isLangOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {isLangOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-100 bg-white p-1 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 origin-top-right z-50"
                            >
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setLanguage(lang.code as any);
                                            setIsLangOpen(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all",
                                            language === lang.code
                                                ? "bg-slate-50 text-slate-900 font-medium"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        )}
                                    >
                                        <span className="text-lg leading-none">{lang.flag}</span>
                                        <span className="flex-1 text-left">{lang.name}</span>
                                        {language === lang.code && <Check className="w-4 h-4 text-slate-700" />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Notifications */}
                <button className="relative p-2.5 rounded-full hover:bg-slate-50 transition-colors text-slate-600 hover:text-slate-900 border border-transparent hover:border-slate-200">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
                </button>

                {/* Profile Avatar */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2"
                    >
                        <div className="w-9 h-9 rounded-full bg-[#E37400] text-white flex items-center justify-center text-sm font-medium shadow-sm ring-2 ring-white overflow-hidden uppercase">
                            {user?.first_name?.[0] || user?.username?.[0] || "U"}
                        </div>
                        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", isProfileOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 origin-top-right z-50 flex flex-col"
                            >
                                <div className="px-3 py-2.5 mb-1.5 border-b border-slate-100">
                                    <p className="text-sm font-semibold text-slate-900 leading-none mb-1.5">
                                        {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.username || "Authorized User"}
                                    </p>
                                    <p className="text-xs text-slate-500 leading-none">{user?.email || "No email provided"}</p>
                                </div>
                                <div className="px-1 flex flex-col gap-0.5">
                                    <button className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors">
                                        <User className="w-4 h-4" />
                                        {t('profile')}
                                    </button>
                                    <button className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors">
                                        <Settings className="w-4 h-4" />
                                        {t('settings')}
                                    </button>
                                    <div className="h-px bg-slate-100 my-1 mx-1 line-separator"></div>
                                    <button className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-lg hover:bg-rose-50 text-rose-600 transition-colors group">
                                        <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                        {t('logout')}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
