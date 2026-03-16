import React, { useState, useEffect } from "react";
import { Quote } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const Testimonials: React.FC = () => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const testimonials = t('testimonials.list') as any[];

  useEffect(() => {
    if (!testimonials || testimonials.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials]);

  if (!testimonials || testimonials.length === 0) return null;
  const current = testimonials[currentIndex];

  return (
    <section className="py-20 bg-gray-50/50 dark:bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 relative">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white inline-block relative">
            {t('testimonials.title')} <span className="text-indigo-600 dark:text-indigo-400">{t('testimonials.accent')}</span>
            <div className="mt-4 flex justify-center">
              <div className="h-1.5 w-48 bg-gray-800 dark:bg-gray-700 rounded-full relative overflow-hidden">
                <div className="absolute top-0 left-1/3 w-1/3 h-full bg-yellow-500" />
              </div>
            </div>
          </h2>
        </div>

        {/* Testimonial Card */}
        <div className="max-w-4xl mx-auto relative">
          <div className="flex flex-col items-center transition-all duration-500 ease-in-out transform">
            {/* Avatar */}
            <div className="relative mb-8 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-300" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
                <img
                  src={current.image}
                  alt={current.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Quote Block */}
            <div className="relative bg-white dark:bg-gray-800/40 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 w-full text-center">
              <Quote className="absolute top-6 left-8 h-12 w-12 text-gray-200 dark:text-gray-700/50 -scale-x-100" />
              <p className="text-gray-700 dark:text-gray-300 text-lg md:text-xl leading-relaxed font-medium italic relative z-10">
                "{current.text}"
              </p>
            </div>

            {/* Content Details */}
            <div className="mt-12 text-center">
              {/* Three Yellow Dots */}
              <div className="flex justify-center gap-1.5 mb-6">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              </div>

              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {current.name}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {current.role} {current.hospital}
              </p>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center gap-3 mt-12">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all duration-300 ${
                    idx === currentIndex
                      ? "w-8 h-3 bg-yellow-500 rounded-full"
                      : "w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded-full hover:bg-yellow-200"
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
