import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from "framer-motion"
import { Search, Home as HomeIcon, Settings, LogOut, Brain, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react"
import { apiService } from "../../services/api"
import type { User } from "../../types"

export function Home() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) return;

            try {
                const userData = await apiService.fetchUser(token);
                const refinedData = typeof userData === 'string' ? { username: userData, email: "" } : userData;
                setUser(refinedData);
                localStorage.setItem("user", JSON.stringify(refinedData));
            } catch (err) {
                console.error("Failed to fetch user:", err);
                if ((err as Error).message.includes("401")) handleLogout();
            }
        };

        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("token_type");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleChat = async () => {
        if (!inputValue.trim() || isStreaming) return;

        const userMsg = inputValue.trim();
        const newMessages = [...messages, { role: 'user' as const, content: userMsg }];
        setMessages(newMessages);
        setInputValue("");
        setIsStreaming(true);
        setIsRightSidebarOpen(true);
        setIsSidebarCollapsed(false);

        const token = localStorage.getItem("access_token");
        if (!token) return;

        try {
            const response = await apiService.chat(token, userMsg);
            const reader = response.body?.getReader();
            if (!reader) throw new Error("No response stream");

            setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

            let assistantContent = "";
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith("data: ")) {
                        const jsonStr = trimmedLine.replace("data: ", "").trim();
                        if (jsonStr === "[DONE]") continue;

                        try {
                            const data = JSON.parse(jsonStr);
                            if (data.type === "content") {
                                assistantContent += data.content;
                                setMessages(prev => {
                                    const latest = [...prev];
                                    const lastMsg = latest[latest.length - 1];
                                    if (lastMsg && lastMsg.role === "assistant") {
                                        lastMsg.content = assistantContent;
                                    }
                                    return latest;
                                });
                            }
                        } catch (e) { }
                    }
                }
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an issue. Let's try again." }]);
        } finally {
            setIsStreaming(false);
        }
    };

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ password: "", new_password: "" });
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess(false);
        setIsPasswordLoading(true);

        const token = localStorage.getItem("access_token");
        if (!token) return;

        try {
            const response = await apiService.changePassword(token, passwordData);
            if (response.status === 204) {
                setPasswordSuccess(true);
                setPasswordData({ password: "", new_password: "" });
                setTimeout(() => {
                    setIsPasswordModalOpen(false);
                    setPasswordSuccess(false);
                }, 2000);
            } else {
                const data = await response.json();
                setPasswordError(data.detail?.[0]?.msg || "Failed to change password.");
            }
        } catch (err) {
            setPasswordError("An error occurred. Please try again later.");
        } finally {
            setIsPasswordLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-white text-[#202124] font-sans overflow-hidden">
            <header className="absolute top-0 w-full h-16 flex items-center justify-between px-4 lg:px-6 pointer-events-none z-[40]">
                <div className="flex items-center gap-2 pointer-events-auto opacity-0 invisible" />
                <div className="flex items-center gap-4 pointer-events-auto mt-2">
                    <div
                        onClick={() => setIsProfilePopupOpen(!isProfilePopupOpen)}
                        className="w-8 h-8 rounded-full bg-[#E37400] text-white flex items-center justify-center font-medium shadow-sm cursor-pointer uppercase shadow-orange-200 transition-transform active:scale-95"
                    >
                        {user?.first_name?.[0] || user?.username?.[0] || "U"}
                    </div>
                </div>
            </header>

            <aside className={`relative ${isSidebarCollapsed ? 'w-[72px]' : 'w-[280px]'} h-full flex-shrink-0 flex flex-col py-3 pt-6 z-30 bg-white border-r border-[#dadce0] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute -right-3 top-8 w-6 h-6 bg-white border border-[#dadce0] rounded-full flex items-center justify-center text-[#5f6368] hover:text-[#1a73e8] hover:border-[#1a73e8] shadow-sm transition-all z-40 group"
                >
                    {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                <div className={`px-6 mb-10 h-8 flex items-center gap-2 overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                    <span className="text-[#202124] text-xl tracking-tight font-semibold whitespace-nowrap">Arthik Global</span>
                </div>

                <nav className="flex flex-col gap-1 px-3 overflow-hidden">
                    <button className="flex items-center gap-4 px-6 py-3 transition-all duration-200 group text-[#1a73e8]">
                        <HomeIcon className="w-5 h-5 flex-shrink-0 text-[#1a73e8]" />
                        {!isSidebarCollapsed && <span className="text-[14px] font-medium whitespace-nowrap font-semibold">Home</span>}
                    </button>
                    <button onClick={() => navigate("/preferences")} className="flex items-center gap-4 px-6 py-3 transition-all duration-200 group text-[#5f6368] hover:text-[#202124]">
                        <Settings className="w-5 h-5 flex-shrink-0 group-hover:text-[#202124]" />
                        {!isSidebarCollapsed && <span className="text-[14px] font-medium whitespace-nowrap">Preferences</span>}
                    </button>
                    <div className="my-4 mx-2 h-px bg-[#f1f3f4]" />
                    <button onClick={handleLogout} className="flex items-center gap-4 px-6 py-3 transition-all duration-200 text-[#5f6368] hover:text-rose-600 group">
                        <LogOut className="w-5 h-5 flex-shrink-0 group-hover:text-rose-600" />
                        {!isSidebarCollapsed && <span className="text-[14px] font-medium whitespace-nowrap">Logout</span>}
                    </button>
                </nav>
            </aside>

            <main className="flex-1 flex overflow-hidden mt-16 z-0 relative">
                <div className="flex-1 flex flex-col relative transition-all duration-300">
                    <div className="flex-1 overflow-y-auto pb-32 pt-4 scrollbar-hide">
                        <div className="max-w-[720px] mx-auto px-6 w-full h-full">
                            <div className="w-full h-full flex flex-col items-center">
                                <AnimatePresence mode="wait">
                                    {messages.length === 0 ? (
                                        <motion.div
                                            key="landing"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="w-full flex flex-col items-center mt-12"
                                        >
                                            <div className="w-[104px] h-[104px] rounded-full bg-[#E37400] text-white flex items-center justify-center text-[44px] mb-3 uppercase shadow-lg">
                                                {user?.first_name?.[0] || user?.username?.[0] || "U"}
                                            </div>
                                            <h1 className="text-[32px] font-normal mb-1 text-[#202124]">
                                                {user?.first_name ? `Hey, ${user.first_name}!` : "Welcome back"}
                                            </h1>
                                            <p className="text-[#5f6368] text-[16px]">How can I help you today?</p>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full flex flex-col gap-8 py-4">
                                            {messages.map((msg, idx) => (
                                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                                                    <div className={`flex items-start gap-4 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                                        <div className={`w-8 h-8 rounded-full flex flex-center items-center justify-center text-xs ${msg.role === 'user' ? 'bg-[#1a73e8] text-white' : 'bg-slate-50 border border-[#dadce0]'}`}>
                                                            {msg.role === 'user' ? (user?.first_name?.[0] || 'U') : <Brain className="w-4 h-4 text-[#1a73e8]" />}
                                                        </div>
                                                        <div className={`rounded-3xl px-5 py-3 text-[15px] shadow-sm ${msg.role === 'user' ? 'bg-[#1a73e8] text-white rounded-tr-none' : 'bg-white text-[#202124] rounded-tl-none border border-[#dadce0]'}`}>
                                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        animate={messages.length > 0 ? { bottom: 32, top: "auto", y: 0 } : { top: "45%", bottom: "auto", y: "-50%" }}
                        className="absolute left-0 right-0 px-6 z-20"
                    >
                        <div className="max-w-[720px] w-full mx-auto">
                            <div className="relative group bg-[#f1f3f4] rounded-[24px] hover:bg-[#e8eaed] focus-within:bg-white focus-within:shadow-xl focus-within:border-[#dadce0] border border-transparent flex items-center">
                                <Search className="w-[18px] h-[18px] ml-4 text-[#5f6368]" />
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleChat()}
                                    placeholder="Message AI Agent..."
                                    className="flex-1 bg-transparent py-4 px-4 outline-none text-[16px]"
                                />
                                <button onClick={handleChat} disabled={!inputValue.trim() || isStreaming} className="mr-2 w-10 h-10 bg-[#1a73e8] rounded-full flex items-center justify-center text-white disabled:opacity-0 transition-opacity">
                                    <ArrowUp className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <aside className={`h-full bg-slate-50 border-l border-[#dadce0] transition-all duration-700 overflow-hidden flex flex-col ${isRightSidebarOpen ? 'w-[320px] lg:w-[400px]' : 'w-0'}`}>
                    <div className="h-14 flex items-center justify-between px-6 bg-white border-b">
                        <h2 className="text-sm font-bold text-[#1a73e8] overflow-hidden whitespace-nowrap uppercase tracking-widest">Process</h2>
                        <button onClick={() => setIsRightSidebarOpen(false)} className="p-1 rounded-full hover:bg-slate-100 text-[#5f6368] flex-shrink-0"><LogOut className="w-4 h-4 rotate-180" /></button>
                    </div>
                    {/* Activity logic could also be extracted to a shared component */}
                </aside>
            </main>

            {isProfilePopupOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-end p-4 pt-16" onClick={() => setIsProfilePopupOpen(false)}>
                    <div className="w-[360px] bg-white rounded-[28px] shadow-2xl border p-6 mt-2 mr-2" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-[#E37400] text-white flex items-center justify-center text-3xl mb-4">{user?.first_name?.[0] || "U"}</div>
                            <h3 className="text-xl font-medium">{user?.first_name} {user?.last_name}</h3>
                            <p className="text-sm text-[#5f6368] mb-6">{user?.email}</p>
                            <div className="w-full space-y-3 mb-8">
                                <button onClick={() => { navigate("/preferences"); setIsProfilePopupOpen(false); }} className="w-full py-2.5 rounded-full border text-sm font-medium hover:bg-slate-50">Preferences</button>
                                <button onClick={() => { setIsPasswordModalOpen(true); setIsProfilePopupOpen(false); }} className="w-full py-2.5 rounded-full bg-[#1a73e8] text-white text-sm font-medium shadow-md">Change Password</button>
                            </div>
                            <button onClick={handleLogout} className="text-xs text-[#5f6368] hover:underline">Sign out</button>
                        </div>
                    </div>
                </div>
            )}

            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setIsPasswordModalOpen(false)}>
                    <div className="w-full max-w-md bg-white rounded-[28px] p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-medium mb-6">Change Password</h2>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <input type="password" required value={passwordData.password} onChange={e => setPasswordData({ ...passwordData, password: e.target.value })} className="w-full bg-[#f8f9fa] border rounded-xl px-4 py-3 outline-none" placeholder="Current Password" />
                            <input type="password" required minLength={6} value={passwordData.new_password} onChange={e => setPasswordData({ ...passwordData, new_password: e.target.value })} className="w-full bg-[#f8f9fa] border rounded-xl px-4 py-3 outline-none" placeholder="New Password" />
                            {passwordError && <div className="text-rose-600 text-xs">{passwordError}</div>}
                            {passwordSuccess && <div className="text-emerald-600 text-xs">Password updated!</div>}
                            <div className="pt-4 flex flex-col gap-2">
                                <button type="submit" disabled={isPasswordLoading} className="w-full bg-[#1a73e8] text-white py-3 rounded-full font-medium">{isPasswordLoading ? "Updating..." : "Update Password"}</button>
                                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="w-full py-3 text-[#5f6368]">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
