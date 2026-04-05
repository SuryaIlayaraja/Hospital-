import React, { useState, useEffect } from "react";
import { Quote, Star, MessageSquareQuote } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { getTestimonials, Testimonial } from "../services/apiService";

const Testimonials: React.FC = () => {
  const { t } = useLanguage();
  const [dynamicTestimonials, setDynamicTestimonials] = useState<Testimonial[]>([]);
  
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await getTestimonials();
        if (response.success && response.data && response.data.length > 0) {
          setDynamicTestimonials(response.data);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      }
    };
    fetchTestimonials();
  }, []);

  // LOGIC: Only show dynamic testimonials from the database.
  // If the user hasn't added any or has cleared the DB, it will show NOTHING on the dashboard.
  if (dynamicTestimonials.length === 0) {
     return null; 
  }

  const testimonials = dynamicTestimonials;

  return (
    <section className="py-24 relative overflow-hidden bg-white dark:bg-[#0a0a0a]">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
              <Star className="h-4 w-4 text-blue-500 fill-blue-500" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Trusted by Professionals
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              {t('testimonials.title')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">{t('testimonials.accent')}</span>
            </h2>
          </div>
          <div className="hidden md:block">
            <p className="text-gray-500 dark:text-gray-400 max-w-xs text-right text-sm leading-relaxed">
              Real feedback from healthcare experts about their experience with our medical standards.
            </p>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div 
              key={testimonial.id || idx}
              className={`group relative p-8 rounded-[2rem] bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 ${
                idx === 1 ? 'lg:scale-105 lg:z-20 lg:shadow-xl lg:shadow-blue-500/5 lg:bg-white/40 lg:dark:bg-white/[0.04]' : ''
              }`}
            >
              {/* Card Decoration */}
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Quote className="h-16 w-16" />
              </div>

              {/* Quote Icon */}
              <div className="mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                  <MessageSquareQuote className="h-5 w-5" />
                </div>
              </div>

              {/* Testimonial Text */}
              <div className="mb-8">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic">
                  "{testimonial.text}"
                </p>
              </div>

              {/* Author Section */}
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-gray-100 dark:border-white/5">
                <div className="relative shrink-0">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity" />
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="relative w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {testimonial.name}
                  </h4>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate uppercase tracking-wider">
                    {testimonial.role} • {testimonial.hospital}
                  </p>
                </div>
              </div>

              {/* Rating Indication */}
              <div className="mt-4 flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-3 w-3 text-blue-500 fill-blue-500" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Trust Indicators */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="text-lg font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Verified Excellence</div>
          <div className="h-px w-24 bg-gray-200 dark:bg-white/10 hidden sm:block" />
          <div className="text-lg font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Accredited Care</div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
