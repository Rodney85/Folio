import { FeatureCarousel } from "./animated-feature-carousel";

export function CarFolioFeatureCarousel() {
  // Automotive-focused images for each step
  const images = {
    alt: "CarFolio platform features",
    // Step 1: Create Your Digital Car Card - Car showcase images
    step1img1: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1740&auto=format&fit=crop", // BMW sports car
    step1img2: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1740&auto=format&fit=crop", // Car dashboard/interior
    
    // Step 2: Build Your Parts List - Automotive parts and tools
    step2img1: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1740&auto=format&fit=crop", // Car engine/parts
    step2img2: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1740&auto=format&fit=crop", // Car tools/workshop
    
    // Step 3: Share Your Professional Link - Social sharing/mobile
    step3img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1740&auto=format&fit=crop", // Mobile phone with car content
    
    // Step 4: Earn Affiliate Commissions - Money/success
    step4img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1740&auto=format&fit=crop", // Success/money concept
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-50 to-slate-50 dark:from-slate-900 dark:to-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold text-foreground mb-6">
            Introducing CarFolio: Professional Car Portfolios That Actually Make Money
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The Simple 4-Step Process
          </p>
        </div>
        
        <FeatureCarousel image={images} />
      </div>
    </section>
  );
}
