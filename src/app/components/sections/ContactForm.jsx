'use client';

import React from 'react';
import { Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export default function ContactForm({ data }) {
  const [contact, setContact] = React.useState(null);

  React.useEffect(() => {
    // 1. Standalone / Preview Fallback: Fetch directly from API if no prop is provided
    if (!data) {
      const fetchData = async () => {
        try {
          const res = await fetch('/api/sections');
          const json = await res.json();
          const sections = json?.sections || [];

          const row = sections.find((item) => item.type === 'contact');
          if (!row) return;

          const content = typeof row.content === 'string'
            ? JSON.parse(row.content)
            : row.content;

          setContact(content || {});
        } catch (err) {
          console.error("ContactForm Fetch Error:", err);
        }
      };

      fetchData();
    } else {
      // 2. Main Page Layout Flow: Unpack the JSON data.content property correctly
      const parsedContent = typeof data.content === 'string'
        ? JSON.parse(data.content)
        : data.content || {};

      setContact(parsedContent);
    }
  }, [data]);

  if (!contact) return null;

  // ---------------- SAFE FIELDS ----------------
  const title = typeof contact.title === 'string' ? contact.title : '';
  const subtitle = typeof contact.subtitle === 'string' ? contact.subtitle : '';
  const email = typeof contact.email === 'string' ? contact.email : '';
  const whatsapp = typeof contact.whatsapp === 'string' ? contact.whatsapp : '';
  const buttonText = typeof contact.buttonText === 'string' ? contact.buttonText : 'Send Message';

  const safeWhatsAppNumber = whatsapp.trim().length > 0
    ? whatsapp.replace(/\D/g, '')
    : null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid lg:grid-cols-2 gap-16">

          {/* LEFT */}
          <div>
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              {title}
            </h2>

            <p className="text-xl text-gray-500 max-w-md mb-8">
              {subtitle}
            </p>

            <div className="space-y-5">

              {/* EMAIL */}
              {email && (
                <Link
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 text-gray-700 hover:text-cyan-600 transition w-fit"
                >
                  <Mail className="w-5 h-5 text-cyan-600" />
                  <span>{email}</span>
                </Link>
              )}

              {/* WHATSAPP */}
              {safeWhatsAppNumber && (
                <Link
                  href={`https://wa.me/${safeWhatsAppNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition w-fit"
                >
                  <Phone className="w-5 h-5 text-green-600" />
                  <span>{whatsapp}</span>
                </Link>
              )}

            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">

            <h3 className="text-xl font-semibold mb-6 text-gray-900">
              Or send us a message
            </h3>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>

              <input
                type="text"
                placeholder="Full name"
                className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-cyan-500 transition"
              />

              <input
                type="email"
                placeholder="Email"
                className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-cyan-500 transition"
              />

              <textarea
                rows="4"
                placeholder="Message"
                className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-cyan-500 transition resize-none"
              />

              <button
                type="submit"
                className="w-full bg-media text-white py-4 rounded-xl font-bold hover:bg-cyan-400 transition cursor-pointer"
              >
                {buttonText}
              </button>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}