'use client';

import React from 'react';
import * as LucideIcons from "lucide-react";
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Qoworking({ data = {} }) {
  const [content, setContent] = React.useState(null);

  React.useEffect(() => {
    if (!data) return;

    const parsedContent =
      typeof data.content === 'string'
        ? JSON.parse(data.content)
        : data.content || {};

    setContent({
      ...parsedContent,
      media: data.media || []
    });
  }, [data]);

  if (!content) return null;

  const features = Array.isArray(content?.features) ? content.features : [];
  const spaces = Array.isArray(content?.spaces) ? content.spaces : [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0 },
  };

  // Universal Lucide icon renderer
  const renderIcon = (iconName, size = 24, className = "text-cyan-600") => {
    if (!iconName) {
      const DefaultIcon = LucideIcons.HelpCircle;
      return React.createElement(DefaultIcon, { size, className });
    }

    // Try exact match
    let IconComponent = LucideIcons[iconName];

    // If not found, try case-insensitive match
    if (!IconComponent) {
      const matchedKey = Object.keys(LucideIcons).find(
        key => key.toLowerCase() === iconName.toLowerCase()
      );
      if (matchedKey) {
        IconComponent = LucideIcons[matchedKey];
      }
    }

    // If still not found, use HelpCircle as fallback
    if (!IconComponent) {
      IconComponent = LucideIcons.HelpCircle;
    }

    return React.createElement(IconComponent, { size, className });
  };

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* LEFT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
            {content?.title && (
              <h2 className="text-4xl font-bold mb-6">
                {content.title}
              </h2>
            )}

            {content?.subtitle && (
              <p className="text-xl text-gray-700 font-semibold mb-8">
                {content.subtitle}
              </p>
            )}

            {content?.description && (
              <p className="text-gray-500 mb-10 leading-relaxed">
                {content.description}
              </p>
            )}

            <div className="space-y-6">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 text-gray-700"
                >
                  <div className="text-cyan-600 flex-shrink-0">
                    {renderIcon(f?.icon, 24, "text-cyan-600")}
                  </div>
                  <span className="font-medium">{f?.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT SIDE CARDS */}
          {spaces.length > 0 && (
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-2 gap-8"
            >
              {spaces.map((space, idx) => {
                const href = space?.link || "#";
                const isExternal = href.startsWith("http");

                return (
                  <motion.div
                    key={idx}
                    variants={item}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl flex flex-col"
                  >

                    {/* IMAGE */}
                    <div className="relative h-56 bg-gray-50 overflow-hidden">
                      {space?.image ? (
                        <Image
                          src={space.image}
                          alt={space?.title || "space"}
                          fill
                          loading='lazy'
                          className="object-contain p-6 group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {space?.title}
                      </h3>

                      <div className="mt-auto">
                        {isExternal ? (
                          <a href={href} target="_blank" rel="noopener noreferrer">
                            <button className="cursor-pointer w-full py-2 rounded-full font-bold text-sm transition hover:opacity-90"
                              style={{
                                color: space?.["Button Color"] || "#000000",
                                backgroundColor: space?.["Button Background Color"] || "#06b6d4"
                              }}>
                              {space?.button || "Learn More"}
                            </button>
                          </a>
                        ) : (
                          <Link href={href}>
                            <button
                              className="cursor-pointer w-full py-2 rounded-full font-bold text-sm transition hover:opacity-90"
                              style={{
                                color: space?.["Button Color"] || "#000000",
                                backgroundColor: space?.["Button Background Color"] || "#06b6d4"
                              }}
                            >
                              {space?.button || "Learn More"}
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

        </div>
      </div>
    </section>
  );
}