"use client";

import { motion } from "framer-motion";
import ProfileCard from "@/components/ProfileCard";

const developers = [
    {
        name: "Lucky Kumar",
        title: "AI Engineer",
        handle: "24k-0936",
        status: "Available",
        contactText: "Contact",
        avatarUrl: "/lucky.jpg",
        miniAvatarUrl: "/lucky.jpg",
        contactUrl: "mailto:nisha@example.com",
    },
    {
        name: "Shamveel Khan",
        title: "Backend Engineer",
        handle: "24K-0962",
        status: "Available",
        contactText: "Portfolio",
        avatarUrl: "/sk.jpg",
        miniAvatarUrl: "/sk.jpg",
        contactUrl: "https://www.shamveel-is.me/",
    },
    {
        name: "M.Kabeer",
        title: "FrontEnd Engineer",
        handle: "24K-0700",
        status: "Available",
        contactText: "Contact",
        avatarUrl: "/kabeer.jpg",
        miniAvatarUrl: "/kabeer.jpg",
        contactUrl: "mailto:rohan@example.com",
    },
];

export function Pricing() {
    return (
        <section id="contact" className="py-24 px-4">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-14"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Contact Our Developers
                    </h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto">
                        Reach out directly to the core team building this AI
                        project. Choose any developer card below to connect.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {developers.map((developer, index) => (
                        <motion.div
                            key={developer.handle}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.5, delay: index * 0.08 }}
                            className="flex justify-center"
                        >
                            <ProfileCard
                                name={developer.name}
                                title={developer.title}
                                handle={developer.handle}
                                status={developer.status}
                                contactText={developer.contactText}
                                avatarUrl={developer.avatarUrl}
                                miniAvatarUrl={developer.miniAvatarUrl}
                                showUserInfo={true}
                                enableTilt={true}
                                enableMobileTilt={false}
                                onContactClick={() => {
                                    window.location.href = developer.contactUrl;
                                }}
                                iconUrl="/placeholder.svg"
                                behindGlowEnabled
                                behindGlowColor="rgba(92, 110, 255, 0.5)"
                                behindGlowSize="42%"
                                innerGradient="linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)"
                                className="mx-auto"
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
