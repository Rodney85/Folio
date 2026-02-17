import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-white">


            <div className="max-w-3xl mx-auto px-6 py-20 pt-28">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-12"
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                        <Heart className="w-4 h-4" />
                        Our Story
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Built by Enthusiasts,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            for Enthusiasts.
                        </span>
                    </h1>

                    <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
                        <p>
                            CarFolio started with a simple question: <em>why isn't there a clean, beautiful way to
                                document and share your build?</em> Spreadsheets, forum posts, and Instagram captions
                            don't do justice to the builds we pour our hearts into.
                        </p>
                        <p>
                            We're a small team of car people who believe every build deserves a proper portfolio.
                            Whether it's a weekend project, a full restoration, or a track-day monster — your
                            build tells a story, and CarFolio is the platform to tell it.
                        </p>
                    </div>

                    {/* Values */}
                    <div className="grid md:grid-cols-3 gap-6 pt-8">
                        {[
                            { icon: Heart, title: "Passion First", desc: "We build for the community, not investors." },
                            { icon: Zap, title: "Quality Obsessed", desc: "Every pixel matters. Your builds deserve the best." },
                            { icon: Users, title: "Community Driven", desc: "Built with feedback from real enthusiasts." },
                        ].map((item) => (
                            <div key={item.title} className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-3">
                                <item.icon className="w-6 h-6 text-blue-400" />
                                <h3 className="font-semibold text-white">{item.title}</h3>
                                <p className="text-sm text-slate-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="pt-8">
                        <Button asChild size="lg">
                            <Link to="/sign-up">Join the Community</Link>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
