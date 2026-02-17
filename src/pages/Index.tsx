import { HeroSection } from '@/components/ui/hero-section-1'
import { Features } from '@/components/ui/features-6'
import DatabaseWithRestApi from '@/components/ui/database-with-rest-api'
import { Meteors } from '@/components/ui/meteors'
import VisionSection from '@/components/ui/vision-section'
import FAQs from '@/components/ui/faq'
import { Footer } from '@/components/ui/footer-section'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Star, ArrowRight, Menu, X, Squirrel } from "lucide-react";

import { motion, useScroll, useTransform } from 'framer-motion';
import { BentoFeatures } from '@/components/landing/BentoFeatures';
import { PricingSection } from '@/components/landing/PricingSection';
import { FinalCTA } from '@/components/ui/final-cta';
import { SEO } from '@/components/SEO';

const Index = () => {


  const faqs = [
    {
      question: "How is CarFolio different from just posting on Instagram?",
      answer: "Instagram buries your content within hours, and links get lost in comments. CarFolio gives you a permanent profile at carfolio.cc/you that organizes every car and mod in one place. Share one link instead of repeating yourself in DMs."
    },
    {
      question: "How do I earn money with Shoppable Builds?",
      answer: "Add affiliate buy links to the parts on your builds. When someone clicks through and purchases, you earn a commission. Even a few sales a month can cover the cost of Pro and more."
    },
    {
      question: "Can I showcase multiple cars?",
      answer: "Yes! Free members get 3 car slots to start. Pro and OG members get unlimited slots — daily drivers, project cars, your entire collection in one garage."
    },
    {
      question: "What's the difference between Pro and OG?",
      answer: "Pro is $5.99/month and gives you unlimited cars, Shoppable Builds, and analytics. OG is a one-time $49 payment that gives you everything in Pro, forever — plus an exclusive OG badge. Only 100 OG spots are available."
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO
        title="CarFolio - The Definitive Automotive Portfolio"
        description="Showcase your builds, manage modifications, and monetize your passion. CarFolio is the ultimate platform for car enthusiasts."
        name="CarFolio"
        type="website"
      />

      <HeroSection />



      {/* Bento Grid Features Section */}
      <BentoFeatures />

      {/* Features Section */}
      <section id="feature">
        <Features />
      </section>

      {/* Gallery Section */}
      <section className="py-16 md:py-32 relative overflow-hidden overflow-x-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/4s/Group 13.png"
            alt="Background"
            className="w-full h-full object-cover opacity-40"
          />

        </div>

        <div className="mx-auto max-w-5xl space-y-12 px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative z-10 grid items-center gap-4 md:grid-cols-2 md:gap-12"
          >
            <h2 className="text-4xl font-semibold text-foreground dark:text-white">A Gallery for Your Garage</h2>
            <p className="max-w-sm sm:ml-auto text-slate-700 dark:text-slate-300">Every build is a journey. CarFolio gives you the canvas to tell its story with cinematic galleries, detailed modification lists, and complete build histories.</p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Vision Section */}
      <VisionSection />



      {/* FAQ Section */}
      <FAQs />

      {/* Final CTA Section */}
      <FinalCTA />

      {/* CarFolio Footer */}
      <Footer />
    </div>
  );
};

export default Index;
