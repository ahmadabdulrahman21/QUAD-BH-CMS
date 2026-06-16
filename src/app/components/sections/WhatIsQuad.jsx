'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function WhatIsQuad({ data = {} }) {
  const [content, setContent] = useState(null);

  /* =========================================================
     PARSE DATA
  ========================================================= */
  useEffect(() => {
    if (!data) return;

    const sectionPayload = data.section ? data.section : data;
    const rawContent = sectionPayload?.content;

    try {
      const parsed =
        typeof rawContent === 'string'
          ? JSON.parse(rawContent)
          : rawContent || {};

      setContent(parsed);
    } catch (err) {
      console.error("Invalid JSON in section_items.content", err);
      setContent({});
    }
  }, [data]);

  if (!content) return null;

  /* =========================================================
     CONTENT MAPPING
  ========================================================= */
  const title = content?.title || "What is QUAD";
  const intro = content?.subtitle || content?.description;

  const items = [];

  if (content?.mission) {
    items.push(content.mission);
  }

  if (content?.vision) {
    items.push(content.vision);
  }

  if (Array.isArray(content?.highlights)) {
    items.push(...content.highlights);
  }

  const quote = content?.description !== intro ? content?.description : null;

  const sectionPayload = data.section ? data.section : data;

  const imageUrl =
    sectionPayload?.media?.[0]?.url ||
    content?.media?.[0]?.url ||
    content?.image ||
    content?.logo ||
    null;

  /* =========================================================
     UI (MATCH PREMIUM ANIMATED STYLE)
  ========================================================= */
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div
          className="grid items-center gap-16"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          }}
        >

          {/* LEFT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >

            {/* TITLE */}
            <h2 className="text-4xl font-bold mb-8 text-gray-900 border-b-4 border-cyan-500 w-fit pb-2">
              {title}
            </h2>

            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">

              {/* INTRO */}
              {intro && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="font-semibold text-gray-900"
                >
                  {intro}
                </motion.p>
              )}

              {/* ITEMS */}
              {items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="space-y-2"
                >
                  {item?.title && (
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-2 h-2 bg-cyan-500 rounded-full" />
                      {item.title}
                    </h3>
                  )}
                  {item?.text && (
                    <p className="text-gray-600">
                      {item.text}
                    </p>
                  )}
                </motion.div>
              ))}

              {/* QUOTE */}
              {quote && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="italic bg-gray-50 p-6 rounded-2xl border-l-4 border-pink-500 text-gray-700"
                >
                  "{quote}"
                </motion.p>
              )}

            </div>
          </motion.div>

          {/* RIGHT SIDE - PREMIUM ANIMATED CARD (MATCH YOUR SECOND DESIGN) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center items-center"
          >

            {imageUrl && (
              <div className="relative group">

                {/* glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-pink-400/10 blur-3xl scale-110 opacity-70 group-hover:opacity-100 transition duration-700" />

                {/* rotating aura */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[360px] h-[360px] rounded-full bg-[conic-gradient(from_0deg,rgba(34,211,238,0.15),transparent,rgba(236,72,153,0.15),transparent)] animate-spin-slow opacity-60" />
                </div>

                {/* soft ring */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[320px] h-[320px] rounded-full border border-gray-200/40 animate-pulse" />
                </div>

                {/* card */}
                <div className="relative w-80 h-80 rounded-3xl bg-white shadow-[0_30px_80px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden transition-transform duration-500 group-hover:-translate-y-2">

                  {/* gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white" />

                  {/* light beam */}
                  <div className="absolute top-[-40%] left-[-40%] w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/40 to-transparent rotate-12 opacity-40" />

                  {/* image */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative z-10 w-full h-full flex items-center justify-center p-10"
                  >
                    <Image
                      src={imageUrl}
                      alt={title}
                      fill
                      className="object-contain p-10"
                    />
                  </motion.div>

                </div>
              </div>
            )}

          </motion.div>

        </div>
      </div>

      {/* ANIMATION */}
      <style jsx>{`
        .animate-spin-slow {
          animation: spin 18s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

    </section>
  );
}