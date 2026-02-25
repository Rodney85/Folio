'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';

export default function FAQs() {
    // Keep the same FAQ items
    const faqItems = [
        {
            id: 'item-1',
            question: 'How do I create my first CarFolio showcase?',
            answer: 'Getting started is easy! Sign up for your free account, choose from our professional templates, and start adding your build photos, specifications, and story. Our intuitive editor makes it simple to create a stunning showcase in minutes.',
        },
        {
            id: 'item-2',
            question: 'Can I earn money from my CarFolio?',
            answer: 'Absolutely! CarFolio integrates with 40+ automotive retailers including Amazon Associates, Summit Racing, FCP Euro, and Tire Rack. When visitors purchase parts through your recommendations, you earn commissions. Many users start earning from day one.',
        },
        {
            id: 'item-3',
            question: 'What types of builds can I showcase?',
            answer: 'CarFolio supports all types of automotive builds - from weekend project cars to professional builds, motorcycles, trucks, classic restorations, and everything in between. Whether you\'re a DIY enthusiast or professional builder, CarFolio works for you.',
        },
        {
            id: 'item-4',
            question: 'Is there a free plan available?',
            answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required to get started. After your trial, choose from our flexible plans designed for different types of builders and creators.',
        },
        {
            id: 'item-5',
            question: 'How do I share my CarFolio with others?',
            answer: 'Each CarFolio gets a unique, professional link that you can share anywhere - social media, forums, business cards, or embed in your existing website. Your showcase is mobile-optimized and looks great on all devices.',
        },
        {
            id: 'item-6',
            question: 'Can I track my showcase performance?',
            answer: 'Yes! CarFolio provides detailed analytics showing views, engagement, click-through rates, and earnings. Track which parts and recommendations perform best to optimize your showcase for maximum revenue.',
        },
    ]

    return (
        <section className="py-16 md:py-24 bg-gradient-to-br from-slate-900 to-blue-950" id="faq">
            <div className="mx-auto max-w-4xl px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto max-w-2xl text-center mb-16"
                >
                    <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-muted-foreground mt-4 text-balance text-lg">
                        Everything you need to know about building your digital garage and monetizing your passion.
                    </p>
                </motion.div>

                <div className="mx-auto max-w-3xl">
                    <Accordion
                        type="single"
                        collapsible
                        className="space-y-4"
                    >
                        {faqItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.4 }}
                            >
                                <AccordionItem
                                    value={item.id}
                                    className="border rounded-xl bg-card px-2 transition-all duration-200 hover:shadow-md data-[state=open]:shadow-lg dark:hover:shadow-white/5 dark:data-[state=open]:shadow-white/5"
                                >
                                    <AccordionTrigger className="px-4 py-4 text-left text-base font-medium hover:no-underline [&[data-state=open]>svg]:rotate-45">
                                        <span className="flex-1 text-base md:text-lg">{item.question}</span>
                                        {/* Custom Icon handled by CSS & AccordionTrigger usually has one, 
                                            but if we want standard look effectively, we rely on default.
                                            If we want 'boring' gone, maybe we just trust the new card layout. 
                                            ShadCN AccordionTrigger has a ChevronDown by default. 
                                        */}
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4 text-muted-foreground text-base">
                                        {item.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            </motion.div>
                        ))}
                    </Accordion>
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-muted-foreground mt-12 text-center text-sm"
                >
                    Still have questions? Contact our{' '}
                    <a
                        href="mailto:support@carfolio.cc"
                        className="text-primary font-medium hover:underline underline-offset-4 decoration-primary/50 hover:decoration-primary transition-all">
                        support team
                    </a>
                </motion.p>
            </div>
        </section>
    )
}
