import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from "framer-motion"
import { Search as SearchIcon, Home as HomeIcon, Settings, LogOut, Brain, ArrowUp, ChevronLeft, ChevronRight, Loader2, Database, Terminal, Check, Calendar } from "lucide-react"
import { apiService } from "../../services/api"
import type { User } from "../../types"
import {
    Stepper,
    StepperIndicator,
    StepperItem,
    StepperNav,
    StepperTitle,
    StepperTrigger,
    StepperSeparator
} from "../../components/ui/stepper"

interface FlowItem {
    id: string;
    type: string;
    detail: string;
    status: 'active' | 'done';
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    flows: FlowItem[];
}

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

    const [messages, setMessages] = useState<Message[]>([]);
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
        const currentMessages: Message[] = [...messages, { role: 'user', content: userMsg, flows: [] }];
        setMessages([...currentMessages, { role: 'assistant', content: "", flows: [] }]);
        setInputValue("");
        setIsStreaming(true);

        const token = localStorage.getItem("access_token");
        if (!token) return;

        try {
            const response = await apiService.chat(token, userMsg);
            const reader = response.body?.getReader();
            if (!reader) throw new Error("No response stream");

            const decoder = new TextDecoder();
            let accumulatedBuffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                accumulatedBuffer += decoder.decode(value, { stream: true });

                const blocks = accumulatedBuffer.split(/(?=data: )/);
                accumulatedBuffer = "";

                for (let i = 0; i < blocks.length; i++) {
                    const block = blocks[i].trim();
                    if (!block.startsWith("data: ")) {
                        accumulatedBuffer += block;
                        continue;
                    }

                    if (!block.includes("}") && !block.includes("[DONE]")) {
                        accumulatedBuffer = block;
                        continue;
                    }

                    const jsonStr = block.replace("data: ", "").trim();
                    if (jsonStr === "[DONE]") {
                        setIsStreaming(false);
                        continue;
                    }

                    try {
                        const data = JSON.parse(jsonStr);

                        setMessages(prev => {
                            const latest = [...prev];
                            const lastIdx = latest.length - 1;
                            if (lastIdx < 0) return prev;

                            const lastMsg = { ...latest[lastIdx] };
                            if (lastMsg.role !== "assistant") return prev;

                            if (data.type === "content") {
                                lastMsg.content = (lastMsg.content || "") + (data.content || "");
                            } else if (data.type === "payment_initiation") {
                                // 1. Signal the redirect in the UI
                                lastMsg.content = (lastMsg.content || "") + "\n\n**Booking initiated! Redirecting to secure payment...**";
                                setIsStreaming(false);

                                // 2. Handle the PayU Redirect
                                const { payu_payload } = data;
                                if (payu_payload) {
                                    setTimeout(() => {
                                        const form = document.createElement("form");
                                        form.method = "POST";
                                        form.action = "https://test.payu.in/_payment";

                                        Object.keys(payu_payload).forEach(key => {
                                            const hiddenField = document.createElement("input");
                                            hiddenField.type = "hidden";
                                            hiddenField.name = key;
                                            hiddenField.value = payu_payload[key];
                                            form.appendChild(hiddenField);
                                        });

                                        document.body.appendChild(form);
                                        form.submit();
                                    }, 1500); // Slight delay for user to read the message
                                }
                            } else if (data.type === "end" || data.type === "chat_end") {
                                setIsStreaming(false);
                                // Mark all flows as done when conversation ends
                                lastMsg.flows = lastMsg.flows.map(f => ({ ...f, status: 'done' as const }));
                            } else if (data.type === "status") {
                                // Ignore
                            } else if (data.type === "chat_start") {
                                // Just visual start
                            } else {
                                // Handle other flow types
                                const newFlow: FlowItem = {
                                    id: Math.random().toString(36).substr(2, 9),
                                    type: data.type.replace(/_/g, ' '),
                                    detail: String(data.query || data.content || data.task || data.message || ""),
                                    status: 'active'
                                };

                                if (data.type === "search_results") {
                                    lastMsg.flows = lastMsg.flows.map(f =>
                                        f.type.toLowerCase().includes("search") ? { ...f, status: 'done' as const } : f
                                    );
                                } else {
                                    lastMsg.flows = [...lastMsg.flows.map(f => ({ ...f, status: 'done' as const })), newFlow];
                                }
                            }

                            latest[lastIdx] = lastMsg;
                            return latest;
                        });
                    } catch (e) {
                        accumulatedBuffer = block;
                    }
                }
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => {
                const latest = [...prev];
                const lastMsg = latest[latest.length - 1];
                const errorMessage = "I'm sorry, I encountered an issue. Please try again.";
                if (lastMsg && lastMsg.role === "assistant" && !lastMsg.content) {
                    lastMsg.content = errorMessage;
                } else {
                    latest.push({ role: 'assistant', content: errorMessage, flows: [] });
                }
                return latest;
            });
        } finally {
            setIsStreaming(false);
            setMessages(prev => {
                const latest = [...prev];
                const lastMsg = latest[latest.length - 1];
                if (lastMsg && lastMsg.role === "assistant" && lastMsg.flows.length > 0) {
                    lastMsg.flows.forEach(f => { if (f.status === 'active') f.status = 'done'; });
                }
                return latest;
            });
        }
    };

    const getFlowIcon = (type: string) => {
        const t = type.toLowerCase();
        if (t.includes('search')) return <SearchIcon className="w-3.5 h-3.5" />;
        if (t.includes('database')) return <Database className="w-3.5 h-3.5" />;
        if (t.includes('process')) return <Terminal className="w-3.5 h-3.5" />;
        return <Brain className="w-3.5 h-3.5" />;
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
            <header className="absolute top-0 w-full h-16 flex items-center justify-end px-6 z-[40]">
                <div
                    onClick={() => setIsProfilePopupOpen(!isProfilePopupOpen)}
                    className="w-9 h-9 rounded-full bg-[#E37400] text-white flex items-center justify-center font-bold shadow-md cursor-pointer uppercase border-2 border-white transition-transform active:scale-95"
                >
                    {user?.first_name?.[0] || user?.username?.[0] || "U"}
                </div>
            </header>

            <aside className={`relative ${isSidebarCollapsed ? 'w-20' : 'w-72'} h-full flex-shrink-0 flex flex-col py-6 bg-white border-r border-[#dadce0] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-30`}>
                <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute -right-3 top-10 w-6 h-6 bg-white border border-[#dadce0] rounded-full flex items-center justify-center text-[#5f6368] hover:text-[#1a73e8] shadow-sm z-40">
                    {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
                <div className={`px-8 mb-12 flex items-center gap-3 overflow-hidden transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="w-8 h-8 bg-[#1a73e8] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Brain className="text-white w-5 h-5" />
                    </div>
                    <span className="text-slate-900 text-xl font-bold tracking-tight whitespace-nowrap">Arthik AI</span>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-50 text-[#1a73e8] font-semibold">
                        <HomeIcon size={20} />
                        {!isSidebarCollapsed && <span className="text-sm">Home</span>}
                    </button>
                    <button onClick={() => navigate("/preferences")} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all">
                        <Settings size={20} />
                        {!isSidebarCollapsed && <span className="text-sm">Preferences</span>}
                    </button>
                    <button onClick={() => navigate("/bookings")} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all">
                        <Calendar size={20} />
                        {!isSidebarCollapsed && <span className="text-sm">Bookings</span>}
                    </button>
                    <div className="py-4 px-4">
                        <div className="h-px bg-slate-100" />
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all">
                        <LogOut size={20} />
                        {!isSidebarCollapsed && <span className="text-sm">Logout</span>}
                    </button>
                </nav>
            </aside>

            <main className="flex-1 flex flex-col relative overflow-hidden h-full mt-16">
                <div className="flex-1 overflow-y-auto pb-48 pt-4 scrollbar-hide">
                    <div className="max-w-[800px] mx-auto px-6 w-full">
                        <AnimatePresence mode="wait">
                            {messages.length === 0 ? (
                                <motion.div key="landing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                                    <h1 className="text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                                        {user?.first_name ? `Hey, ${user.first_name}!` : "Hello there!"}
                                    </h1>
                                    <p className="text-slate-500 text-xl max-w-lg leading-relaxed">
                                        How can I facilitate your travel journey today?
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="space-y-10">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`flex items-start gap-4 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-[#1a73e8] text-white' : 'bg-white border border-[#dadce0]'}`}>
                                                    {msg.role === 'user' ? (user?.first_name?.[0] || 'U') : <Brain size={20} className="text-[#1a73e8]" />}
                                                </div>
                                                <div className={`flex flex-col gap-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                                    <div className={`rounded-3xl px-6 py-4 text-[15px] shadow-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#1a73e8] text-white rounded-tr-none' : 'bg-white text-[#202124] rounded-tl-none border border-[#dadce0]'}`}>

                                                        {msg.role === 'assistant' && msg.flows.length > 0 && (
                                                            <div className="mb-6">
                                                                <Stepper
                                                                    orientation="vertical"
                                                                    defaultValue={msg.flows.length}
                                                                    indicators={{
                                                                        completed: <Check className="size-3" />,
                                                                        loading: <Loader2 className="size-3 animate-spin" />,
                                                                    }}
                                                                >
                                                                    <StepperNav>
                                                                        {msg.flows.map((flow, fidx) => (
                                                                            <StepperItem
                                                                                key={flow.id}
                                                                                step={fidx + 1}
                                                                                loading={flow.status === 'active'}
                                                                                completed={flow.status === 'done'}
                                                                                className="relative items-start not-last:flex-1"
                                                                            >
                                                                                <StepperTrigger className="items-start pb-4 last:pb-0 gap-3">
                                                                                    <StepperIndicator className="data-[state=completed]:bg-emerald-500 data-[state=completed]:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                                                                                        {fidx + 1}
                                                                                    </StepperIndicator>
                                                                                    <div className="mt-0.5 text-left">
                                                                                        <div className="flex items-center gap-2 mb-1">
                                                                                            <div className={`${flow.status === 'active' ? 'text-blue-600' : 'text-slate-400'}`}>
                                                                                                {getFlowIcon(flow.type)}
                                                                                            </div>
                                                                                            <StepperTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 data-[state=active]:text-blue-600 data-[state=completed]:text-emerald-600">
                                                                                                {flow.type}
                                                                                            </StepperTitle>
                                                                                        </div>
                                                                                        {flow.detail && <p className="text-[12px] text-slate-500 font-medium leading-tight">{flow.detail}</p>}
                                                                                    </div>
                                                                                </StepperTrigger>
                                                                                {fidx < msg.flows.length - 1 && (
                                                                                    <StepperSeparator className="absolute inset-y-0 top-6 left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=vertical]/stepper-nav:h-[calc(100%-1.5rem)] group-data-[state=completed]/step:bg-emerald-500" />
                                                                                )}
                                                                            </StepperItem>
                                                                        ))}
                                                                    </StepperNav>
                                                                </Stepper>
                                                            </div>
                                                        )}

                                                        <div className="prose prose-slate prose-sm max-w-none">
                                                            {msg.content ? (
                                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                            ) : (
                                                                isStreaming && idx === messages.length - 1 && msg.flows.length === 0 && (
                                                                    <span className="text-slate-500 animate-pulse font-bold tracking-wide italic">Thinking.....</span>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 pt-0 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none">
                    <div className="max-w-[720px] mx-auto w-full pointer-events-auto">
                        <div className="relative group bg-[#f1f3f4] rounded-[24px] hover:bg-[#e8eaed] focus-within:bg-white focus-within:shadow-xl focus-within:border-[#dadce0] border border-transparent flex items-center transition-all duration-300">
                            <div className="ml-5 p-2 text-[#5f6368]">
                                <SearchIcon size={20} />
                            </div>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleChat()}
                                placeholder="Message AI Global Agent..."
                                className="flex-1 bg-transparent py-5 px-3 outline-none text-[16px] text-[#202124]"
                            />
                            <button onClick={handleChat} disabled={!inputValue.trim() || isStreaming} className={`mr-2 w-12 h-12 flex items-center justify-center rounded-full transition-all ${inputValue.trim() ? 'bg-[#1a73e8] text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}>
                                {isStreaming ? <Loader2 className="animate-spin w-6 h-6" /> : <ArrowUp className="w-6 h-6" />}
                            </button>
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] opacity-60">
                                Arthik Agentic Core v2.8 • Global Travel Intelligence
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {isProfilePopupOpen && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-end p-6" onClick={() => setIsProfilePopupOpen(false)}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-96 bg-white rounded-[2.5rem] shadow-2xl border border-[#dadce0] p-8 mt-12" onClick={e => e.stopPropagation()}>
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-[#E37400] text-white flex items-center justify-center text-4xl mb-6 shadow-xl border-4 border-white uppercase">{user?.first_name?.[0] || "U"}</div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-1">{user?.first_name} {user?.last_name}</h3>
                                <p className="text-slate-500 mb-8">{user?.email}</p>
                                <div className="w-full space-y-3 mb-8">
                                    <button onClick={() => { navigate("/preferences"); setIsProfilePopupOpen(false); }} className="w-full py-4 rounded-2xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all">TRAVEL PREFERENCES</button>
                                    <button onClick={() => { setIsPasswordModalOpen(true); setIsProfilePopupOpen(false); }} className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-lg">CHANGE PASSWORD</button>
                                </div>
                                <button onClick={handleLogout} className="text-slate-400 text-sm font-bold hover:text-rose-500 hover:underline transition-all">SIGN OUT</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm" onClick={() => setIsPasswordModalOpen(false)}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h2 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">Security</h2>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <input type="password" required value={passwordData.password} onChange={e => setPasswordData({ ...passwordData, password: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all" placeholder="Current Password" />
                            <input type="password" required minLength={6} value={passwordData.new_password} onChange={e => setPasswordData({ ...passwordData, new_password: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all" placeholder="New Password" />
                            {passwordError && <div className="p-4 bg-rose-50 rounded-xl text-rose-500 text-xs font-bold uppercase tracking-widest">{passwordError}</div>}
                            {passwordSuccess && <div className="p-4 bg-emerald-50 rounded-xl text-emerald-500 text-xs font-bold uppercase tracking-widest text-center italic">Updated successfully</div>}
                            <div className="pt-6 flex flex-col gap-3">
                                <button type="submit" disabled={isPasswordLoading} className="w-full bg-[#1a73e8] text-white py-5 rounded-[2rem] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50">Update Credentials</button>
                                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-all uppercase text-xs">Dismiss</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
