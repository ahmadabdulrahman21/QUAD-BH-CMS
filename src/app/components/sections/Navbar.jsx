"use client";

import React from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ data, sections = [] }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [active, setActive] = React.useState("Home");
  const [scrolled, setScrolled] = React.useState(false);
  const [manualActive, setManualActive] = React.useState(false);

  // ---------------- FORMAT ----------------
  function formatName(type) {
    if (type === "hero") return "Home";
    return type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }

  // ---------------- NAV LINKS ----------------
  const navLinks = React.useMemo(() => {
    if (!Array.isArray(sections)) return [];

    return sections
      .filter((s) => {
        if (!s?.type) return false;
        if (["navbar", "footer", "contact"].includes(s.type)) return false;
        return s.isActive == 1;
      })
      .map((s) => ({
        id: s.type,
        name: formatName(s.type),
      }));
  }, [sections]);

  // ---------------- NAV DATA ----------------
  const navbarContent = React.useMemo(() => {
    if (!data?.content) return {};

    try {
      return typeof data.content === "string"
        ? JSON.parse(data.content)
        : data.content;
    } catch {
      return {};
    }
  }, [data]);

  const logoImage = data?.media?.[0]?.url || null;

  const title =
    typeof navbarContent.title === "string"
      ? navbarContent.title
      : "Brand";

  const scrollToSection = (id, name) => {
    setManualActive(true);
    setActive(name);
    setIsOpen(false);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });

    setTimeout(() => setManualActive(false), 800);
  };

  // ---------------- SCROLL TRACKING ----------------
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      if (manualActive) return;

      const scrollMiddle = window.scrollY + window.innerHeight / 2;

      let closest = "Home";
      let minDistance = Infinity;

      for (const link of navLinks) {
        const section = document.getElementById(link.id);
        if (!section) continue;

        const sectionMiddle =
          section.offsetTop + section.offsetHeight / 2;

        const distance = Math.abs(scrollMiddle - sectionMiddle);

        if (distance < minDistance) {
          minDistance = distance;
          closest = link.name;
        }
      }

      // CONTACT override
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        const rect = contactSection.getBoundingClientRect();
        const inView =
          rect.top <= window.innerHeight * 0.6 &&
          rect.bottom >= window.innerHeight * 0.4;

        if (inView) closest = "Contact";
      }

      setActive(closest);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [manualActive, navLinks]);

  // ---------------- UI ----------------
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? "bg-white/70 backdrop-blur-xl shadow-md border-b border-gray-200"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 sm:h-20 flex items-center justify-between">

          {/* LOGO */}
          <div
            onClick={() => scrollToSection("hero", "Home")}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer"
          >
            {logoImage && (
              <div className="w-10 sm:w-12 h-10 sm:h-12 relative">
                <Image
                  src={logoImage}
                  alt="Logo"
                  fill
                  className="object-contain"
                />
              </div>
            )}

            <span
              className={`text-sm sm:text-lg font-semibold tracking-wide transition ${scrolled ? "text-gray-900" : "text-white"
                }`}
            >
              {title}
            </span>
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id, link.name)}
                className={`cursor-pointer relative text-sm font-medium transition-colors ${scrolled
                  ? "text-gray-700 hover:text-cyan-600"
                  : "text-white/80 hover:text-white"
                  }`}
              >
                {active === link.name && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-media rounded-full" />
                )}
                {link.name}
              </button>
            ))}

            <button
              onClick={() => scrollToSection("contact", "Contact")}
              className="cursor-pointer ml-2 px-5 py-2 rounded-full bg-media text-white text-sm font-semibold hover:bg-cyan-700 transition shadow-md"
            >
              Contact Us
            </button>
          </div>

          {/* MOBILE BUTTON */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`w-11 h-11 flex items-center justify-center ${scrolled ? "text-gray-900" : "text-white"
                }`}
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 sm:top-20 left-0 w-full bg-white/95 backdrop-blur-xl shadow-xl border-t border-gray-200"
          >
            <div className="px-6 py-6 space-y-2">

              {navLinks.map((link, i) => (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => scrollToSection(link.id, link.name)}
                  className={`w-full text-left py-3 px-3 rounded-lg transition ${active === link.name
                    ? "bg-media/10 text-media font-semibold border-l-4 border-media"
                    : "text-gray-700 hover:bg-gray-100 hover:text-media"
                    }`}
                >
                  {link.name}
                </motion.button>
              ))}

              <button
                onClick={() => scrollToSection("contact", "Contact")}
                className="w-full mt-4 py-3 rounded-xl font-semibold bg-media text-white hover:bg-cyan-700"
              >
                Contact Us
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}