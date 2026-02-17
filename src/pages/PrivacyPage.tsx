import { motion } from "framer-motion";
import { Shield } from "lucide-react";


export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background text-white">


            <div className="max-w-3xl mx-auto px-6 py-20 pt-28">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
                        <Shield className="w-4 h-4" />
                        Privacy
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Privacy Policy</h1>

                    <p className="text-slate-400 text-sm">Last updated: February 2026</p>

                    <div className="prose prose-invert prose-slate max-w-none space-y-6">
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>
                            <p className="text-slate-300 leading-relaxed">
                                We collect information you provide directly: your name, email address, profile
                                information, and vehicle details. We also collect usage data such as pages visited,
                                features used, and device information to improve the Service.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">2. How We Use Your Information</h2>
                            <p className="text-slate-300 leading-relaxed">
                                We use your information to provide and improve the Service, process payments,
                                communicate with you about your account, and send product updates. We do not sell
                                your personal information to third parties.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">3. Data Storage & Security</h2>
                            <p className="text-slate-300 leading-relaxed">
                                Your data is stored securely using industry-standard encryption. Vehicle images are
                                stored on secure cloud infrastructure. We implement appropriate technical and
                                organizational measures to protect your data.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">4. Third-Party Services</h2>
                            <p className="text-slate-300 leading-relaxed">
                                We use third-party services for authentication (Clerk), database (Convex), image
                                storage (Backblaze), and payment processing (Dodo Payments). Each service has its
                                own privacy policy governing how they handle your data.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">5. Your Rights</h2>
                            <p className="text-slate-300 leading-relaxed">
                                You have the right to access, update, or delete your personal information at any
                                time through your account settings. You may also request a copy of your data or
                                ask us to delete your account entirely.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">6. Cookies</h2>
                            <p className="text-slate-300 leading-relaxed">
                                We use essential cookies for authentication and session management. We do not use
                                third-party tracking cookies or advertising cookies.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">7. Contact</h2>
                            <p className="text-slate-300 leading-relaxed">
                                For privacy-related questions, please contact us at{" "}
                                <a href="mailto:privacy@carfolio.cc" className="text-blue-400 hover:underline">
                                    privacy@carfolio.cc
                                </a>.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
