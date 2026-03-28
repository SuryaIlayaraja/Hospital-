import React from "react";
import { Heart, Phone, MapPin } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0d1117] pt-16 pb-6 text-gray-400 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section - 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1 - Hospital Info */}
          <div className="space-y-6">
            <h3 className="text-white font-bold uppercase tracking-[0.1em] text-[13px]">
              VIKRAM HOSPITAL
            </h3>
            <p className="text-[#64748b] text-[14px] leading-relaxed">
              A leading Multi-speciality Hospital in Chennai, Tamil Nadu. World-class care, affordable for all.
            </p>
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4 text-blue-500" />
                </div>
                <span className="text-[#64748b] text-[14px]">+91 44 711 3333</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-blue-500" />
                </div>
                <span className="text-[#64748b] text-[14px]">Chennai, Tamil Nadu</span>
              </div>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="space-y-6">
            <h3 className="text-white font-bold uppercase tracking-[0.1em] text-[13px]">
              QUICK LINKS
            </h3>
            <div className="flex flex-col space-y-2">
              {["Home", "About Us", "Services", "Specialities", "Contact"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-[#64748b] text-[14px] leading-[2] hover:text-white transition-colors duration-200 block"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Column 3 - Specialities */}
          <div className="space-y-6">
            <h3 className="text-white font-bold uppercase tracking-[0.1em] text-[13px]">
              SPECIALITIES
            </h3>
            <div className="flex flex-col space-y-2">
              {["Cardiology", "Neurology", "Orthopaedics", "Oncology", "IVF & Fertility"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-[#64748b] text-[14px] leading-[2] hover:text-white transition-colors duration-200 block"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Column 4 - 24 Hrs Services */}
          <div className="space-y-6">
            <h3 className="text-white font-bold uppercase tracking-[0.1em] text-[13px]">
              24 HRS SERVICES
            </h3>
            <div className="flex flex-col space-y-2">
              {["Emergency", "Ambulance", "Blood Bank", "ICU", "Pharmacy"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-[#64748b] text-[14px] leading-[2] hover:text-white transition-colors duration-200 block"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="w-full border-t border-[rgba(255,255,255,0.08)] pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[14px] text-[#64748b]">
            &copy; 2025 Vikram Hospital, Chennai. All Rights Reserved.
          </p>
          <div className="flex items-center gap-1.5 text-[14px] text-[#64748b]">
            Designed with <Heart className="h-3.5 w-3.5 text-orange-500 fill-orange-500" /> for better healthcare
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
