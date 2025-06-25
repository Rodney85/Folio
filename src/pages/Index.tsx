
import { HeroSection } from "@/components/HeroSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Star, DollarSign, BarChart3, Share2, Settings, Car, Trophy, ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      
      {/* Problem Section */}
      <section className="py-20 bg-slate-900 dark:bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">We've All Been There...</h2>
          
          <p className="text-xl mb-8 text-slate-300 dark:text-slate-400">
            You post your latest build on Instagram or TikTok. The comments explode:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {[
              "What wheels are those?",
              "Turbo kit specs?",
              "Where'd you get that front bumper?",
              "Drop the parts list!"
            ].map((comment, index) => (
              <div key={index} className="bg-slate-800 dark:bg-slate-900 p-4 rounded-lg text-left border border-slate-700 dark:border-slate-800">
                <p className="text-slate-300 dark:text-slate-400 italic">"{comment}"</p>
              </div>
            ))}
          </div>
          
          <p className="text-lg text-slate-300 dark:text-slate-400 mb-6">
            So you spend 30 minutes typing out part numbers, links, and specs in the comments. 
            <span className="text-orange-400 font-semibold"> And earn absolutely nothing for sharing your hard-earned knowledge.</span>
          </p>
          
          <p className="text-lg text-slate-300 dark:text-slate-400 mb-8">
            Meanwhile, your post gets buried in the algorithm, and next week someone asks the exact same questions.
          </p>
          
          <p className="text-2xl font-bold text-orange-400">
            Your expertise is valuable. It's time to get paid for it.
          </p>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-slate-50 dark:from-slate-900 dark:to-blue-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Introducing CarFolio: Professional Car Portfolios That Actually Make Money
            </h2>
            <p className="text-xl text-muted-foreground">The Simple 4-Step Process</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Create Your Digital Car Card",
                description: "Upload photos, add specifications, and document your modification history. Our professional templates make every build look incredible."
              },
              {
                step: "2", 
                title: "Build Your Parts List",
                description: "Add every component with direct purchase links. From turbo kits to wheel spacers - organize everything in one place."
              },
              {
                step: "3",
                title: "Share Your Professional Link", 
                description: "Get a clean, branded URL: carfolio.com/yourname/project-car Perfect for Instagram bio, forum signatures, YouTube descriptions."
              },
              {
                step: "4",
                title: "Earn Affiliate Commissions",
                description: "When someone buys parts through your recommendations, you earn. Turn your build knowledge into passive income."
              }
            ].map((item, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow bg-card border-border">
                <CardContent className="p-6">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold text-xl rounded-bl-2xl">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-3 pr-8">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Everything You Need to Showcase and Monetize Your Builds
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400 mr-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Real Results from Real Automotive Enthusiasts
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-orange-400 text-orange-400" />
                    ))}
                  </div>
                  <blockquote className="text-muted-foreground mb-6 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="border-t border-border pt-4">
                    <p className="font-semibold text-card-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.car}, {testimonial.location}</p>
                    <div className="mt-2">
                      {testimonial.earnings && (
                        <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                          {testimonial.earnings}
                        </Badge>
                      )}
                      {testimonial.followers && (
                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                          {testimonial.followers}
                        </Badge>
                      )}
                      {testimonial.partnerships && (
                        <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300">
                          {testimonial.partnerships}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Results Dashboard Preview */}
          <div className="mt-16 bg-slate-900 dark:bg-slate-950 rounded-2xl p-8 text-white border border-slate-800 dark:border-slate-700">
            <h3 className="text-xl font-bold mb-6 text-center text-white">This Month's Top Performers</h3>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl mb-2">🥇</div>
                <p className="font-semibold text-white">Mike's S2000 Build</p>
                <p className="text-green-400">$127 in commissions</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🥈</div>
                <p className="font-semibold text-white">Sarah's F-150 Setup</p>
                <p className="text-green-400">$89 in commissions</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🥉</div>
                <p className="font-semibold text-white">Alex's Drift Build</p>
                <p className="text-green-400">$76 in commissions</p>
              </div>
            </div>
            
            <Separator className="bg-slate-700 dark:bg-slate-600 mb-6" />
            
            <h4 className="font-semibold mb-4 text-white">Most Clicked Parts:</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-300 dark:text-slate-400">• Coilovers (BC Racing)</span>
                <span className="text-orange-400">47 clicks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 dark:text-slate-400">• Wheels (BBS)</span>
                <span className="text-orange-400">33 clicks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 dark:text-slate-400">• Turbo Kits (Garrett)</span>
                <span className="text-orange-400">28 clicks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Choose Your Plan
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative hover:shadow-lg transition-shadow bg-card border-border ${plan.popular ? 'border-blue-500 border-2' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-card-foreground mb-2">{plan.name}</h3>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-card-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                    {plan.yearlyPrice && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">{plan.yearlyPrice}</p>
                    )}
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <h3 className="text-2xl font-bold text-foreground mb-4">30-Day Risk-Free Trial</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Try CarFolio completely risk-free. If you're not earning more from your automotive knowledge within 30 days, we'll refund every penny. No questions asked.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h2>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow bg-card border-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-card-foreground mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Turn Your Car Knowledge Into Income?
          </h2>
          
          <p className="text-xl mb-8 opacity-90 text-white">
            Join 2,500+ automotive enthusiasts who've already built their professional car portfolios.
          </p>
          
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
          
          <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-50 dark:bg-white dark:text-blue-600 dark:hover:bg-slate-100 text-lg px-8 py-4 mb-6">
            Start Building Your Portfolio - Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <p className="text-sm opacity-75 text-white">
            14-day free trial • No setup fees • Cancel anytime
          </p>
        </div>
      </section>

      {/* Trust Signals Footer */}
      <footer className="py-16 bg-slate-900 dark:bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-8 text-white">Trusted by the Automotive Community</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-12">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">2,500+</div>
                <div className="text-sm text-slate-400">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">4.9/5</div>
                <div className="text-sm text-slate-400">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">$50,000+</div>
                <div className="text-sm text-slate-400">Earned by Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">🔒</div>
                <div className="text-sm text-slate-400">Bank-Level Security</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">📱</div>
                <div className="text-sm text-slate-400">Mobile Optimized</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">🌍</div>
                <div className="text-sm text-slate-400">Global Shipping</div>
              </div>
            </div>
          </div>
          
          <Separator className="bg-slate-700 dark:bg-slate-600 mb-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Car className="h-8 w-8 text-orange-600 dark:text-orange-500" />
              <span className="ml-2 text-xl font-bold text-white">CarFolio</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-slate-400 mb-2">
                <strong className="text-white">Partnered with:</strong> Amazon Associates, Summit Racing, FCP Euro, Tire Rack, AutoZone, RockAuto, 1A Auto, CARiD, and 40+ more retailers.
              </p>
              <p className="text-xs text-slate-500">
                © 2024 CarFolio. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
