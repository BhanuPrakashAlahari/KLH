import { useState } from "react"
import { Search, Home as HomeIcon, Camera, Settings, LogOut, MapPin, DollarSign, Star, Calendar, Globe, Coffee } from "lucide-react"

export function Home() {
    const [activeTab, setActiveTab] = useState("Home");

    // Manage preferences state for the interactive buttons
    const [prefs, setPrefs] = useState({
        location: "",
        budget_min: "",
        budget_max: "",
        rating_min: "",
        facilities: [] as string[],
        checkin: "",
        checkout: "",
        lang: "en"
    });

    return (
        <div className="flex h-screen w-full bg-white text-[#202124] font-sans overflow-hidden">
            {/* Top header navigation (Google style header) */}
            <header className="absolute top-0 w-full h-16 flex items-center justify-between px-4 lg:px-6 pointer-events-none">
                <div className="flex items-center gap-2"></div>
                <div className="flex items-center gap-4 pointer-events-auto mt-2">
                    <div className="w-8 h-8 rounded-full bg-[#E37400] text-white flex items-center justify-center font-medium shadow-sm cursor-pointer">
                        S
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside className="w-[280px] flex-shrink-0 flex flex-col py-3 pt-6 lg:pl-4 z-10 bg-white border-r border-[#dadce0] lg:border-none">
                <div className="px-6 mb-8 flex items-center gap-2 pointer-events-auto">
                    <span className="text-[#202124] text-xl tracking-[0.02em] font-medium">Arthik Global</span>
                </div>
                <nav className="flex flex-col gap-1 pr-4">
                    <button
                        onClick={() => setActiveTab("Home")}
                        className={`flex items-center gap-4 px-6 py-3.5 rounded-r-full transition-colors ${activeTab === "Home" ? "bg-[#e8f0fe] text-[#1a73e8]" : "text-[#3c4043] hover:bg-[#f1f3f4]"}`}
                    >
                        <HomeIcon className={`w-5 h-5 ${activeTab === "Home" ? "text-[#1a73e8]" : "text-[#5f6368]"}`} />
                        <span className="text-sm font-medium">Home</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("Preferences")}
                        className={`flex items-center gap-4 px-6 py-3.5 rounded-r-full transition-colors ${activeTab === "Preferences" ? "bg-[#e8f0fe] text-[#1a73e8]" : "text-[#3c4043] hover:bg-[#f1f3f4]"}`}
                    >
                        <Settings className={`w-5 h-5 ${activeTab === "Preferences" ? "text-[#1a73e8]" : "text-[#5f6368]"}`} />
                        <span className="text-sm font-medium">Preferences</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("Logout")}
                        className={`flex items-center gap-4 px-6 py-3.5 rounded-r-full transition-colors ${activeTab === "Logout" ? "bg-[#e8f0fe] text-[#1a73e8]" : "text-[#3c4043] hover:bg-[#f1f3f4]"}`}
                    >
                        <LogOut className={`w-5 h-5 ${activeTab === "Logout" ? "text-[#1a73e8]" : "text-[#5f6368]"}`} />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto mt-16 pb-12 z-0">
                <div className="max-w-[720px] mx-auto px-6 flex flex-col items-center">
                    {activeTab === "Home" && (
                        <>
                            <div className="relative group mb-3 mt-6">
                                <div className="w-[104px] h-[104px] rounded-full bg-[#E37400] text-white flex items-center justify-center text-[44px] font-normal tracking-tight shadow-sm">
                                    S
                                </div>
                                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.3)] text-[#5f6368] hover:bg-[#f1f3f4] border border-[#dadce0] transition-colors">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <h1 className="text-[28px] font-normal mb-1 tracking-normal font-sans text-[#202124]">Seetharam Damarla</h1>
                            <p className="text-[#5f6368] text-[15px] mb-12">seetharamdamarla06@gmail.com</p>

                            <div className="w-full relative mb-8">
                                <div className="absolute inset-y-0 left-0 pl-[18px] flex items-center pointer-events-none">
                                    <Search className="w-[18px] h-[18px] text-[#5f6368]" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Chat with AI Agent (e.g., 'I want a hotel with pool under $200')"
                                    className="w-full bg-[#f1f3f4] text-[#202124] rounded-[24px] py-[13px] pl-12 pr-6 border border-transparent focus:bg-white focus:border-[#dadce0] focus:shadow-[0_1px_2px_0_rgba(60,64,67,0.30),_0_1px_3px_1px_rgba(60,64,67,0.15)] focus:outline-none transition-shadow placeholder:text-[#5f6368] hover:bg-[#e8eaed]"
                                />
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-[10px] w-full max-w-[600px]">
                                {["Search Hotels", "Match Preferences", "Vendor Sync", "PayU Bookings", "PDF Receipts"].map(pill => (
                                    <button key={pill} className="px-5 py-2 rounded-full border border-[#dadce0] text-[14px] font-medium text-[#3c4043] hover:bg-[#f8f9fa] transition-colors">
                                        {pill}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-20 w-full text-center max-w-[500px] mb-8">
                                <p className="text-[#5f6368] text-xs leading-5">
                                    The AI agent automatically negotiates with registered vendors in real-time. It accurately checks your preferences, ranks top available hotels, and books seamlessly using PayU with automated PDF receipts. <a href="#" className="text-[#1a73e8] hover:underline">Learn more</a>
                                </p>
                            </div>
                        </>
                    )}

                    {activeTab === "Preferences" && (
                        <div className="w-full max-w-4xl mt-6">
                            <h2 className="text-[28px] font-normal mb-8 text-[#202124]">Preferences</h2>
                            <div className="bg-white border border-[#dadce0] rounded-[8px] p-6 shadow-sm mb-12">
                                <div className="space-y-8">
                                    {/* Location */}
                                    <div className="flex flex-col border border-[#dadce0] rounded-md p-4">
                                        <h3 className="text-[14px] font-medium text-[#202124] mb-3 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-[#5f6368]" />
                                            Where are you traveling? (location)
                                        </h3>
                                        <input
                                            type="text"
                                            value={prefs.location}
                                            onChange={(e) => setPrefs({ ...prefs, location: e.target.value })}
                                            placeholder="Enter destination (e.g. New York, Paris)"
                                            className="w-full sm:w-1/2 bg-white border border-[#dadce0] rounded-[4px] px-3 py-2 text-[#202124] text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Budget Min */}
                                        <div className="flex flex-col border border-[#dadce0] rounded-md p-4">
                                            <h3 className="text-[14px] font-medium text-[#202124] mb-3 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-[#5f6368]" />
                                                Minimum Budget (budget_min)
                                            </h3>
                                            <select
                                                value={prefs.budget_min}
                                                onChange={(e) => setPrefs({ ...prefs, budget_min: e.target.value })}
                                                className="w-full bg-white border border-[#dadce0] rounded-[4px] px-3 py-2 text-[#202124] text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                                            >
                                                <option value="">Select minimum...</option>
                                                <option value="0">0 ($)</option>
                                                <option value="50">50 ($)</option>
                                                <option value="100">100 ($)</option>
                                                <option value="200">200 ($)</option>
                                                <option value="500">500 ($)</option>
                                            </select>
                                        </div>

                                        {/* Budget Max */}
                                        <div className="flex flex-col border border-[#dadce0] rounded-md p-4">
                                            <h3 className="text-[14px] font-medium text-[#202124] mb-3 flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-[#5f6368]" />
                                                Maximum Budget (budget_max)
                                            </h3>
                                            <select
                                                value={prefs.budget_max}
                                                onChange={(e) => setPrefs({ ...prefs, budget_max: e.target.value })}
                                                className="w-full bg-white border border-[#dadce0] rounded-[4px] px-3 py-2 text-[#202124] text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                                            >
                                                <option value="">Select maximum...</option>
                                                <option value="100">100 ($)</option>
                                                <option value="250">250 ($)</option>
                                                <option value="500">500 ($)</option>
                                                <option value="1000">1,000 ($)</option>
                                                <option value="1000000">1,000,000 (No Limit)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    <div className="flex flex-col border border-[#dadce0] rounded-md p-4">
                                        <h3 className="text-[14px] font-medium text-[#202124] mb-3 flex items-center gap-2">
                                            <Star className="w-4 h-4 text-[#5f6368]" />
                                            Minimum Rating (rating_min)
                                        </h3>
                                        <select
                                            value={prefs.rating_min}
                                            onChange={(e) => setPrefs({ ...prefs, rating_min: e.target.value })}
                                            className="w-full sm:w-1/2 bg-white border border-[#dadce0] rounded-[4px] px-3 py-2 text-[#202124] text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                                        >
                                            <option value="">Select rating...</option>
                                            <option value="0">Any Rating (0+)</option>
                                            <option value="3">3+ Stars</option>
                                            <option value="4">4+ Stars</option>
                                            <option value="5">5 Stars</option>
                                        </select>
                                    </div>

                                    {/* Facilities (Select dropdown) */}
                                    <div className="flex flex-col border border-[#dadce0] rounded-md p-4">
                                        <h3 className="text-[14px] font-medium text-[#202124] mb-3 flex items-center gap-2">
                                            <Coffee className="w-4 h-4 text-[#5f6368]" />
                                            Facilities (facilities)
                                        </h3>
                                        <select
                                            onChange={(e) => setPrefs({ ...prefs, facilities: [e.target.value] })}
                                            className="w-full sm:w-1/2 bg-white border border-[#dadce0] rounded-[4px] px-3 py-2 text-[#202124] text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                                        >
                                            <option value="">Select main facility requirement...</option>
                                            <option value="pool">Pool</option>
                                            <option value="gym">Gym</option>
                                            <option value="spa">Spa</option>
                                            <option value="wifi">Free WiFi</option>
                                            <option value="parking">Parking</option>
                                            <option value="restaurant">Restaurant</option>
                                            <option value="beach">Beach Access</option>
                                            <option value="pets">Pet Friendly</option>
                                        </select>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="flex flex-col border border-[#dadce0] rounded-md p-4">
                                            <h3 className="text-[14px] font-medium text-[#202124] mb-3 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-[#5f6368]" />
                                                Check-in Date (checkin)
                                            </h3>
                                            <input
                                                type="date"
                                                value={prefs.checkin}
                                                onChange={(e) => setPrefs({ ...prefs, checkin: e.target.value })}
                                                className="w-full bg-white border border-[#dadce0] rounded-[4px] px-3 py-2 text-[#202124] text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                                            />
                                        </div>
                                        <div className="flex flex-col border border-[#dadce0] rounded-md p-4">
                                            <h3 className="text-[14px] font-medium text-[#202124] mb-3 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-[#5f6368]" />
                                                Check-out Date (checkout)
                                            </h3>
                                            <input
                                                type="date"
                                                value={prefs.checkout}
                                                onChange={(e) => setPrefs({ ...prefs, checkout: e.target.value })}
                                                className="w-full bg-white border border-[#dadce0] rounded-[4px] px-3 py-2 text-[#202124] text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                                            />
                                        </div>
                                    </div>

                                    {/* Language */}
                                    <div className="flex flex-col border border-[#dadce0] rounded-md p-4">
                                        <h3 className="text-[14px] font-medium text-[#202124] mb-3 flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-[#5f6368]" />
                                            Language (lang)
                                        </h3>
                                        <select
                                            value={prefs.lang}
                                            onChange={(e) => setPrefs({ ...prefs, lang: e.target.value })}
                                            className="w-full sm:w-1/2 bg-white border border-[#dadce0] rounded-[4px] px-3 py-2 text-[#202124] text-sm focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                            <option value="de">German</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "Logout" && (
                        <div className="w-full max-w-md mt-16 flex flex-col items-center justify-center text-center">
                            <h2 className="text-[28px] font-normal mb-4 text-[#202124]">You are signing out</h2>
                            <p className="text-[#5f6368] mb-8">Are you sure you want to log out of your Arthik Global account?</p>
                            <button className="px-6 py-2 bg-[#1a73e8] text-white rounded-md font-medium shadow-sm hover:bg-[#1557b0] transition-colors">
                                Confirm Logout
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
