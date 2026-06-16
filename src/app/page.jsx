"use client";

import { useEffect, useState, useCallback } from "react";

import Navbar from "./components/sections/Navbar";
import Footer from "./components/sections/Footer";

import Hero from "./components/sections/Hero";
import Brands from "./components/sections/Brands";
import ContactForm from "./components/sections/ContactForm";
import PortfolioStats from "./components/sections/PortfolioStats";
import Qoworking from "./components/sections/Qoworking";
import QuadAcademy from "./components/sections/QuadAcademy";
import QuadMap from "./components/sections/QuadMap";
import Uplifts from "./components/sections/Uplifts";
import WhatIsQuad from "./components/sections/WhatIsQuad";
import DigitalMedia from "./components/sections/DigitalMedia";

const componentMap = {
  hero: Hero,
  brands: Brands,
  contact: ContactForm,
  portfolio: PortfolioStats,
  qoworking: Qoworking,
  academy: QuadAcademy,
  "digital-media": DigitalMedia,
  uplifts: Uplifts,
  about: WhatIsQuad,
  location: QuadMap,
};

export default function Home() {
  const [sections, setSections] = useState([]);

  const loadSections = useCallback(async () => {
    try {
      const res = await fetch("/api/sections", {
        cache: "no-store",
      });

      const data = await res.json();
      const fetched = Array.isArray(data.sections) ? data.sections : [];

      setSections(fetched);

      // cache for instant back navigation (optional)
      localStorage.setItem("quad_sections", JSON.stringify(fetched));
    } catch (err) {
      console.error("Failed to load sections:", err);
    }
  }, []);

  // 1. Initial load
  useEffect(() => {
    const cached = localStorage.getItem("quad_sections");

    if (cached) {
      try {
        setSections(JSON.parse(cached));
      } catch { }
    }

    loadSections();
  }, [loadSections]);

  // 2. When user returns to tab (Google → back)
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        loadSections();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () =>
      document.removeEventListener("visibilitychange", onVisibility);
  }, [loadSections]);

  // 3. Chrome back/forward cache fix (IMPORTANT)
  useEffect(() => {
    const onPageShow = (event) => {
      const navEntry = performance.getEntriesByType("navigation")[0];

      const isBackForward =
        event.persisted || navEntry?.type === "back_forward";

      if (isBackForward) {
        loadSections();
      }
    };

    window.addEventListener("pageshow", onPageShow);

    return () => window.removeEventListener("pageshow", onPageShow);
  }, [loadSections]);

  const navbarSection = sections.find((s) => s.type === "navbar");
  const footerSection = sections.find((s) => s.type === "footer");

  return (
    <main className="min-h-screen">
      <Navbar data={navbarSection} sections={sections} />

      {sections
        .filter(
          (section) =>
            section.type !== "navbar" &&
            section.type !== "footer" &&
            (Number(section.isActive) === 1 || section.isActive === true)
        )
        .map((section) => {
          const Component = componentMap[section.type];
          if (!Component) return null;

          return (
            <section key={section.id} id={section.type}>
              <Component
                data={{
                  content: section.content || {},
                  media: section.media || [],
                  type: section.type,
                }}
              />
            </section>
          );
        })}

      <Footer data={footerSection} />
    </main>
  );
}