"use client"

import React, { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { LucideIcon, Menu, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"

interface DropdownItem {
  name: string
  url: string
  description?: string
}

interface NavItem {
  name: string
  url?: string
  icon?: LucideIcon
  dropdown?: DropdownItem[]
}

interface CleanNavBarProps {
  items: NavItem[]
  className?: string
  showAuth?: boolean
  ctaText?: string
  ctaLink?: string
}

export function CleanNavBar({ 
  items, 
  className, 
  showAuth = true,
  ctaText = "Get Started",
  ctaLink = "/sign-up"
}: CleanNavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Handle mobile menu toggle
  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle escape key and body overflow for mobile menu
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsMenuOpen(false)
        setOpenDropdown(null)
      }
    }

    function onClickOutside(e: MouseEvent) {
      if (!menuRef.current) return
      if (menuRef.current.contains(e.target as Node)) return
      setIsMenuOpen(false)
    }

    if (isMenuOpen) {
      document.addEventListener('keydown', onKey)
      document.addEventListener('click', onClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClickOutside)
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  return (
    <>
      <nav className={cn(
        "flex items-center justify-between p-4 md:px-16 lg:px-24 xl:px-32 md:py-6 w-full relative z-50",
        className
      )}>
        {/* Logo */}
        <Link to="/" className="flex items-center" aria-label="CarFolio home">
          <Logo size="sm" />
        </Link>

        {/* Desktop Navigation */}
        <div
          ref={menuRef}
          className={cn(
            "max-md:absolute max-md:top-0 max-md:left-0 max-md:transition-all max-md:duration-300 max-md:overflow-hidden max-md:h-screen max-md:bg-background/95 max-md:backdrop-blur-lg",
            "flex items-center gap-8 font-medium",
            "max-md:flex-col max-md:justify-center max-md:z-40",
            isMenuOpen ? "max-md:w-full" : "max-md:w-0"
          )}
          aria-hidden={!isMenuOpen}
        >
          {items.map((item) => (
            <div key={item.name} className="relative">
              {item.dropdown ? (
                // Dropdown menu item
                <div 
                  className="relative group flex items-center gap-1 cursor-pointer"
                  onMouseEnter={() => setOpenDropdown(item.name)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {item.name}
                  </span>
                  <ChevronDown 
                    className={cn(
                      "w-4 h-4 transition-transform",
                      openDropdown === item.name && "rotate-180"
                    )} 
                  />
                  
                  {/* Dropdown menu */}
                  <AnimatePresence>
                    {openDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bg-background border border-border font-normal flex flex-col gap-1 w-max rounded-lg p-2 top-full left-0 mt-2 shadow-lg z-50"
                      >
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            to={dropdownItem.url}
                            className="px-3 py-2 rounded-md hover:bg-muted hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                            onClick={() => {
                              setOpenDropdown(null)
                              setIsMenuOpen(false)
                            }}
                          >
                            <div className="font-medium">{dropdownItem.name}</div>
                            {dropdownItem.description && (
                              <div className="text-xs text-muted-foreground">
                                {dropdownItem.description}
                              </div>
                            )}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // Regular menu item
                <Link
                  to={item.url || "#"}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}

          {/* Mobile Menu Close Button */}
          <button
            onClick={() => setIsMenuOpen(false)}
            className="md:hidden bg-slate-800 hover:bg-black text-white p-2 rounded-md aspect-square font-medium transition"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Desktop CTA Button */}
          <Button
            asChild
            className="hidden md:flex bg-slate-800 hover:bg-black text-white px-6 py-3 rounded-full font-medium transition"
          >
            <Link to={ctaLink}>
              {ctaText}
            </Link>
          </Button>

          {/* Desktop Auth Buttons */}
          {showAuth && (
            <div className="hidden lg:flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/sign-in">Sign In</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={handleMenuToggle}
            className="md:hidden bg-slate-800 hover:bg-black text-white p-2 rounded-md aspect-square font-medium transition"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>
    </>
  )
}
