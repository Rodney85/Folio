import * as React from "react"
import { cn } from '@/lib/utils'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

const menuItems = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'Solution', href: '#solution', id: 'solution' },
    { name: 'Features', href: '#feature', id: 'feature' },
    { name: 'Pricing', href: '#pricing', id: 'pricing' },
]

export const NavBar = () => {
    const [menuState, setMenuState] = React.useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const isHomePage = location.pathname === '/'

    const handleNavClick = (item: typeof menuItems[0]) => {
        if (isHomePage) {
            // On homepage — smooth scroll to section
            const element = document.getElementById(item.id === 'home' ? 'hero-section' : item.id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            // On other pages — navigate to homepage with hash
            navigate(`/#${item.id === 'home' ? 'hero-section' : item.id}`);
        }
        setMenuState(false);
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-[9999] w-full">
            <nav
                data-state={menuState ? 'active' : ''}
                className="group w-full border-b border-white/5 bg-[#0D0D12]/80 backdrop-blur-xl shadow-lg transition-all duration-300">
                <div className="m-auto max-w-5xl px-6">
                    <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                to="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <Logo />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent z-40">
                            <div className="lg:pr-4">
                                <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <button
                                                onClick={() => handleNavClick(item)}
                                                className="text-slate-400 hover:text-white transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] block">
                                                <span>{item.name}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-400 hover:text-white">
                                    <Link to="/sign-in">
                                        <span>Sign In</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm"
                                    className="bg-white text-black hover:bg-slate-200 font-semibold shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all duration-300">
                                    <Link to="/sign-up">
                                        <span>Get Started</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
