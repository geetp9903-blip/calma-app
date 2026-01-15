"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export const GlobalLoader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0.5, scale: 0.9 }}
                animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [0.9, 1.1, 0.9]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="relative w-32 h-32"
            >
                <Image
                    src="/assets/Calma_Logo_icon_alt.png"
                    alt="Loading..."
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                />
            </motion.div>
        </div>
    );
};
