import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { XCircle, RefreshCcw, Home, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';

const PaymentFailure: React.FC = () => {
    const [searchParams] = useSearchParams();
    const txnid = searchParams.get('txnid');
    const error = searchParams.get('error') || 'Your transaction could not be completed at this time.';

    return (
        <div className="min-h-screen bg-[#050510] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-orange-500/5 pointer-events-none" />

            <Card className="w-full max-w-lg border-zinc-800 bg-zinc-950/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500" />

                <CardHeader className="text-center pt-8 pb-4">
                    <div className="mx-auto w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 border border-rose-500/20">
                        <XCircle className="w-12 h-12 text-rose-500" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-white tracking-tight">Payment Failed</CardTitle>
                    <CardDescription className="text-zinc-400 text-lg mt-2">
                        Something went wrong during the process.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-8">
                    {txnid && (
                        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex justify-between items-center text-xs">
                            <span className="text-zinc-500 uppercase tracking-widest">Transaction Ref</span>
                            <span className="text-rose-400 font-mono">{txnid}</span>
                        </div>
                    )}
                    <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                        <p className="text-zinc-300 text-sm leading-relaxed">
                            {error}
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 px-8 pb-8">
                    <Button asChild className="w-full bg-white text-black hover:bg-zinc-200 h-12 text-base font-semibold transition-colors">
                        <Link to="/home" className="flex items-center justify-center gap-2">
                            <RefreshCcw className="w-4 h-4" />
                            Retry Booking
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full border border-zinc-800 text-zinc-300 hover:bg-zinc-900 h-12">
                        <Link to="/home" className="flex items-center justify-center gap-2">
                            <Home className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default PaymentFailure;
