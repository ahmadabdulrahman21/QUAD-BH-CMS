'use client';

import Image from 'next/image';

export default function Loading() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#0b1220] via-[#0f1b2d] to-[#0a0f1a] z-50">

            <div className="flex flex-col items-center gap-6">

                {/* LOGO CORE */}
                <div className="relative w-28 h-28 flex items-center justify-center">

                    {/* Glow behind logo */}
                    <div className="absolute w-28 h-28 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" />

                    {/* Soft rotating ring */}
                    <div className="absolute w-32 h-32 border border-cyan-400/20 rounded-full animate-spin-slow" />

                    {/* Logo */}
                    <div className="relative w-20 h-20 animate-pulse">
                        <Image
                            src="/images/logo.png"
                            alt="Business House Logo"
                            width={80}
                            height={80}
                            priority
                            className="object-contain"
                        />
                    </div>

                </div>

                {/* TEXT */}
                <div className="text-center">
                    <h1 className="text-white text-xl font-semibold tracking-wide">
                        Business House
                    </h1>
                    <p className="text-white/60 text-sm mt-1">
                        Preparing your workspace...
                    </p>
                </div>

                {/* DOT LOADER */}
                <div className="flex gap-2 mt-2">
                    <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce" />
                </div>

            </div>
        </div>
    );
}