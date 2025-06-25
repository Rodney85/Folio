import React from 'react';
import { ArrowRight, Menu, X, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedGroup } from '@/components/ui/animated-group';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 12
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        type: 'spring' as const,
        bounce: 0.3,
        duration: 1.5
      }
    }
  }
};

export function HeroSection() {
  return <>
            <HeroHeader />
            <main className="overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
                <div aria-hidden className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(220,100%,85%,.08)_0,hsla(220,100%,55%,.02)_50%,hsla(220,100%,45%,0)_80%)] dark:bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(220,100%,25%,.12)_0,hsla(220,100%,15%,.04)_50%,hsla(220,100%,5%,0)_80%)]" />
                    <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(220,100%,85%,.06)_0,hsla(220,100%,45%,.02)_80%,transparent_100%)] dark:bg-[radial-gradient(50%_50%_at_50%_50%,hsla(220,100%,25%,.08)_0,hsla(220,100%,15%,.03)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(220,100%,85%,.04)_0,hsla(220,100%,45%,.02)_80%,transparent_100%)] dark:bg-[radial-gradient(50%_50%_at_50%_50%,hsla(220,100%,25%,.06)_0,hsla(220,100%,15%,.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <div className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                        <span className="text-foreground text-sm">Turn Your Car Knowledge Into Income</span>
                                        <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                                        <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                        
                                    <h1 className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem] font-bold text-slate-900 dark:text-white leading-tight">
                                        Stop Giving Away Your
                                        <span className="block text-blue-600 dark:text-blue-400">Car Expertise for Free</span>
                                    </h1>
                                    <p className="mx-auto mt-8 max-w-2xl text-balance text-lg text-slate-600 dark:text-slate-300">
                                        The professional platform where automotive enthusiasts create stunning digital showcases for their builds, organize parts lists, and earn affiliate commissions with every recommendation.
                                    </p>
                                    <p className="mx-auto mt-6 max-w-xl text-base text-slate-500 dark:text-slate-400">
                                        Like Linktree, but built specifically for car enthusiasts. One clean link showcases your entire build with organized, shoppable parts lists.
                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup variants={{
                item: transitionVariants.item,
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75
                    }
                  }
                }
              }} className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                    <div className="bg-foreground/10 rounded-[14px] border p-0.5">
                                        <Link to="/sign-up">
                                          <Button size="lg" className="rounded-xl px-5 text-base bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                                              <span className="text-nowrap">Start Building Your Portfolio - Free</span>
                                              <ArrowRight className="ml-2 h-5 w-5" />
                                          </Button>
                                        </Link>
                                    </div>
                                    <Button size="lg" variant="ghost" className="h-10.5 rounded-xl px-5 hover:bg-slate-100 dark:hover:bg-slate-800">
                                        <span className="text-nowrap">See Example Portfolio</span>
                                    </Button>
                                </AnimatedGroup>

                                <div className="mt-8 flex flex-wrap justify-center items-center gap-8 text-sm text-slate-500 dark:text-slate-400">
                                    <div className="flex items-center">
                                        <div className="h-2 w-2 bg-green-500 rounded-full mr-2" />
                                        14-day free trial
                                    </div>
                                    <div className="flex items-center">
                                        <div className="h-2 w-2 bg-green-500 rounded-full mr-2" />
                                        No credit card required
                                    </div>
                                    <div className="flex items-center">
                                        <div className="h-2 w-2 bg-green-500 rounded-full mr-2" />
                                        Cancel anytime
                                    </div>
                                </div>
                            </div>
                        </div>

                        <AnimatedGroup variants={{
            item: transitionVariants.item,
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.75
                }
              }
            }
          }}>
                            <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                                
                                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border shadow-lg shadow-zinc-950/15 ring-1 p-4">
                                    <div className="aspect-15/8 relative bg-gradient-to-br from-blue-900 to-slate-900 dark:from-blue-950 dark:to-slate-950 rounded-2xl flex items-center justify-center">
                                        <div className="text-white text-center">
                                            <Car className="mx-auto mb-4 h-16 w-16" />
                                            <h3 className="text-2xl font-bold mb-2">CarFolio Dashboard Preview</h3>
                                            <p className="text-blue-200 dark:text-blue-300">Professional car portfolio management</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
            </main>
        </>;
}

const menuItems = [{
  name: 'Features',
  href: '#features'
}, {
  name: 'Pricing',
  href: '#pricing'
}, {
  name: 'Success Stories',
  href: '#testimonials'
}, {
  name: 'About',
  href: '#about'
}];

const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return <header>
            <nav data-state={menuState && 'active'} className="fixed z-20 w-full px-2 group">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <div className="flex items-center space-x-2">
                                <Car className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                <span className="text-xl font-bold text-slate-900 dark:text-white">CarFolio</span>
                            </div>

                            <div className="flex items-center gap-2 lg:hidden">
                                <ThemeToggle />
                                <button onClick={() => setMenuState(!menuState)} aria-label={menuState == true ? 'Close Menu' : 'Open Menu'} className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5">
                                    <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                    <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                                </button>
                            </div>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-sm">
                                {menuItems.map((item, index) => <li key={index}>
                                        <a href={item.href} className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                            <span>{item.name}</span>
                                        </a>
                                    </li>)}
                            </ul>
                        </div>

                        <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 dark:shadow-zinc-950/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => <li key={index}>
                                            <a href={item.href} className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </a>
                                        </li>)}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:items-center">
                                <div className="hidden lg:block">
                                    <ThemeToggle />
                                </div>
                                <Link to="/sign-in">
                                  <Button variant="outline" size="sm" className={cn(isScrolled && 'lg:hidden')}>
                                      <span>Sign In</span>
                                  </Button>
                                </Link>
                                <Link to="/sign-up">
                                  <Button size="sm" className={cn(isScrolled && 'lg:hidden', 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600')}>
                                      <span>Sign Up</span>
                                  </Button>
                                </Link>
                                <Link to="/sign-up">
                                  <Button size="sm" className={cn(isScrolled ? 'lg:inline-flex' : 'hidden', 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600')}>
                                      <span>Get Started</span>
                                  </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>;
};