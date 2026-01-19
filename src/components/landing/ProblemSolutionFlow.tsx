import React from "react";
import DatabaseWithRestApi from "@/components/ui/database-with-rest-api";

export const ProblemSolutionFlow = () => {
    return (
        <section id="solution" className="py-12 sm:py-16 lg:py-20 bg-slate-900 dark:bg-slate-950 text-white overflow-x-hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Pain Point */}
                <div className="text-center mb-8 md:mb-16">
                    <h2 className="text-4xl font-semibold mb-4 md:mb-8 text-white">Your build's story is scattered.</h2>
                    <p className="text-xl mb-6 md:mb-12 text-slate-300 max-w-4xl mx-auto">
                        Across forums. In social feeds. In endless DMs. The details that matter get lost, and the value you create goes unrewarded. Your work deserves more than a temporary post.
                    </p>
                </div>

                {/* Database Component */}
                <div className="flex justify-center mb-6 md:mb-24">
                    <DatabaseWithRestApi
                        title="CarFolio - One Link"
                        circleText="API"
                        badgeTexts={{
                            first: "Cars",
                            second: "Parts",
                            third: "Share",
                            fourth: "Earn"
                        }}
                        buttonTexts={{
                            first: "CarFolio",
                            second: "v3_builds"
                        }}
                        lightColor="#3b82f6"
                        className="scale-90 md:scale-125 lg:scale-150"
                    />
                </div>

                {/* Solution - Two Column Layout */}
                <div className="mb-12 md:mb-24">
                    <div className="relative z-10 grid items-center gap-3 md:gap-4 md:grid-cols-2 md:gap-12">
                        <h2 className="text-3xl md:text-4xl font-semibold text-white">One build. One link. Endless possibilities.</h2>
                        <p className="max-w-sm sm:ml-auto text-lg md:text-xl text-slate-300">CarFolio brings everything together into a single, shareable link. The definitive home for your automotive identity. When your showcase is this seamless, it doesn't just get seen—it gets recognized.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
