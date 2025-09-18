"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { LucideIcon, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  showAuth?: boolean
}

export function NavBar({ items, className, showAuth = true }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isMobile, setIsMobile] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleNavClick = (name: string) => {
    setActiveTab(name)
    setIsMenuOpen(false)
  }

  return (
    <>
      <div
        className={cn(
          "fixed top-0 left-1/2 -translate-x-1/2 z-50 pt-6 w-full max-w-6xl px-4",
          className,
        )}
      >
        <div className="flex items-center justify-between w-full bg-background/5 border border-border backdrop-blur-lg py-2 px-4 rounded-full shadow-lg lg:bg-transparent lg:border-0 lg:backdrop-blur-none lg:shadow-none lg:py-0 lg:px-0">
          {/* Logo - Outside tubelight */}
          <Link to="/" className="flex items-center">
            <Logo size="sm" />
          </Link>

          {/* Desktop Navigation Items - Center with tubelight background */}
          <div className="hidden lg:flex items-center gap-3 bg-background/5 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.name

              return (
                <Link
                  key={item.name}
                  to={item.url}
                  onClick={() => setActiveTab(item.name)}
                  className={cn(
                    "relative cursor-pointer text-sm font-semibold px-4 py-2 rounded-full transition-colors",
                    "text-foreground/80 hover:text-primary",
                    isActive && "bg-muted text-primary",
                  )}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="lamp"
                      className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                        <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                        <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                        <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                      </div>
                    </motion.div>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right side - Auth buttons for desktop, Hamburger for mobile/tablet */}
          <div className="flex items-center gap-2">
            {/* Desktop Auth Buttons - Outside tubelight */}
            {showAuth && (
              <div className="hidden lg:flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/sign-in">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                  <Link to="/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile/Tablet Hamburger Menu */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMenuToggle}
              className="lg:hidden p-2"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 w-full h-screen bg-background/95 backdrop-blur-lg z-40 lg:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              {/* Mobile Navigation Items */}
              <div className="flex flex-col items-center space-y-6">
                {items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.name

                  return (
                    <Link
                      key={item.name}
                      to={item.url}
                      onClick={() => handleNavClick(item.name)}
                      className={cn(
                        "flex items-center gap-3 text-xl font-semibold py-3 px-6 rounded-full transition-colors",
                        "text-foreground/80 hover:text-primary",
                        isActive && "bg-muted text-primary",
                      )}
                    >
                      <Icon size={24} strokeWidth={2.5} />
                      {item.name}
                    </Link>
                  )
                })}
              </div>

              {/* Mobile Auth Buttons */}
              {showAuth && (
                <div className="flex flex-col items-center space-y-4 pt-8">
                  <Button asChild variant="outline" size="lg" className="w-48">
                    <Link to="/sign-in" onClick={() => setIsMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild size="lg" className="w-48 bg-blue-600 hover:bg-blue-700">
                    <Link to="/sign-up" onClick={() => setIsMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
