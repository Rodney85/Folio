import { HeroSection } from '@/components/ui/hero-section-1'
import { Features } from '@/components/ui/features-6'
import DatabaseWithRestApi from '@/components/ui/database-with-rest-api'
import { Meteors } from '@/components/ui/meteors'
import Testimonials from '@/components/ui/testimonials'
import FAQs from '@/components/ui/faq'
import { Footer } from '@/components/ui/footer-section'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Star, DollarSign, BarChart3, Share2, Settings, Car, Trophy, ArrowRight, Menu, X, Squirrel } from "lucide-react";
import { NavBar } from '@/components/ui/navbar-from-md'
import { motion, useScroll, useTransform } from 'framer-motion';
import { ProblemSolutionFlow } from '@/components/landing/ProblemSolutionFlow';

const Index = () => {


  const features = [
    {
      icon: <Car className="h-6 w-6" />,
      title: "Professional Car Showcases",
      description: "High-resolution photo galleries with professional layouts, detailed specs, and modification timelines."
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      title: "Organized Parts Integration",
      description: "Clean, categorized parts lists with direct affiliate links to major automotive retailers."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Advanced Analytics Dashboard",
      description: "Track which parts generate interest, monitor affiliate performance, and optimize content."
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Multiple Revenue Streams",
      description: "Amazon Associates, Summit Racing, FCP Euro, Tire Rack, and 50+ automotive retailers."
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Multi-Vehicle Management",
      description: "Showcase your entire garage with unlimited car profiles and separate analytics."
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Professional Customization",
      description: "Multiple templates, custom branding, and white-label options for businesses."
    }
  ];

  const testimonials = [
    {
      name: "Mike Chen",
      location: "Los Angeles, CA",
      car: "Honda S2000 Owner",
      earnings: "$1,200+ in 6 months",
      quote: "I made $340 in my first month just from my S2000 build showcase. People were already asking about my parts - now I actually get paid when they buy them."
    },
    {
      name: "Sarah Rodriguez",
      location: "Austin, TX",
      car: "2021 F-150 Owner",
      followers: "2,300 followers gained",
      quote: "My F-150 build portfolio has been shared over 500 times. The organized parts list saves me hours of answering the same questions in truck groups."
    },
    {
      name: "Alex Thompson",
      location: "Atlanta, GA",
      car: "Professional Drifter",
      partnerships: "3 new sponsor deals",
      quote: "Finally, a professional way to showcase my drift builds. Sponsors take me seriously now, and I'm earning commission on parts I recommend anyway."
    }
  ];



  const faqs = [
    {
      question: "How is CarFolio different from just posting links on Instagram?",
      answer: "Instagram buries your content within hours, and links get lost in comments. CarFolio gives you a permanent, professional showcase that you own and control. Plus, you can track exactly which parts people are most interested in and optimize your recommendations."
    },
    {
      question: "Do I need a huge following to make money with affiliate links?",
      answer: "Not at all. Even if just 5 people per month buy a $300 part through your links (at 5% commission), you've earned $75 - nearly 4x what CarFolio costs. Quality recommendations to engaged automotive enthusiasts convert much better than mass-market content."
    },
    {
      question: "What affiliate programs work with CarFolio?",
      answer: "We integrate with Amazon Associates, Summit Racing, FCP Euro, Tire Rack, AutoZone, and 50+ other major automotive retailers. We're constantly adding new partnerships and negotiating better commission rates for our users."
    },
    {
      question: "Can I showcase multiple cars?",
      answer: "Absolutely! Create separate showcases for your daily driver, weekend toy, project car, or entire collection. Many users showcase their automotive journey from first car to current builds."
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <NavBar />
      <HeroSection />

      {/* Sticky Scrollytelling Section */}
      <ProblemSolutionFlow />

      {/* Meteor Cards Section (Normal Scroll Flow after Sticky) */}
      <section className="py-24 bg-slate-900 dark:bg-slate-950 overflow-hidden relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Reuse the cards code here with Framer Motion entry */}
            {[
              { title: "Build Your Folio", icon: Car, color: "from-blue-500 to-teal-500", iconColor: "text-blue-400", iconBg: "bg-blue-500/10 border-blue-500/20" },
              { title: "Share Your Link", icon: Share2, color: "from-purple-500 to-pink-500", iconColor: "text-purple-400", iconBg: "bg-purple-500/10 border-purple-500/20" },
              { title: "Monetize", icon: DollarSign, color: "from-orange-500 to-red-500", iconColor: "text-orange-400", iconBg: "bg-orange-500/10 border-orange-500/20" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                className="w-full relative max-w-xs mx-auto group"
              >
                <div className={`absolute inset-0 h-full w-full bg-gradient-to-r ${item.color} transform scale-[0.80] rounded-3xl blur-3xl opacity-20 group-hover:opacity-60 transition-opacity duration-700 ease-in-out`} />
                <div className="relative h-full overflow-hidden rounded-3xl border border-white/10 bg-gray-950/40 backdrop-blur-xl p-8 flex flex-col justify-end items-start transition-all duration-300 group-hover:border-white/20 group-hover:shadow-2xl group-hover:bg-gray-900/60">

                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center mb-6 ${item.iconBg} group-hover:scale-110 transition-transform duration-300 ease-out`}>
                    <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                  </div>

                  <h3 className="font-bold text-2xl text-white mb-3 relative z-10 tracking-wide">
                    {item.title}
                  </h3>

                  <p className="font-normal text-base text-slate-400 leading-relaxed relative z-10 group-hover:text-slate-300 transition-colors duration-300">
                    {i === 0 && "Add your vehicles and document every modification with stunning detail."}
                    {i === 1 && "Your personalized carfolio.io URL becomes the single source for your entire build."}
                    {i === 2 && "Connect affiliate links to the parts you trust and turn your passion into a paycheck."}
                  </p>

                  <Meteors number={15} className="opacity-50" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50/60 to-blue-50/60 dark:from-slate-900/60 dark:to-blue-950/60"></div>
        </div>

        <div className="mx-auto max-w-5xl space-y-12 px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative z-10 grid items-center gap-4 md:grid-cols-2 md:gap-12"
          >
            <h2 className="text-4xl font-semibold text-slate-900 dark:text-white">A Gallery for Your Garage</h2>
            <p className="max-w-sm sm:ml-auto text-slate-700 dark:text-slate-300">Every build is a journey. CarFolio gives you the canvas to tell its story with cinematic galleries, detailed modification lists, and complete build histories.</p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />



      {/* FAQ Section */}
      <FAQs />

      {/* Final CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white overflow-x-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-6 text-white"
          >
            Ready to Turn Your Car Knowledge Into Income?
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white/10 dark:bg-white/5 rounded-lg p-6 mb-8 text-left max-w-md mx-auto border border-white/20"
          >
            <h3 className="font-semibold mb-4 text-white">What happens next:</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold mr-3 text-white">1</div>
                <span className="text-white">Start your free trial - No credit card required</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold mr-3 text-white">2</div>
                <span className="text-white">Build your first showcase - Our templates make it easy</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold mr-3 text-white">3</div>
                <span className="text-white">Share your professional link - Start earning from day one</span>
              </div>
            </div>
          </motion.div>

          <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-50 dark:bg-white dark:text-blue-600 dark:hover:bg-slate-100 text-base sm:text-lg px-4 sm:px-8 py-2 sm:py-4 mb-6 whitespace-normal h-auto">
            Start Building Your Portfolio - Free
            <ArrowRight className="ml-2 h-5 w-5 flex-shrink-0" />
          </Button>

          <p className="text-sm opacity-75 text-white">
            14-day free trial • No setup fees • Cancel anytime
          </p>
        </div>
      </section>

      {/* CarFolio Footer */}
      <Footer />
    </div>
  );
};

export default Index;
