'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Brands({ data = {} }) {

  // ✅ Normalize color values properly
  const normalizeColor = (color) => {
    if (!color) return undefined;

    const c = color.trim().toLowerCase();

    const map = {
      black: '#000000',
      white: '#ffffff',
      gray: '#6b7280',
      grey: '#6b7280',
      red: '#ef4444',
      blue: '#3b82f6',
      green: '#10b981',
    };

    return map[c] || color;
  };

  const content = React.useMemo(() => {
    if (!data) return null;

    let parsedContent;

    if (typeof data.content === 'string') {
      try {
        parsedContent = JSON.parse(data.content);
      } catch (e) {
        console.error('Failed to parse brands content:', e);
        return null;
      }
    } else if (data.content && typeof data.content === 'object') {
      parsedContent = data.content;
    } else if (data && typeof data === 'object' && !data.content) {
      if (data.brandItem || data.sectionTitle) {
        parsedContent = data;
      } else {
        return null;
      }
    } else {
      return null;
    }

    return parsedContent;
  }, [data]);

  if (!content) {
    return (
      <section className="py-24 bg-white" id="brands">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 text-gray-400">
          Loading brand data...
        </div>
      </section>
    );
  }

  const sectionTitle = content?.sectionTitle || "Our Brands";

  const brands = Array.isArray(content?.brandItem)
    ? content.brandItem.filter(item => item && typeof item === 'object')
    : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0 },
  };

  const getValidUrl = (url) => {
    if (!url || url === 'http://' || url === 'https://' || url === '#') {
      return '#';
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }

    return url;
  };

  const defaultColors = {
    nameColor: "#ffffff",
    nameBackgroundColor: "#00B2A9",
    titleColor: "#00B2A9",
    descriptionColor: "#6B7280",
    buttonColor: "#00B2A9"
  };

  return (
    <section className="py-24 bg-white" id="brands">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900">
            {sectionTitle}
          </h2>
        </motion.div>

        {/* GRID */}
        {brands.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-stretch"
          >
            {brands.map((brand, idx) => {

              const safeBrand = {
                name: brand?.name || "",
                title: brand?.title || "",
                description: brand?.description || "",
                image: brand?.image || "",
                link: brand?.link || "#",
                buttonText: brand?.buttonText || "",

                nameColor: normalizeColor(brand?.nameColor) || defaultColors.nameColor,
                nameBackgroundColor: normalizeColor(brand?.nameBackgroundColor) || defaultColors.nameBackgroundColor,
                titleColor: normalizeColor(brand?.titleColor) || defaultColors.titleColor,
                descriptionColor: normalizeColor(brand?.descriptionColor) || defaultColors.descriptionColor,
                buttonColor: normalizeColor(brand?.buttonColor) || defaultColors.buttonColor,
              };

              const validUrl = getValidUrl(safeBrand.link);

              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
                >

                  {/* IMAGE */}
                  <div className="relative h-[420px] bg-gray-50 flex items-center justify-center overflow-hidden">

                    {safeBrand.image ? (
                      <Image
                        src={safeBrand.image}
                        alt={safeBrand.name || "Brand image"}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-700"
                        unoptimized
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-sm text-gray-400">
                        No image available
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {safeBrand.name && (
                      <div
                        className="absolute top-6 left-6 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur"
                        style={{
                          color: safeBrand.nameColor,
                          backgroundColor: safeBrand.nameBackgroundColor,
                        }}
                      >
                        {safeBrand.name}
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="p-8 flex flex-col flex-1">

                    {safeBrand.title && (
                      <h3
                        className="text-3xl font-bold mb-4"
                        style={{
                          color: safeBrand.titleColor,
                        }}
                      >
                        {safeBrand.title}
                      </h3>
                    )}

                    {safeBrand.description && (
                      <p
                        className="mb-8 leading-relaxed"
                        style={{
                          color: safeBrand.descriptionColor,
                        }}
                      >
                        {safeBrand.description}
                      </p>
                    )}

                    {safeBrand.buttonText && validUrl !== '#' && (
                      <a
                        href={validUrl}
                        className="inline-block mt-auto px-8 py-3 rounded-full font-semibold text-white transition-all hover:opacity-90 self-start"
                        style={{
                          backgroundColor: safeBrand.buttonColor,
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {safeBrand.buttonText}
                      </a>
                    )}

                    {safeBrand.buttonText && validUrl === '#' && (
                      <button
                        className="inline-block mt-auto px-8 py-3 rounded-full font-semibold text-white opacity-60 cursor-not-allowed self-start"
                        style={{
                          backgroundColor: safeBrand.buttonColor,
                        }}
                        disabled
                      >
                        {safeBrand.buttonText}
                      </button>
                    )}

                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            No brand records found. Add brands in the admin panel.
          </div>
        )}
      </div>
    </section>
  );
}