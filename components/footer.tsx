"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import BorderGlow from "@/components/BorderGlow";

export function Footer() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <footer ref={ref} className="border-t border-zinc-800 bg-zinc-950">
            <div className="max-w-6xl mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <BorderGlow
                        edgeSensitivity={26}
                        glowColor="250 84 78"
                        backgroundColor="#18181b"
                        borderRadius={24}
                        glowRadius={34}
                        glowIntensity={0.85}
                        coneSpread={22}
                        animated={false}
                        colors={["#a78bfa", "#818cf8", "#38bdf8"]}
                    >
                        <section className="p-8 sm:p-10 text-center rounded-3xl">
                            <p className="text-xs tracking-[0.2em] uppercase text-zinc-500 mb-3">
                                Final Step
                            </p>
                            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                Ready to Detect Human Emotions?
                            </h3>
                            <p className="text-zinc-300 max-w-2xl mx-auto mb-7 leading-relaxed">
                                Upload an image, run instant emotion analysis,
                                and connect with our team if you want to extend
                                this project for your own use case.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <a
                                    href="#demo"
                                    className="w-full sm:w-auto rounded-full bg-white text-zinc-950 hover:bg-zinc-200 px-6 h-11 inline-flex items-center justify-center font-medium transition-colors"
                                >
                                    Upload Image
                                </a>
                                <a
                                    href="#contact"
                                    className="w-full sm:w-auto rounded-full border border-zinc-700 text-zinc-200 hover:text-white hover:border-zinc-500 hover:bg-zinc-800/60 px-6 h-11 inline-flex items-center justify-center font-medium transition-colors"
                                >
                                    Contact Developers
                                </a>
                            </div>
                        </section>
                    </BorderGlow>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="mt-10 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3"
                >
                    <p className="text-sm text-zinc-500">
                        &copy; {new Date().getFullYear()} Human Emotion Detector
                        Project.
                    </p>
                    <div className="flex items-center gap-5">
                        <a
                            href="#"
                            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            GitHub
                        </a>
                        <a
                            href="#contact"
                            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            Contact
                        </a>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
}
