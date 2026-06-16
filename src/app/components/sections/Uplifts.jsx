'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Uplifts({ data = {} }) {
  const [content, setContent] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // SECTION HEADER (section_items)
  // -----------------------------
  useEffect(() => {
    if (!data) return;

    try {
      let parsed = data.content;

      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);

      setContent({
        title: parsed?.title || '',
        subtitle: parsed?.subtitle || '',
        description: parsed?.description || '',
      });
    } catch (err) {
      setContent({
        title: '',
        subtitle: '',
        description: '',
      });
    }
  }, [data]);

  // -----------------------------
  // FETCH LATEST 3 UPLIFTS (DB)
  // -----------------------------
  useEffect(() => {
    const fetchUplifts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/uplifts?limit=3', {
          cache: 'no-store',
        });

        const result = await res.json();

        console.log('UPLIFTS API RESPONSE OVERVIEW:', result);

        // ✅ FIXED: Safely unpack array rows out of backend .data object layer
        const list = Array.isArray(result)
          ? result
          : result?.data || [];

        setCards(list);
      } catch (err) {
        console.error('Failed to fetch uplifts:', err);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUplifts();
  }, []);

  if (!content) return null;

  const { title, subtitle, description } = content;

  // -----------------------------
  // ANIMATION CONFIGURATIONS
  // -----------------------------
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: 'easeOut' },
    },
  };

  return (
    <section className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="max-w-2xl">
            {title && (
              <h2 className="text-4xl font-bold mb-4 text-gray-900">
                {title}
              </h2>
            )}

            {subtitle && (
              <h3 className="text-2xl font-bold mb-4 text-gray-800 leading-snug">
                {subtitle}
              </h3>
            )}

            {description && (
              <p className="text-gray-500 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          <Link
            href="/uplifts"
            className="text-cyan-600 flex items-center gap-2 font-semibold hover:gap-3 transition-all pb-2"
          >
            View all uplifts <span>→</span>
          </Link>
        </div>

        {/* CARDS LOOP GRID */}
        {!loading && cards.length > 0 ? (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-3 gap-8 items-stretch"
          >
            {cards.map((item) => (
              <motion.div
                key={item.id}
                variants={cardVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full group"
              >
                {/* IMAGE STAGE CONTAINER */}
                <div className="h-64 relative bg-gray-100 overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.title || 'Uplift post illustration reference'}
                      fill
                      sizes="(max-w-7xl) 33vw, 100vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                      No Image Available
                    </div>
                  )}
                </div>

                {/* CONTENT COMPONENT ELEMENT CARD */}
                <div className="p-8 flex flex-col flex-1">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {item.title}
                  </h4>

                  <p className="text-gray-600 mb-6 font-medium leading-relaxed line-clamp-3">
                    {item.description}
                  </p>

                  {/* PUSH ACTION CONTROLS TO BASELINE GRID POSITION */}
                  <div className="mt-auto pt-4">
                    <Link
                      href={`/uplifts/${item.id}`}
                      className="inline-block bg-slate-700 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 text-gray-400 italic font-mono text-sm tracking-wide">
            {loading ? 'Streaming latest metric logs...' : 'No target system uplift instances mapped.'}
          </div>
        )}

      </div>
    </section>
  );
}