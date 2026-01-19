'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { motion } from 'framer-motion';

export default function FAQs() {
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
        <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950" id="faq">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto max-w-xl text-center"
                >
                    <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground mt-4 text-balance">Get answers to common questions about building, sharing, and monetizing your automotive showcase with CarFolio.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mx-auto mt-12 max-w-xl"
                >
                    <Accordion
                        type="single"
                        collapsible
                        className="bg-card ring-muted w-full rounded-2xl border px-4 md:px-8 py-3 shadow-sm ring-4 dark:ring-0">
                        {faqItems.map((item) => (
                            <AccordionItem
                                key={item.id}
                                value={item.id}
                                className="border-dashed">
                                <AccordionTrigger className="cursor-pointer text-base hover:no-underline">{item.question}</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-base">{item.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>

                <p className="text-muted-foreground mt-6 px-4 md:px-8">
                    Still have questions? Contact our{' '}
                    <a
                        href="mailto:support@carfolio.com"
                        className="text-primary font-medium hover:underline">
                        support team
                    </a>
                </p>
            </div>
        </section>

    )
}
