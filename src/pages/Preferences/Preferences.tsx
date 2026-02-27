import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Home as HomeIcon, Settings, LogOut, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import type { User } from "../../types"

export function Preferences() {
    const navigate = useNavigate();
    const [user] = useState<User | null>(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);

    const [prefs, setPrefs] = useState({
        location: "",
        budget_min: "",
        budget_max: "",
        rating_min: "0",
        facilities: [] as string[],
        checkin: "",
        checkout: "",
        lang: "en"
    });

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            navigate("/login");
            return;
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token_type");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="flex h-screen w-full bg-white text-[#202124] font-sans overflow-hidden">
            <aside className={`relative ${isSidebarCollapsed ? 'w-[72px]' : 'w-[280px]'} h-full flex-shrink-0 flex flex-col py-3 pt-6 z-30 bg-white border-r border-[#dadce0] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
                <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute -right-3 top-8 w-6 h-6 bg-white border border-[#dadce0] rounded-full flex items-center justify-center text-[#5f6368] hover:text-[#1a73e8] shadow-sm z-40 group">
                    {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
                <div className={`px-6 mb-10 h-8 flex items-center gap-2 overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                    <span className="text-[#202124] text-xl tracking-tight font-semibold whitespace-nowrap">Arthik Global</span>
                </div>
                <nav className="flex flex-col gap-1 px-3 overflow-hidden">
                    <button onClick={() => navigate("/home")} className="flex items-center gap-4 px-6 py-3 transition-all duration-200 group text-[#5f6368] hover:text-[#202124]">
                        <HomeIcon className="w-5 h-5 flex-shrink-0 group-hover:text-[#202124]" />
                        {!isSidebarCollapsed && <span className="text-[14px] font-medium whitespace-nowrap">Home</span>}
                    </button>
                    <button className="flex items-center gap-4 px-6 py-3 transition-all duration-200 group text-[#1a73e8]">
                        <Settings className="w-5 h-5 flex-shrink-0 text-[#1a73e8]" />
                        {!isSidebarCollapsed && <span className="text-[14px] font-medium whitespace-nowrap font-semibold">Preferences</span>}
                    </button>
                    <div className="my-4 mx-2 h-px bg-[#f1f3f4]" />
                    <button onClick={handleLogout} className="flex items-center gap-4 px-6 py-3 transition-all duration-200 text-[#5f6368] hover:text-rose-600 group">
                        <LogOut className="w-5 h-5 flex-shrink-0 group-hover:text-rose-600" />
                        {!isSidebarCollapsed && <span className="text-[14px] font-medium whitespace-nowrap">Logout</span>}
                    </button>
                </nav>
            </aside>

            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="h-16 flex items-center justify-end px-6 border-b border-[#dadce0] bg-white sticky top-0 z-20">
                    <div onClick={() => setIsProfilePopupOpen(!isProfilePopupOpen)} className="w-8 h-8 rounded-full bg-[#E37400] text-white flex items-center justify-center font-medium shadow-sm cursor-pointer uppercase shadow-orange-200 transition-transform active:scale-95">
                        {user?.first_name?.[0] || user?.username?.[0] || "U"}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto pb-20 pt-8 scrollbar-hide">
                    {isProfilePopupOpen && (
                        <div className="fixed inset-0 z-[100] flex items-start justify-end p-4 pt-16" onClick={() => setIsProfilePopupOpen(false)}>
                            <div className="w-[360px] bg-white rounded-[28px] shadow-2xl border p-6 mt-2 mr-2" onClick={e => e.stopPropagation()}>
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full bg-[#E37400] text-white flex items-center justify-center text-3xl mb-4 uppercase">{user?.first_name?.[0] || "U"}</div>
                                    <h3 className="text-xl font-medium">{user?.first_name} {user?.last_name}</h3>
                                    <p className="text-[#5f6368] text-sm mb-6">{user?.email}</p>
                                    <div className="w-full space-y-3 mb-8">
                                        <button onClick={() => { navigate("/preferences"); setIsProfilePopupOpen(false); }} className="w-full py-2.5 rounded-full border text-sm font-medium hover:bg-slate-50">Preferences</button>
                                    </div>
                                    <button onClick={handleLogout} className="text-[#5f6368] text-xs hover:underline">Sign out</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="max-w-3xl mx-auto px-6 w-full">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-[28px] font-normal text-[#202124]">Travel Preferences</h2>
                            <button
                                className="px-6 py-2.5 bg-[#1a73e8] text-white rounded-full text-sm font-medium hover:bg-[#1557b0] shadow-md active:scale-95"
                                onClick={() => {
                                    const btn = document.getElementById('save-pref-btn');
                                    if (btn) btn.innerText = "Saving...";
                                    setTimeout(() => { if (btn) btn.innerText = "Saved!"; setTimeout(() => { if (btn) btn.innerText = "Save Preferences"; }, 2000); }, 800);
                                }}
                                id="save-pref-btn"
                            >
                                Save Preferences
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                            <div className="md:col-span-2 flex flex-col border border-[#dadce0] rounded-xl p-5 bg-white shadow-sm hover:border-[#1a73e8] transition-all">
                                <label className="text-[12px] font-bold text-[#5f6368] mb-2 uppercase tracking-wider flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#1a73e8]" /> Location</label>
                                <input type="text" value={prefs.location} onChange={(e) => setPrefs({ ...prefs, location: e.target.value })} placeholder="e.g. Paris, France" className="w-full bg-[#f8f9fa] border-none rounded-lg px-4 py-2.5 text-[15px] outline-none" />
                            </div>
                            <div className="flex flex-col border rounded-xl p-5 bg-white shadow-sm hover:border-[#1a73e8] transition-all">
                                <label className="text-[12px] font-bold text-[#5f6368] mb-2 uppercase tracking-wider">Min Budget ($)</label>
                                <input type="number" value={prefs.budget_min} onChange={(e) => setPrefs({ ...prefs, budget_min: e.target.value })} placeholder="0" className="w-full bg-[#f8f9fa] border-none rounded-lg px-4 py-2.5 text-[15px] outline-none" />
                            </div>
                            <div className="flex flex-col border rounded-xl p-5 bg-white shadow-sm hover:border-[#1a73e8] transition-all">
                                <label className="text-[12px] font-bold text-[#5f6368] mb-2 uppercase tracking-wider">Max Budget ($)</label>
                                <input type="number" value={prefs.budget_max} onChange={(e) => setPrefs({ ...prefs, budget_max: e.target.value })} placeholder="1,000,000" className="w-full bg-[#f8f9fa] border-none rounded-lg px-4 py-2.5 text-[15px] outline-none" />
                            </div>
                            <div className="flex flex-col border rounded-xl p-5 bg-white shadow-sm hover:border-[#1a73e8] transition-all">
                                <label className="text-[12px] font-bold text-[#5f6368] mb-2 uppercase tracking-wider">Min Rating (Stars)</label>
                                <select value={prefs.rating_min} onChange={(e) => setPrefs({ ...prefs, rating_min: e.target.value })} className="w-full bg-[#f8f9fa] border-none rounded-lg px-4 py-2.5 text-[15px] outline-none appearance-none">
                                    <option value="0">Any rating</option>
                                    <option value="3">3+ Stars</option>
                                    <option value="4">4+ Stars</option>
                                    <option value="4.5">4.5+ Stars</option>
                                </select>
                            </div>
                            <div className="flex flex-col border rounded-xl p-5 bg-white shadow-sm hover:border-[#1a73e8] transition-all">
                                <label className="text-[12px] font-bold text-[#5f6368] mb-2 uppercase tracking-wider">Language</label>
                                <input type="text" value={prefs.lang} onChange={(e) => setPrefs({ ...prefs, lang: e.target.value })} placeholder="en" className="w-full bg-[#f8f9fa] border-none rounded-lg px-4 py-2.5 text-[15px] outline-none" />
                            </div>
                            <div className="md:col-span-2 flex flex-col border rounded-xl p-5 bg-white shadow-sm hover:border-[#1a73e8] transition-all">
                                <label className="text-[12px] font-bold text-[#5f6368] mb-2 uppercase tracking-wider">Facilities (WiFi, Pool, Gym...)</label>
                                <input type="text" value={prefs.facilities.join(", ")} onChange={(e) => setPrefs({ ...prefs, facilities: e.target.value.split(",").map(s => s.trim()) })} placeholder="Comma separated facilities" className="w-full bg-[#f8f9fa] border-none rounded-lg px-4 py-2.5 text-[15px] outline-none" />
                            </div>
                            <div className="flex flex-col border rounded-xl p-5 bg-white shadow-sm hover:border-[#1a73e8] transition-all">
                                <label className="text-[12px] font-bold text-[#5f6368] mb-2 uppercase tracking-wider">Check-in Date</label>
                                <input type="date" value={prefs.checkin} onChange={(e) => setPrefs({ ...prefs, checkin: e.target.value })} className="w-full bg-[#f8f9fa] border-none rounded-lg px-4 py-2.5 text-[15px] outline-none" />
                            </div>
                            <div className="flex flex-col border rounded-xl p-5 bg-white shadow-sm hover:border-[#1a73e8] transition-all">
                                <label className="text-[12px] font-bold text-[#5f6368] mb-2 uppercase tracking-wider">Check-out Date</label>
                                <input type="date" value={prefs.checkout} onChange={(e) => setPrefs({ ...prefs, checkout: e.target.value })} className="w-full bg-[#f8f9fa] border-none rounded-lg px-4 py-2.5 text-[15px] outline-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
