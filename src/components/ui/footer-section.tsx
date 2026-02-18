'use client';
import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Instagram, Twitter, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

const footerLinks = [
	{
		label: 'Platform',
		links: [
			{ title: 'Showcase', href: '/#feature', isExternal: false },
			{ title: 'Pricing', href: '/#pricing', isExternal: false },

			{ title: 'Sign In', href: '/sign-in', isExternal: false },
		],
	},
	{
		label: 'Company',
		links: [
			{ title: 'About', href: '/about', isExternal: false },
		],
	},
	{
		label: 'Legal',
		links: [
			{ title: 'Terms', href: '/terms', isExternal: false },
			{ title: 'Privacy', href: '/privacy', isExternal: false },
		],
	},
];

export function Footer() {
	return (
		<footer className="bg-background border-t border-white/5 pt-20 pb-10">
			<div className="mx-auto max-w-7xl px-6">
				<div className="grid grid-cols-2 md:grid-cols-12 gap-12 mb-20">
					<div className="col-span-2 md:col-span-5 space-y-6">
						<AnimatedContainer>
							<Link to="/" className="block">
								<span className="font-heading font-bold text-3xl tracking-tight text-white">CarFolio.</span>
							</Link>
							<p className="text-slate-400 max-w-sm mt-4 leading-relaxed">
								The professional standard for automotive documentation.
								Built for enthusiasts, by enthusiasts.
							</p>
							<div className="flex gap-4 mt-8">
								<SocialLink href="#" icon={<Twitter className="w-5 h-5" />} />
								<SocialLink href="#" icon={<Instagram className="w-5 h-5" />} />
								<SocialLink href="#" icon={<Youtube className="w-5 h-5" />} />
							</div>
						</AnimatedContainer>
					</div>

					<div className="col-span-2 md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-4">
						{footerLinks.map((section) => (
							<div key={section.label} className="space-y-6">
								<h4 className="text-sm font-semibold text-white uppercase tracking-wider">{section.label}</h4>
								<ul className="space-y-4">
									{section.links.map((link) => (
										<li key={link.title}>
											{link.isExternal || link.href.startsWith('#') ? (
												<a
													href={link.href}
													className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
												>
													{link.title}
												</a>
											) : (
												<Link
													to={link.href}
													className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
												>
													{link.title}
												</Link>
											)}
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>

				<div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
					<p className="text-slate-500 text-sm">
						© {new Date().getFullYear()} CarFolio Inc. All rights reserved.
					</p>
					<div className="flex gap-8">
						<div className="w-2 h-2 rounded-full bg-emerald-500/20 flex items-center justify-center">
							<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
						</div>
						<span className="text-xs text-slate-500 font-mono">SYSTEM NORMAL</span>
					</div>
				</div>
			</div>
		</footer>
	);
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-110"
		>
			{icon}
		</a>
	)
}

type ViewAnimationProps = {
	delay?: number;
	className?: ComponentProps<typeof motion.div>['className'];
	children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
	const shouldReduceMotion = useReducedMotion();

	if (shouldReduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
			whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.8 }}
			className={className}
		>
			{children}
		</motion.div>
	);
}
