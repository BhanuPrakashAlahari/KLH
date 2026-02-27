import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';

const PaymentSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const txnid = searchParams.get('txnid');

    const handleDownload = () => {
        const baseUrl = import.meta.env.VITE_OMEGA_BACKEND_URL;
        if (txnid) {
            window.open(`${baseUrl}/booking/${txnid}/download`, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-[#050510] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />

            <Card className="w-full max-w-lg border-zinc-800 bg-zinc-950/80 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />

                <CardHeader className="text-center pt-8 pb-4">
                    <div className="mx-auto w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20">
                        <CheckCircle className="w-12 h-12 text-emerald-500" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-white tracking-tight">Payment Confirmed</CardTitle>
                    <CardDescription className="text-zinc-400 text-lg mt-2">
                        Your booking has been secured successfully.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-8">
                    <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex justify-between items-center text-xs">
                        <span className="text-zinc-500 uppercase tracking-widest">Transaction Ref</span>
                        <span className="text-emerald-400 font-mono">{txnid}</span>
                    </div>
                    <div className="text-center p-4">
                        <p className="text-zinc-400 text-sm">
                            A confirmation email along with your digital invoice has been sent to your registered address.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 px-8 pb-8">
                    <Button asChild className="w-full bg-emerald-600 text-white hover:bg-emerald-700 h-12 text-base font-semibold">
                        <Link to="/home" className="flex items-center justify-center gap-2">
                            Return to Home
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </Button>
                    <Button
                        onClick={handleDownload}
                        variant="ghost"
                        className="w-full border border-zinc-800 text-zinc-300 hover:bg-zinc-900 h-12"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF Invoice
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default PaymentSuccess;
