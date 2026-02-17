import { motion } from "framer-motion";
import { FileText } from "lucide-react";


export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background text-white">


            <div className="max-w-3xl mx-auto px-6 py-20 pt-28">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium">
                        <FileText className="w-4 h-4" />
                        Legal
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Terms of Service</h1>

                    <p className="text-slate-400 text-sm">Last updated: February 2026</p>

                    <div className="prose prose-invert prose-slate max-w-none space-y-6">
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
                            <p className="text-slate-300 leading-relaxed">
                                By accessing or using CarFolio ("the Service"), you agree to be bound by these Terms
                                of Service. If you do not agree to these terms, please do not use the Service.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">2. Description of Service</h2>
                            <p className="text-slate-300 leading-relaxed">
                                CarFolio provides a platform for automotive enthusiasts to document, showcase, and
                                share their vehicle builds. The Service includes free and premium tiers with varying
                                levels of access and features.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">3. User Accounts</h2>
                            <p className="text-slate-300 leading-relaxed">
                                You are responsible for maintaining the confidentiality of your account credentials
                                and for all activities that occur under your account. You agree to provide accurate,
                                current, and complete information during registration.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">4. User Content</h2>
                            <p className="text-slate-300 leading-relaxed">
                                You retain ownership of the content you upload to CarFolio. By uploading content,
                                you grant CarFolio a non-exclusive, worldwide, royalty-free license to use, display,
                                and distribute your content in connection with the Service.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">5. Prohibited Conduct</h2>
                            <p className="text-slate-300 leading-relaxed">
                                You agree not to upload content that is illegal, offensive, or infringes on the
                                rights of others. CarFolio reserves the right to remove content and suspend accounts
                                that violate these terms.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">6. Subscriptions & Payments</h2>
                            <p className="text-slate-300 leading-relaxed">
                                Premium features are available through paid subscriptions. Subscription fees are
                                billed in advance and are non-refundable except as required by law. You may cancel
                                your subscription at any time.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold text-white">7. Contact</h2>
                            <p className="text-slate-300 leading-relaxed">
                                For questions about these Terms, please contact us at{" "}
                                <a href="mailto:legal@carfolio.cc" className="text-blue-400 hover:underline">
                                    legal@carfolio.cc
                                </a>.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
