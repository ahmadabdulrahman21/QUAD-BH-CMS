'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function Hero({ liveContent, liveMedia }) {

  const [data, setData] = React.useState(null);
  const [index, setIndex] = React.useState(0);
  const [text, setText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  const isLive = !!liveContent || !!liveMedia;

  /* =========================================================
     FETCH FROM DB
  ========================================================= */
  React.useEffect(() => {
    if (isLive) return;

    const loadHero = async () => {
      try {
        const res = await fetch('/api/sections', {
          cache: 'no-store'
        });

        const json = await res.json();
        if (!json?.success || !Array.isArray(json.sections)) return;

        const hero = json.sections.find(s => s.type === 'hero');
        setData(hero || null);

      } catch (err) {
        console.error("Hero fetch error:", err);
      }
    };

    loadHero();

    const handlePageShow = () => loadHero();

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handlePageShow);
    };

  }, [isLive]);

  /* =========================================================
     CONTENT NORMALIZATION
  ========================================================= */
  const source = isLive ? liveContent : data?.content;

  const content = React.useMemo(() => {
    if (!source) return {};

    if (typeof source === "string") {
      try {
        return JSON.parse(source);
      } catch {
        return {};
      }
    }

    return source;
  }, [source]);

  const title = content?.title || "Beyond the Ordinary";
  const subtitle = content?.subtitle || "";
  const buttonText = content?.buttonText || "Start Exploring";
  const label = content?.label || "Business House";

  /* =========================================================
     MEDIA (DB + LIVE)
  ========================================================= */
  const images = React.useMemo(() => {
    const media = isLive ? liveMedia : data?.media;

    if (!Array.isArray(media)) return [];

    return media
      .map(m => m?.url?.trim())
      .filter(Boolean);
  }, [isLive, liveMedia, data]);

  const currentImage = images[index] || null;

  /* =========================================================
     AUTO SLIDER
  ========================================================= */
  React.useEffect(() => {
    if (images.length <= 1) return;

    setIndex(0);

    const id = setInterval(() => {
      setIndex(prev => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(id);
  }, [images.length]);

  /* =========================================================
     TYPEWRITER
  ========================================================= */
  React.useEffect(() => {
    if (!title) return;

    const timer = setTimeout(() => {

      if (!isDeleting) {
        const next = title.substring(0, text.length + 1);
        setText(next);

        if (next === title) {
          setTimeout(() => setIsDeleting(true), 1500);
        }

      } else {
        const next = title.substring(0, text.length - 1);
        setText(next);

        if (!next.length) setIsDeleting(false);
      }

    }, isDeleting ? 60 : 120);

    return () => clearTimeout(timer);

  }, [text, isDeleting, title]);

  /* =========================================================
     SCROLL
  ========================================================= */
  const handleNextSection = () => {
    document.getElementById("hero")
      ?.nextElementSibling
      ?.scrollIntoView({ behavior: "smooth" });
  };

  /* =========================================================
     UI (MATCH YOUR SECOND DESIGN STYLE)
  ========================================================= */
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-black">

      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            {currentImage && (
              <Image
                src={currentImage}
                alt="hero background"
                fill
                className="object-cover"
                loading='lazy'
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/60" />

      {/* GLOW EFFECT (same style as reference) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-[-10%] w-72 md:w-96 h-72 md:h-96 bg-cyan-500/20 blur-3xl rounded-full" />
        <div className="absolute bottom-1/4 left-[-10%] w-72 md:w-96 h-72 md:h-96 bg-pink-500/20 blur-3xl rounded-full" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-3xl"
        >

          {/* LABEL */}
          <p className="uppercase tracking-[0.25em] text-xs sm:text-sm text-white/70 mb-4 sm:mb-6">
            {label}
          </p>

          {/* TITLE (typing style like your reference) */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 relative">

            {/* invisible layout lock */}
            <span className="opacity-0 select-none whitespace-nowrap">
              {title}
            </span>

            {/* typing layer */}
            <span className="absolute left-0 top-0 whitespace-nowrap flex items-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
                {text}
              </span>
              <span className="ml-1 w-[2px] h-[1em] bg-pink-400 animate-pulse" />
            </span>

          </h1>

          {/* SUBTITLE */}
          <p className="text-white/70 text-sm sm:text-base md:text-lg max-w-xl mb-8 sm:mb-10 leading-relaxed">
            {subtitle}
          </p>

          {/* BUTTON */}
          {buttonText && (
            <button
              onClick={handleNextSection}
              className="w-fit cursor-pointer bg-white text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition"
            >
              {buttonText}
            </button>
          )}

        </motion.div>

      </div>

    </section>
  );
}