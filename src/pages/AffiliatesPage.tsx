import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Sparkles, DollarSign, TrendingUp, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";


export default function AffiliatesPage() {
    const { toast } = useToast();
    // @ts-ignore – Convex type instantiation
    const submitApplication = useMutation(api.affiliates.submitApplication);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        socialHandle: "",
        platform: "",
        audienceSize: "",
        message: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email) {
            toast({ title: "Missing info", description: "Name and email are required.", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            await submitApplication({
                name: form.name,
                email: form.email,
                socialHandle: form.socialHandle || undefined,
                platform: form.platform || undefined,
                audienceSize: form.audienceSize || undefined,
                message: form.message || undefined,
            });
            setSubmitted(true);
        } catch (err: any) {
            const msg = err?.data || err?.message || "Failed to submit. Try again.";
            toast({ title: "Error", description: String(msg), variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-white">


            <div className="max-w-4xl mx-auto px-6 py-20 pt-28">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-16"
                >
                    {/* Hero */}
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
                            <Sparkles className="w-4 h-4" />
                            Coming Soon
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                            CarFolio{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                Affiliate Program
                            </span>
                        </h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                            Earn commissions by sharing CarFolio with your audience.
                            Get exclusive perks, early access to features, and recurring revenue.
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: DollarSign,
                                title: "Recurring Revenue",
                                desc: "Earn up to 30% recurring commission on every referral that subscribes.",
                            },
                            {
                                icon: TrendingUp,
                                title: "Real-Time Dashboard",
                                desc: "Track clicks, conversions, and earnings with a dedicated affiliate dashboard.",
                            },
                            {
                                icon: Users,
                                title: "Exclusive Community",
                                desc: "Join a community of automotive creators. Get early access to features and perks.",
                            },
                        ].map((item) => (
                            <div key={item.title} className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-3">
                                <item.icon className="w-7 h-7 text-purple-400" />
                                <h3 className="font-semibold text-white text-lg">{item.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Waitlist Form */}
                    {submitted ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-16 space-y-4"
                        >
                            <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
                            <h2 className="text-2xl font-bold">You're on the list!</h2>
                            <p className="text-slate-400 max-w-md mx-auto">
                                We'll reach out when the affiliate program launches. Keep building — your portfolio is your best pitch.
                            </p>
                        </motion.div>
                    ) : (
                        <div className="max-w-xl mx-auto space-y-6">
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-bold">Join the Waitlist</h2>
                                <p className="text-slate-400">Be the first to know when we launch.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-xl bg-white/5 border border-white/10">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name *</Label>
                                        <Input
                                            id="name"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            placeholder="Your name"
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            placeholder="you@example.com"
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="socialHandle">Social Handle</Label>
                                        <Input
                                            id="socialHandle"
                                            value={form.socialHandle}
                                            onChange={(e) => setForm({ ...form, socialHandle: e.target.value })}
                                            placeholder="@yourhandle"
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="platform">Primary Platform</Label>
                                        <Select
                                            value={form.platform}
                                            onValueChange={(v) => setForm({ ...form, platform: v })}
                                        >
                                            <SelectTrigger className="bg-white/5 border-white/10">
                                                <SelectValue placeholder="Select platform" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="instagram">Instagram</SelectItem>
                                                <SelectItem value="tiktok">TikTok</SelectItem>
                                                <SelectItem value="youtube">YouTube</SelectItem>
                                                <SelectItem value="twitter">Twitter / X</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="audienceSize">Audience Size</Label>
                                    <Select
                                        value={form.audienceSize}
                                        onValueChange={(v) => setForm({ ...form, audienceSize: v })}
                                    >
                                        <SelectTrigger className="bg-white/5 border-white/10">
                                            <SelectValue placeholder="Select range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="< 1K">Less than 1K</SelectItem>
                                            <SelectItem value="1K-10K">1K – 10K</SelectItem>
                                            <SelectItem value="10K-100K">10K – 100K</SelectItem>
                                            <SelectItem value="100K+">100K+</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Why do you want to join? (Optional)</Label>
                                    <Textarea
                                        id="message"
                                        value={form.message}
                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        placeholder="Tell us about your audience and how you'd promote CarFolio..."
                                        rows={3}
                                        className="bg-white/5 border-white/10 resize-none"
                                    />
                                </div>

                                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Join the Waitlist"
                                    )}
                                </Button>
                            </form>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
