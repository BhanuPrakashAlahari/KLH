import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Calendar,
    Download,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Brain,
    ArrowLeft
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { apiService } from "../../services/api"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"

interface Booking {
    id: string;
    destination: string;
    date: string;
    status: 'CONFIRMED' | 'PENDING' | 'FAILED';
    amount: string;
    transaction_id?: string;
}

export function Bookings() {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadBookings = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const data = await apiService.fetchBookings(token);
                setBookings(data);
            } catch (err) {
                setError("Unable to retrieve booking records. Please try again.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadBookings();
    }, [navigate]);

    const handleDownload = (bookingId: string) => {
        const baseUrl = import.meta.env.VITE_OMEGA_BACKEND_URL;
        window.open(`${baseUrl}/booking/${bookingId}/download`, '_blank');
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'CONFIRMED':
                return {
                    bg: 'bg-emerald-500/10',
                    text: 'text-emerald-500',
                    icon: <CheckCircle2 size={14} />,
                    label: 'Confirmed'
                };
            case 'FAILED':
                return {
                    bg: 'bg-rose-500/10',
                    text: 'text-rose-500',
                    icon: <XCircle size={14} />,
                    label: 'Failed'
                };
            default:
                return {
                    bg: 'bg-amber-500/10',
                    text: 'text-amber-500',
                    icon: <Clock size={14} />,
                    label: 'Pending'
                };
        }
    };

    return (
        <div className="min-h-screen bg-white text-[#202124] font-sans">
            {/* Header */}
            <header className="h-20 border-b border-[#dadce0] flex items-center px-8 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <button
                    onClick={() => navigate("/home")}
                    className="mr-6 p-2 hover:bg-slate-50 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#1a73e8] rounded-xl flex items-center justify-center">
                        <Brain className="text-white w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">My Travel History</h1>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-8 py-12">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Bookings</h2>
                        <p className="text-slate-500 text-lg">Manage your trips and download invoices.</p>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1a73e8] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search bookings..."
                            className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#1a73e8]/10 focus:border-[#1a73e8] w-64 transition-all"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <div className="w-12 h-12 border-4 border-[#1a73e8]/20 border-t-[#1a73e8] rounded-full animate-spin" />
                        <p className="text-slate-400 font-medium animate-pulse">Syncing with server...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-32 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                        <div className="mx-auto w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                            <Calendar size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings yet</h3>
                        <p className="text-slate-500 mb-8 max-w-xs mx-auto">Your upcoming trips and history will appear here once you make your first booking.</p>
                        <Button onClick={() => navigate("/")} className="bg-[#1a73e8] text-white rounded-2xl px-8 h-12 font-bold shadow-lg hover:shadow-xl transition-all">
                            Start Planning
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        <AnimatePresence>
                            {bookings.map((booking, idx) => {
                                const status = getStatusStyles(booking.status);
                                return (
                                    <motion.div
                                        key={booking.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Card className="hover:shadow-xl transition-all duration-300 border-[#dadce0] group overflow-hidden">
                                            <div className="flex items-center p-6 gap-8">
                                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#1a73e8]/5 transition-colors">
                                                    <Calendar className="text-slate-400 group-hover:text-[#1a73e8] transition-colors" size={24} />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="text-lg font-bold text-slate-900 truncate">{booking.destination}</h4>
                                                        <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${status.bg} ${status.text}`}>
                                                            {status.icon}
                                                            {status.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-500 text-sm flex items-center gap-2">
                                                        <span>{new Date(booking.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                        <span className="font-mono text-xs opacity-60">ID: {booking.id}</span>
                                                    </p>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <div className="text-xl font-extrabold text-slate-900 mb-2">{booking.amount}</div>
                                                    <div className="flex gap-2">
                                                        {booking.status === 'CONFIRMED' && (
                                                            <Button
                                                                onClick={() => handleDownload(booking.id)}
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-9 px-4 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                                                            >
                                                                <Download size={14} className="mr-2" />
                                                                Invoice
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100"
                                                        >
                                                            <ChevronRight size={18} className="text-slate-400" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {error && (
                    <div className="mt-8 p-4 bg-rose-50 text-rose-500 rounded-2xl text-center font-bold text-sm uppercase tracking-widest border border-rose-100">
                        {error}
                    </div>
                )}
            </main>
        </div>
    );
}
