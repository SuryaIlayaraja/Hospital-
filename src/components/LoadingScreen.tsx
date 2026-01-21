import React, { useState, useEffect } from 'react';
import { Building2, Heart, Users, Activity } from 'lucide-react';

// Fallback images in case local images are not available
const FALLBACK_BACKGROUND = 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
const FALLBACK_DOCTOR = 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {

  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    { text: "Initializing Hospital System", icon: Building2 },
    { text: "Loading Patient Services", icon: Heart },
    { text: "Preparing Feedback System", icon: Users },
    { text: "System Ready", icon: Activity }
  ];

  useEffect(() => {
    // Total duration for loading (4 seconds)
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Heartbeat Sound Synthesis
  useEffect(() => {
    let audioCtx: AudioContext | null = null;
    let heartbeatInterval: NodeJS.Timeout;

    const playHeartbeat = () => {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;

      // Lub sound (First beat - lower frequency, Max Volume)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.8, now + 0.05); // Boosted to 0.8
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Dub sound (Second beat - slightly higher/tighter, Max Volume)
      const dubTime = now + 0.22;
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(45, dubTime);
      gain2.gain.setValueAtTime(0, dubTime);
      gain2.gain.linearRampToValueAtTime(0.6, dubTime + 0.05); // Boosted to 0.6
      gain2.gain.exponentialRampToValueAtTime(0.001, dubTime + 0.25);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(dubTime);
      osc2.stop(dubTime + 0.3);
    };

    const startHeartbeat = () => {
      playHeartbeat();
      heartbeatInterval = setInterval(playHeartbeat, 1100); 
    };

    // Aggressive resume on any interaction
    const resumeAudio = () => {
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    };

    window.addEventListener('mousedown', resumeAudio);
    window.addEventListener('touchstart', resumeAudio);
    window.addEventListener('keydown', resumeAudio);

    startHeartbeat();

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (audioCtx) audioCtx.close();
      window.removeEventListener('mousedown', resumeAudio);
      window.removeEventListener('touchstart', resumeAudio);
      window.removeEventListener('keydown', resumeAudio);
    };
  }, []);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 600);

    return () => clearInterval(stepInterval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 bg-[#0a0a0a] z-50 flex items-center justify-center transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full bg-no-repeat"
          style={{
            backgroundImage: `url(/images/doctor1.jpg), url(${FALLBACK_BACKGROUND})`,
            backgroundPosition: 'center 20%',
            backgroundSize: 'cover'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-8">
        {/* Hospital Logo/Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-[#2563eb] rounded-full shadow-lg mb-4 shadow-[#2563eb]/20">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Vikram Hospital</h1>
          <p className="text-gray-400 text-lg">Patient Feedback Management System</p>
        </div>

        {/* Doctor Image */}
        <div className="mb-8">
          <div className="relative">
            <div className="w-48 h-48 mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-gray-800 animate-pulse">
              <img 
                src="/images/doctor1.jpg" 
                alt="Doctor"
                className="w-full h-full object-cover object-center"
                style={{
                  objectPosition: 'center 25%'
                }}
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_DOCTOR;
                }}
              />
            </div>
            {/* Floating Elements */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
              <Users className="w-4 h-4 text-white" />
            </div>
            {/* Massive Dramatic Pulse Rings */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/40 animate-ping-large" />
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping-large-delayed-1" />
            <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-ping-large-delayed-2" />
            <div className="absolute inset-0 rounded-full border border-purple-500/15 animate-ping-large-delayed-3" />
          </div>
        </div>

        {/* Loading Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  index <= currentStep 
                    ? 'bg-[#2563eb] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                    : 'bg-gray-800 text-gray-500'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 transition-all duration-500 ${
                    index < currentStep ? 'bg-[#2563eb]' : 'bg-gray-800'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-gray-300 text-lg font-medium">
            {steps[currentStep].text}
          </p>
        </div>

        {/* Heartbeat Wave Animation */}
        <div className="mb-10 h-24 flex items-center justify-center relative">
          <svg className="w-full max-w-md h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
            {/* Define the path once for reuse */}
            <path
              id="heartbeat-path-id"
              d="M 0 50 L 100 50 L 110 40 L 120 60 L 130 50 L 180 50 L 190 20 L 200 80 L 210 50 L 260 50 L 270 45 L 280 55 L 290 50 L 400 50"
              fill="none"
            />

            {/* Background static wave line (faint) */}
            <use
              href="#heartbeat-path-id"
              stroke="rgba(37, 99, 235, 0.1)"
              strokeWidth="2"
            />
            
            {/* Animated heartbeat path */}
            <use
              href="#heartbeat-path-id"
              className="heartbeat-path"
              stroke="#ff0000"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Leading Heart Symbol */}
            <g className="heart-follower">
              <animateMotion dur="3s" repeatCount="indefinite">
                <mpath href="#heartbeat-path-id" />
              </animateMotion>
              <path
                d="M0 2.1c-.2-.2-.5-.3-.8-.3-1 0-1.8.8-1.8 1.8 0 .4.1.7.4 1l2.2 2.2 2.2-2.2c.3-.3.4-.6.4-1 0-1-.8-1.8-1.8-1.8-.3 0-.6.1-.8.3l-.2.2-.2-.2z"
                fill="#ff0000"
                transform="scale(2) translate(-2, -5)"
                className="heart-head-glow"
              />
            </g>
          </svg>
          
          <style>{`
            .heartbeat-path {
              stroke-dasharray: 1000;
              stroke-dashoffset: 1000;
              animation: heartbeat-move 3s linear infinite;
            }
            .heart-head-glow {
              filter: drop-shadow(0 0 5px #ff0000);
            }
            @keyframes heartbeat-move {
              0% { stroke-dashoffset: 1000; }
              100% { stroke-dashoffset: 0; }
            }
            @keyframes ping-large {
              75%, 100% {
                transform: scale(3.5);
                opacity: 0;
              }
            }
            .animate-ping-large {
              animation: ping-large 3s cubic-bezier(0, 0, 0.2, 1) infinite;
            }
            .animate-ping-large-delayed-1 {
              animation: ping-large 3s cubic-bezier(0, 0, 0.2, 1) infinite;
              animation-delay: 0.75s;
            }
            .animate-ping-large-delayed-2 {
              animation: ping-large 3s cubic-bezier(0, 0, 0.2, 1) infinite;
              animation-delay: 1.5s;
            }
            .animate-ping-large-delayed-3 {
              animation: ping-large 3s cubic-bezier(0, 0, 0.2, 1) infinite;
              animation-delay: 2.25s;
            }
          `}</style>
        </div>





        {/* Bottom Text */}
        <div className="mt-8 text-gray-500 text-sm">
          <p>Preparing your healthcare feedback experience...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
