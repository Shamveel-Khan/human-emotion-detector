"use client";

import { motion } from "framer-motion";
import FloatingLines from "@/components/floating-lines";

const textRevealVariants = {
    hidden: { y: "100%" },
    visible: (i: number) => ({
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1] as const,
            delay: i * 0.1,
        },
    }),
};

export function Hero() {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden cursor-default">
            <div className="absolute inset-0">
                <FloatingLines
                    enabledWaves={["top", "middle", "bottom"]}
                    lineCount={[8, 12, 10]}
                    lineDistance={[10, 14, 18]}
                    animationSpeed={5}
                    interactive={true}
                    parallax={true}
                    parallaxStrength={0.16}
                    bendRadius={4.8}
                    bendStrength={-0.5}
                    mouseDamping={0.08}
                    topWavePosition={{ x: 10.0, y: 0.5, rotate: -0.4 }}
                    middleWavePosition={{ x: 5.0, y: 0.0, rotate: 0.2 }}
                    linesGradient={["#4828f8"]}
                    mixBlendMode="screen"
                />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto text-center">
                {/* Headline with text mask animation */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-zinc-50 mb-6 drop-shadow-[0_2px_20px_rgba(255,255,255,0.08)]">
                    <span className="block overflow-hidden">
                        <motion.span
                            className="block"
                            variants={textRevealVariants}
                            initial="hidden"
                            animate="visible"
                            custom={0}
                        >
                            Understand emotions.
                        </motion.span>
                    </span>
                    <span className="block overflow-hidden">
                        <motion.span
                            className="block text-indigo-200"
                            variants={textRevealVariants}
                            initial="hidden"
                            animate="visible"
                            custom={1}
                        >
                            Build empathetic AI.
                        </motion.span>
                    </span>
                </h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-xl sm:text-2xl font-semibold text-zinc-100 max-w-3xl mx-auto mb-5 leading-relaxed"
                >
                    Upload a face image and detect emotional cues in seconds
                    with our Human Emotion Detector pipeline.
                </motion.p>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.62 }}
                    className="text-base sm:text-lg font-medium text-zinc-200/95 max-w-3xl mx-auto leading-relaxed"
                >
                    Detect patterns like happiness, sadness, anger, surprise,
                    and neutral sentiment to support smarter interaction design,
                    classroom insights, and assistive AI workflows.
                </motion.p>
            </div>
        </section>
    );
}
