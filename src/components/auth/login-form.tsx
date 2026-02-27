import { Mail, Lock, User, ChevronRight, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RotatingEarth from "../ui/wireframe-dotted-globe";

interface LoginFormProps {
    isLogin: boolean;
    setIsLogin: (val: boolean) => void;
    loading: boolean;
    error: string;
    formData: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onGoogleLogin: () => void;
}

export default function LoginForm({
    isLogin,
    setIsLogin,
    loading,
    error,
    formData,
    onChange,
    onSubmit,
    onGoogleLogin
}: LoginFormProps) {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen w-full  font-sans overflow-hidden relative">
            {/* Back Button */}
            <button
                onClick={() => navigate("/")}
                className="absolute top-8 left-8 p-3 rounded-full shadow-sm hover:shadow-md hover:bg-slate-50 transition-all z-50 group"
            >
                <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-slate-900 group-hover:-translate-x-0.5 transition-all" />
            </button>
            {/* Left Side: Interactive Globe Portal */}
            <div className="w-full hidden md:flex flex-col justify-center items-center bg-slate-50 relative overflow-hidden border-r border-slate-100">
                <RotatingEarth width={600} height={600} className="z-10" />



                {/* Decorative Technical Grid */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            {/* Right Side Form */}
            <div className="w-full flex flex-col items-center justify-center bg-white p-8">
                <form onSubmit={onSubmit} className="md:w-[420px] w-full max-w-sm flex flex-col">
                    <h2 className="text-4xl text-gray-900 font-medium mb-3">
                        {isLogin ? "Sign in" : "Create Account"}
                    </h2>
                    <p className="text-sm text-gray-500/90 mb-8">
                        {isLogin ? "Welcome back! Please sign in to continue" : "Join the world's most intelligent hospitality layer"}
                    </p>

                    <button
                        type="button"
                        onClick={onGoogleLogin}
                        disabled={loading}
                        className="w-full bg-gray-500/10 flex items-center justify-center h-14 rounded-full transition-all hover:bg-gray-500/20 disabled:opacity-50 gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Continue with Google</span>
                    </button>

                    <div className="flex items-center gap-4 w-full my-8">
                        <div className="w-full h-px bg-gray-200"></div>
                        <p className="text-nowrap text-xs text-gray-400 uppercase tracking-widest font-medium">or email</p>
                        <div className="w-full h-px bg-gray-200"></div>
                    </div>

                    {!isLogin && (
                        <div className="flex gap-4 mb-4">
                            <div className="flex items-center w-full bg-slate-50 border border-gray-200 h-14 rounded-2xl px-6 gap-3 transition-all focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400">
                                <User className="text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    name="first_name"
                                    placeholder="First Name"
                                    value={formData.first_name}
                                    onChange={onChange}
                                    className="bg-transparent text-gray-900 placeholder-gray-400 outline-none text-sm w-full font-light"
                                    required
                                />
                            </div>
                            <div className="flex items-center w-full bg-slate-50 border border-gray-200 h-14 rounded-2xl px-6 gap-3 transition-all focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400">
                                <input
                                    type="text"
                                    name="last_name"
                                    placeholder="Last Name"
                                    value={formData.last_name}
                                    onChange={onChange}
                                    className="bg-transparent text-gray-900 placeholder-gray-400 outline-none text-sm w-full font-light"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {!isLogin && (
                        <div className="flex items-center mb-4 w-full bg-slate-50 border border-gray-200 h-14 rounded-2xl px-6 gap-3 transition-all focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400">
                            <Mail className="text-gray-400 w-4 h-4" />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={onChange}
                                className="bg-transparent text-gray-900 placeholder-gray-400 outline-none text-sm w-full font-light"
                                required
                            />
                        </div>
                    )}

                    <div className="flex items-center w-full bg-slate-50 border border-gray-200 h-14 rounded-2xl px-6 gap-3 transition-all focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400">
                        <User className="text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={onChange}
                            className="bg-transparent text-gray-900 placeholder-gray-400 outline-none text-sm w-full font-light"
                            required
                        />
                    </div>

                    <div className="flex items-center mt-4 w-full bg-slate-50 border border-gray-200 h-14 rounded-2xl px-6 gap-3 transition-all focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400">
                        <Lock className="text-gray-400 w-4 h-4" />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={onChange}
                            className="bg-transparent text-gray-900 placeholder-gray-400 outline-none text-sm w-full font-light"
                            required
                        />
                    </div>

                    <div className="w-full flex items-center justify-between mt-6 text-gray-500/80">
                        <div className="flex items-center gap-2">
                            <input className="h-4 w-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500" type="checkbox" id="checkbox" />
                            <label className="text-sm cursor-pointer" htmlFor="checkbox">Remember me</label>
                        </div>
                        <a className="text-sm underline hover:text-indigo-500 transition-colors" href="#">Forgot password?</a>
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                            <p className="text-red-500 text-xs text-center uppercase tracking-widest">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-8 w-full h-14 rounded-2xl text-white bg-slate-900 hover:bg-slate-800 transition-all font-bold text-xs uppercase tracking-[0.4em] disabled:opacity-50 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
                    >
                        {loading ? "Processing..." : isLogin ? "Proceed into Arthik" : "Create Account"}
                        {!loading && <ChevronRight className="w-4 h-4" />}
                    </button>

                    <p className="text-gray-500/90 text-sm mt-8 text-center">
                        {isLogin ? "Don't have an account?" : "Already have an account?"} {" "}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-indigo-500 font-bold hover:underline"
                        >
                            {isLogin ? "Sign up" : "Log in"}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
}
