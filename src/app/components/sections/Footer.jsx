'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaYoutube,
  FaWhatsapp,
} from 'react-icons/fa';

export default function Footer() {
  const [sections, setSections] = React.useState([]);

  // ---------------- FETCH ----------------
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/sections');
        const json = await res.json();

        setSections(Array.isArray(json?.sections) ? json.sections : []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // ---------------- HELPERS ----------------
  function formatName(type) {
    if (type === 'hero') return 'Home';

    return type
      .replace('-', ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  const socialIcons = {
    twitter: FaTwitter,
    facebook: FaFacebook,
    instagram: FaInstagram,
    youtube: FaYoutube,
    linkedin: FaLinkedin,
    whatsapp: FaWhatsapp,
  };

  // ---------------- ACTIVE SECTIONS ----------------
  const activeSections = React.useMemo(() => {
    return sections.filter((s) => {
      if (s.type === 'navbar' || s.type === 'footer') return true;
      return Number(s.isActive) === 1;
    });
  }, [sections]);

  // ---------------- NAV LINKS ----------------
  const navLinks = activeSections
    .filter((s) => s.type !== 'contact' && s.type !== 'footer' && s.type !== 'navbar')
    .map((s) => ({
      id: s.type === 'hero' ? 'home' : s.type,
      name: formatName(s.type),
    }));

  // ---------------- FOOTER DATA ----------------
  const footerSection = sections.find((s) => s.type === 'footer') || {};
  const footerData = footerSection?.content || {};

  const logo =
    footerSection?.media?.find((m) => m.type === 'logo')?.url ||
    footerSection?.media?.[0]?.url ||
    null;

  const title = footerData?.title || '';
  const description = footerData?.description || '';
  const phone = footerData?.phone || '';

  const socials = footerData?.socials || {
    twitter: '',
    facebook: '',
    instagram: '',
    youtube: '',
    linkedin: '',
    whatsapp: '',
  };

  // ---------------- SCROLL ----------------
  const scrollToSection = (id) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const companyLinks = navLinks.slice(0, 5);
  const exploreLinks = navLinks.slice(5);

  return (
    <footer className="bg-black text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">

        {/* ================= TOP GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">

          {/* LOGO */}
          <div>
            {(logo || title) && (
              <div className="flex items-center gap-3 mb-8">
                {logo && (
                  <div className="w-14 h-14 relative flex-shrink-0">
                    <Image
                      src={logo}
                      alt={title || 'Logo'}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}

                {title && (
                  <span className="font-bold text-lg">{title}</span>
                )}
              </div>
            )}

            {description && (
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                {description}
              </p>
            )}

            {/* SOCIALS */}
            <div className="flex gap-4 text-white/60">
              {Object.entries(socials).map(([platform, url]) => {
                if (!url) return null;

                const Icon = socialIcons[platform];
                if (!Icon) return null;

                let finalHref = url;

                if (platform === 'whatsapp') {
                  const num = url.trim().replace(/\D/g, '');
                  finalHref = num ? `https://wa.me/${num}` : url;
                }

                return (
                  <Link
                    key={platform}
                    href={finalHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon size={20} className="hover:text-white transition" />
                  </Link>
                );
              })}
            </div>

            {phone && (
              <div className="mt-6 text-sm text-white/60">
                <p className="text-white/80 font-semibold">Contact Info</p>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="hover:text-white transition"
                >
                  {phone}
                </a>
              </div>
            )}
          </div>

          {/* COMPANY */}
          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-white/60">
              {companyLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="hover:text-white transition text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* EXPLORE */}
          <div>
            <h4 className="font-bold mb-6">Explore</h4>
            <ul className="space-y-4 text-sm text-white/60">
              {exploreLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="hover:text-white transition text-left"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h4 className="font-bold mb-6">Support</h4>

            <ul className="space-y-4 text-sm text-white/60">
              <li>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="hover:text-white transition text-left"
                >
                  Contact Us
                </button>
              </li>

              {/* ✅ PRIVACY POLICY */}
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-white transition"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* ================= BOTTOM BAR ================= */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">

          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} {title}. All rights reserved.
          </p>

          {/* LEGAL LINKS */}
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/privacy-policy" className="hover:text-white transition">
              Privacy Policy
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
}