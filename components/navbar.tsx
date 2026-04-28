"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import GooeyNav from "@/components/GooeyNav";

const navItems = [
    { label: "See Demo", href: "#demo" },
    { label: "Contact", href: "#contact" }
];

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl"
        >
            <nav className="relative flex items-center justify-between px-4 py-3 rounded-full bg-zinc-900/40 backdrop-blur-md border border-zinc-800">
                {/* Logo */}
                <a href="#" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                        <span className="text-zinc-950 font-bold text-sm">
                            A
                        </span>
                    </div>
                    <span className="font-semibold text-white hidden sm:block">
                        AI project
                    </span>
                </a>

                <h1 className="absolute left-1/2 -translate-x-1/2 text-sm sm:text-base font-semibold text-white/90 tracking-wide pointer-events-none">
                    Human emotion detector
                </h1>

                {/* Desktop Nav Items */}
                <div className="hidden md:block relative z-10">
                    <GooeyNav
                        items={navItems}
                        particleCount={22}
                        particleDistances={[44, 12]}
                        particleR={40}
                        initialActiveIndex={0}
                        animationTime={480}
                        timeVariance={300}
                        colors={[1, 2, 3, 1, 4, 2, 3, 1]}
                    />
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-zinc-400 hover:text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 p-4 rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-zinc-800"
                >
                    <div className="flex flex-col gap-2">
                        {navItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.header>
    );
}
