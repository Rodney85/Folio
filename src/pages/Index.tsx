import { HeroSection } from '@/components/ui/hero-section-1'
import { Features } from '@/components/ui/features-6'
import DatabaseWithRestApi from '@/components/ui/database-with-rest-api'
import { Meteors } from '@/components/ui/meteors'
import Testimonials from '@/components/ui/testimonials'
import FAQs from '@/components/ui/faq'
import { Pricing6 } from '@/components/ui/pricing-6'
import { Tab } from '@/components/ui/pricing-tab'
import { Footer } from '@/components/ui/footer-section'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Star, DollarSign, BarChart3, Share2, Settings, Car, Trophy, ArrowRight, Menu, X, Squirrel } from "lucide-react";
import { useState, useEffect } from "react";

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState("monthly");
  
  useEffect(() => {
    // Check if we're on a mobile device based on viewport width
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const pricingPlans = [
    {
      name: "Starter",
      price: "$9.99",
      period: "month",
      description: "Perfect for getting started",
      features: [
        "3 vehicle showcases",
        "Unlimited affiliate links",
        "Basic analytics dashboard",
        "Mobile-optimized sharing",
        "Standard support",
        "carfolio.com/yourname URL"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Pro",
      price: "$19.99",
      period: "month",
      description: "Most Popular - Save 60% annually",
      features: [
        "Unlimited vehicle showcases",
        "Advanced analytics & reporting",
        "Custom domain support",
        "Priority customer support",
        "Remove CarFolio branding",
        "Exclusive affiliate partnerships",
        "Professional templates"
      ],
      cta: "Start Free Trial",
      popular: true,
      yearlyPrice: "$199/year (Save $40)"
    },
    {
      name: "Business",
      price: "$39.99",
      period: "month",
      description: "For automotive professionals",
      features: [
        "Everything in Pro Plan",
        "Team collaboration features",
        "White-label customization",
        "Dedicated account manager",
        "Priority feature requests",
        "Custom integrations",
        "Advanced SEO tools"
      ],
      cta: "Contact Sales",
      popular: false,
      yearlyPrice: "$399/year (Save $80)"
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
    <div className="min-h-screen bg-background">
      <HeroSection />
      
      {/* Combined Section: Pain Point, How it Works, and Solution */}
      <section className="py-12 sm:py-16 lg:py-20 bg-slate-900 dark:bg-slate-950 text-white">
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

          {/* CarFolio Meteor Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Build Your Folio Card */}
            <div className="w-full relative max-w-xs mx-auto">
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-teal-500 transform scale-[0.80] rounded-full blur-3xl" />
              <div className="relative shadow-xl bg-gray-900 border border-gray-800 px-4 py-8 h-full overflow-hidden rounded-2xl flex flex-col justify-end items-start">
                <div className="h-5 w-5 rounded-full border flex items-center justify-center mb-4 border-gray-500">
                  <Car className="h-2 w-2 text-gray-300" />
                </div>
                <h1 className="font-bold text-xl text-white mb-4 relative z-50">
                  Build Your Folio
                </h1>
                <p className="font-normal text-base text-slate-500 mb-4 relative z-50">
                  Add your vehicles and document every modification with stunning detail. Create a professional showcase for your automotive passion.
                </p>
                <button className="border px-4 py-1 rounded-lg border-gray-500 text-gray-300">
                  Start Building
                </button>
                <Meteors number={20} />
              </div>
            </div>

            {/* Share Your Link Card */}
            <div className="w-full relative max-w-xs mx-auto">
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-purple-500 to-pink-500 transform scale-[0.80] rounded-full blur-3xl" />
              <div className="relative shadow-xl bg-gray-900 border border-gray-800 px-4 py-8 h-full overflow-hidden rounded-2xl flex flex-col justify-end items-start">
                <div className="h-5 w-5 rounded-full border flex items-center justify-center mb-4 border-gray-500">
                  <Share2 className="h-2 w-2 text-gray-300" />
                </div>
                <h1 className="font-bold text-xl text-white mb-4 relative z-50">
                  Share Your Link
                </h1>
                <p className="font-normal text-base text-slate-500 mb-4 relative z-50">
                  Your personalized carfolio.io URL becomes the single source for your entire build. One link, endless possibilities.
                </p>
                <button className="border px-4 py-1 rounded-lg border-gray-500 text-gray-300">
                  Get Your Link
                </button>
                <Meteors number={20} />
              </div>
            </div>

            {/* Monetize Your Influence Card */}
            <div className="w-full relative max-w-xs mx-auto">
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-orange-500 to-red-500 transform scale-[0.80] rounded-full blur-3xl" />
              <div className="relative shadow-xl bg-gray-900 border border-gray-800 px-4 py-8 h-full overflow-hidden rounded-2xl flex flex-col justify-end items-start">
                <div className="h-5 w-5 rounded-full border flex items-center justify-center mb-4 border-gray-500">
                  <DollarSign className="h-2 w-2 text-gray-300" />
                </div>
                <h1 className="font-bold text-xl text-white mb-4 relative z-50">
                  Monetize Your Influence
                </h1>
                <p className="font-normal text-base text-slate-500 mb-4 relative z-50">
                  Connect affiliate links to the parts you trust and turn your passion into a paycheck. Earn from every recommendation.
                </p>
                <button className="border px-4 py-1 rounded-lg border-gray-500 text-gray-300">
                  Start Earning
                </button>
                <Meteors number={20} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* Gallery Section */}
      <section className="py-16 md:py-32 relative overflow-hidden">
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
          <div className="relative z-10 grid items-center gap-4 md:grid-cols-2 md:gap-12">
            <h2 className="text-4xl font-semibold text-slate-900 dark:text-white">A Gallery for Your Garage</h2>
            <p className="max-w-sm sm:ml-auto text-slate-700 dark:text-slate-300">Every build is a journey. CarFolio gives you the canvas to tell its story with cinematic galleries, detailed modification lists, and complete build histories.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Pricing Section */}
      <section className="py-32">
        <div className="container max-w-5xl mx-auto px-4 md:px-6">
          <div className="mx-auto flex flex-col items-center gap-6 text-center">
            <h2 className="text-4xl font-semibold text-pretty lg:text-6xl">
              Simple, powerful pricing
            </h2>
            <p className="max-w-md text-muted-foreground lg:text-xl">
              No confusing tiers or feature gates. Get everything you need to showcase and monetize your builds.
            </p>
            
            {/* Pricing Tabs */}
            <div className="flex w-fit rounded-full bg-muted p-1 mb-6">
              <Tab
                text="monthly"
                selected={selectedPricing === "monthly"}
                setSelected={setSelectedPricing}
                discount={false}
              />
              <Tab
                text="yearly"
                selected={selectedPricing === "yearly"}
                setSelected={setSelectedPricing}
                discount={true}
              />
            </div>
            
            <div className="mx-auto flex w-full flex-col rounded-lg border p-6 sm:w-fit sm:min-w-80">
              <div className="flex justify-center">
                <span className="text-lg font-semibold">$</span>
                <span className="text-6xl font-semibold">
                  {selectedPricing === "monthly" ? "29.99" : "299.99"}
                </span>
                <span className="self-end text-muted-foreground">
                  {selectedPricing === "monthly" ? "/month" : "/year"}
                </span>
              </div>
              {selectedPricing === "monthly" && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  <span className="line-through">$35.00</span> Regular price
                </p>
              )}
              {selectedPricing === "yearly" && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  <span className="line-through">$359.88</span> Regular price
                </p>
              )}
              <div className="my-6">
                <div>
                  <ul className="flex flex-col gap-3">
                    <li className="flex items-center justify-between gap-2 text-sm font-medium">
                      Unlimited vehicle showcases <CheckCircle className="inline size-4 shrink-0" />
                    </li>
                    <li className="flex items-center justify-between gap-2 text-sm font-medium">
                      Unlimited affiliate links <CheckCircle className="inline size-4 shrink-0" />
                    </li>
                    <li className="flex items-center justify-between gap-2 text-sm font-medium">
                      Downloadable QR codes <CheckCircle className="inline size-4 shrink-0" />
                    </li>
                  </ul>
                  <Separator className="my-6" />
                </div>
                <div>
                  <ul className="flex flex-col gap-3">
                    <li className="flex items-center justify-between gap-2 text-sm font-medium">
                      Advanced analytics dashboard <CheckCircle className="inline size-4 shrink-0" />
                    </li>
                    <li className="flex items-center justify-between gap-2 text-sm font-medium">
                      Custom domain support <CheckCircle className="inline size-4 shrink-0" />
                    </li>
                    <li className="flex items-center justify-between gap-2 text-sm font-medium">
                      Mobile-optimized sharing <CheckCircle className="inline size-4 shrink-0" />
                    </li>
                  </ul>
                  <Separator className="my-6" />
                </div>
                <div>
                  <ul className="flex flex-col gap-3">
                    <li className="flex items-center justify-between gap-2 text-sm font-medium">
                      Keep all your affiliate income <CheckCircle className="inline size-4 shrink-0" />
                    </li>
                    <li className="flex items-center justify-between gap-2 text-sm font-medium">
                      Priority support <CheckCircle className="inline size-4 shrink-0" />
                    </li>
                    <li className="flex items-center justify-between gap-2 text-sm font-medium">
                      14-day free trial <CheckCircle className="inline size-4 shrink-0" />
                    </li>
                  </ul>
                </div>
              </div>
              <Button>Start Your 14-Day Free Trial</Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQs />

      {/* Final CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Turn Your Car Knowledge Into Income?
          </h2>
          
          <div className="bg-white/10 dark:bg-white/5 rounded-lg p-6 mb-8 text-left max-w-md mx-auto border border-white/20">
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
          </div>
          
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
