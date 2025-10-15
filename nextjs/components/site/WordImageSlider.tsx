"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function WordImageSlider() {
  const items = [
    { word: "website", image: "./brand/website.png" },
    { word: "portfolio", image: "./brand/portfolio.png" },
    { word: "showcase", image: "./brand/showcase.png" }, // trimmed
    { word: "catalog", image: "./brand/catalog.png" },
    { word: "store", image: "./brand/storefront.png" },
    { word: "link hub", image: "./brand/linkhub.png" },
  ];

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
    const gradient = "gradient-rose";
  const nextSlide = React.useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = React.useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  React.useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (paused || reduceMotion) return;
    const id = setInterval(nextSlide, 4000);
    return () => clearInterval(id);
  }, [paused, nextSlide]);

  const prevIndex = (currentIndex - 1 + items.length) % items.length;
  const nextIndex = (currentIndex + 1) % items.length;
    const gradientClasses = `
        bg-gradient-to-r 
        from-[#e6759d]    // Your ACCENT color
        via-[#d16ba5]     // A slightly lighter/more vibrant pink
        to-[#5d5fef]      // A slightly darker or richer pink
        text-transparent 
        bg-clip-text
`;
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div
        className="max-w-7xl mx-auto w-full"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-8">
            Your Link-in-Bio, now a beautiful{" "}
            <span className="relative inline-block h-[1.35em] md:h-20 w-48 md:w-64 overflow-hidden align-middle">
              <AnimatePresence mode="popLayout">
                <span 
                    className={`
                        inline-block 
                        font-extrabold 
                        text-5xl md:text-8xl
                        invisible
                        whitespace-nowrap
                        ${gradientClasses}
                    `}
                    aria-hidden="true" // Hide from screen readers
                >
                    Storefromt
                </span>
                <motion.span
                  key={currentIndex}
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className={`absolute top-0 left-0 font-bold text-4xl md:text-6xl ${gradientClasses}`}
                >
                  {items[currentIndex].word.trim()}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>
        </div>

        {/* Image Gallery Slider */}
        <div className="flex flex-col items-center mb-6">
          {/* WINDOW */}
          <div className={`relative w-full max-w-5xl min-h-[15rem] h-full max-h-[40rem] overflow-hidden rounded-2xl bg-gradient-rose md:bg-black/10 p-4 md:p-6 shadow-xl`}>
            {/* ROW: no absolute positioning -> no overlap */}
            <div className="flex w-full h-full items-center justify-center gap-4 md:gap-8">
              {/* LEFT (slightly smaller, clickable) */}
              <button
                type="button"
                aria-label="Previous slide"
                onClick={prevSlide}
                className="hidden md:block basis-2/6 lg:basis-1/4 h-full focus:outline-none"
              >
                <motion.img
                  key={`left-${currentIndex}`}
                  src={items[prevIndex].image}
                  alt={items[prevIndex].word}
                  initial={{ x: -80, opacity: 0.5, scale: 0.9 }}
                  animate={{ x: 0, opacity: 0.85, scale: 0.95 }}
                  exit={{ x: -80, opacity: 0.5, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-[75%] object-contain rounded-xl shadow-2xl"
                />
              </button>

              {/* CENTER (largest, with strong shadow) */}
              <div className="basis-3/6 lg:basis-1/2 h-full rounded-2xl overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={items[currentIndex].image}
                    src={items[currentIndex].image}
                    alt={items[currentIndex].word}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full object-contain rounded-xl shadow-2xl"
                  />
                </AnimatePresence>
              </div>

              {/* RIGHT (slightly smaller, clickable) */}
              <button
                type="button"
                aria-label="Next slide"
                onClick={nextSlide}
                className="hidden md:block basis-2/6 lg:basis-1/4 h-full focus:outline-none"
              >
                <motion.img
                  key={`right-${currentIndex}`}
                  src={items[nextIndex].image}
                  alt={items[nextIndex].word}
                  initial={{ x: 80, opacity: 0.5, scale: 0.9 }}
                  animate={{ x: 0, opacity: 0.85, scale: 0.95 }}
                  exit={{ x: 80, opacity: 0.5, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-[75%] object-contain rounded-xl shadow-2xl"
                />
              </button>
            </div>
          </div>

          {/* Dots */}
          <div
            className="flex items-center gap-3 mt-6"
            role="tablist"
            aria-label="Slide selector"
          >
            {items.map((_, index) => (
              <button
                key={index}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-cyan-700 scale-125"
                    : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
