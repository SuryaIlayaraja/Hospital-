import React, { useEffect, useState, useRef } from 'react';

interface LoginShapesProps {
  focusedInput: 'email' | 'password' | null;
  emailLength: number;
}

const LoginShapes: React.FC<LoginShapesProps> = ({ focusedInput, emailLength }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Track mouse movement for idle watching
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Calculate relative position (-1 to 1 range)
        const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        setMousePos({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate eye pupil position
  const getPupilStyle = () => {
    let x = 0;
    let y = 0;

    if (focusedInput === 'password') {
      // Look up and away (avoiding eye contact)
      x = 5;
      y = -10;
    } else if (focusedInput === 'email') {
      // Look towards the email input (assumed to be on the right)
      // Tracks the typing position from left to right
      const progress = Math.min(emailLength / 30, 1);
      x = 10 + (progress * 5); // Look distinctly right
      y = 8; // Look down at input
    } else {
      // Idle: follow mouse (clamped)
      x = Math.max(-8, Math.min(8, mousePos.x * 10));
      y = Math.max(-8, Math.min(8, mousePos.y * 10));
    }

    return { transform: `translate(${x}px, ${y}px)` };
  };

  // Eyelid style for "hiding" (password mode)
  const getEyelidStyle = () => {
    if (focusedInput === 'password') {
      return { height: '100%' }; // Fully close eyes/hands cover
    }
    return { height: '0%' };
  };

  // Arm/Hand style for covering eyes
  const getHandStyle = (side: 'left' | 'right') => {
    const isPassword = focusedInput === 'password';
    const baseTransform = side === 'left' ? 'translate(-100%, 100%)' : 'translate(100%, 100%)';
    const activeTransform = side === 'left' 
      ? 'translate(-40%, -60%) rotate(-20deg)' 
      : 'translate(40%, -60%) rotate(20deg)';
      
    return {
      transform: isPassword ? activeTransform : baseTransform,
      opacity: isPassword ? 1 : 0
    };
  };

  // Standardized Round Eye Component
  const SimpleEye = ({ color = "bg-[#FB923C]" }: { color?: string }) => (
    <div className="w-10 h-10 bg-white rounded-full relative overflow-hidden">
      <div 
        className="w-5 h-5 bg-black rounded-full absolute top-1/2 left-1/2 transition-all duration-150 ease-out"
        style={{ ...getPupilStyle(), marginTop: '-10px', marginLeft: '-10px' }}
      />
      {/* Eyelid */}
      <div 
         className="absolute top-0 left-0 w-full transition-all duration-300 ease-in-out z-20"
         style={{ ...getEyelidStyle(), backgroundColor: color }}
       />
    </div>
  );

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-[#f4f4f5] overflow-hidden rounded-l-[2rem]">
      {/* Background Decor */}
      <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-blue-200 opacity-50 blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-32 h-32 rounded-full bg-orange-200 opacity-50 blur-xl animate-bounce duration-[3000ms]" />

      {/* Main Character Group Container */}
      <div className="relative w-80 h-64 flex items-end justify-center">
        
        {/* 1. Purple Shape (Back Left - The Big One) */}
        {/* Reacts by straightening up to look better */}
        <div className={`absolute bottom-0 left-4 w-52 h-56 bg-[#6366F1] rounded-3xl transform origin-bottom-left shadow-xl flex flex-col items-center pt-12 z-0 transition-all duration-500 ease-in-out ${focusedInput === 'email' ? '-rotate-6 scale-105' : '-rotate-12 hover:rotate-[-10deg]'}`}>
          {/* Eyes Container for Purple (Main Interaction) */}
          <div className="flex gap-4 relative">
            <SimpleEye color="#6366F1" />
            <SimpleEye color="#6366F1" />

            {/* Hands/Arms for Purple (The "Monkey" effect) */}
            <div 
                className="absolute w-12 h-14 bg-[#4F46E5] rounded-full border-4 border-[#4338CA] shadow-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-30"
                style={{ ...getHandStyle('left'), left: '-10px', bottom: '-20px' }}
            />
            <div 
                className="absolute w-12 h-14 bg-[#4F46E5] rounded-full border-4 border-[#4338CA] shadow-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-30"
                style={{ ...getHandStyle('right'), right: '-10px', bottom: '-20px' }}
            />
          </div>
        </div>

        {/* 2. Black Shape (Middle - Peeking from behind) */}
        {/* Reacts by peeking up high to read */}
        <div className={`absolute bottom-0 left-44 w-24 h-72 bg-[#18181B] rounded-t-xl shadow-lg flex justify-center pt-10 gap-2 z-10 transition-transform duration-500 ease-out ${focusedInput === 'email' ? '-translate-y-8' : 'hover:-translate-y-2'}`}>
            <SimpleEye color="#18181B" />
            <SimpleEye color="#18181B" />
        </div>

        {/* 3. Orange Shape (Front Left - Semi Circle) */}
        {/* Reacts by 'perking up' / scaling slightly */}
        <div className={`absolute bottom-0 left-6 w-48 h-28 bg-[#FB923C] rounded-t-full shadow-lg flex justify-center pt-10 gap-8 z-30 transition-all duration-500 ease-in-out ${focusedInput === 'email' ? 'scale-105' : 'hover:scale-105'}`}>
            <SimpleEye color="#FB923C" />
            <SimpleEye color="#FB923C" />
        </div>

        {/* 4. Yellow Shape (Far Right - Tall Pill) */}
        {/* Reacts by leaning in towards the text */}
        <div className={`absolute bottom-0 right-8 w-24 h-44 bg-[#FACC15] rounded-t-full rounded-b-lg shadow-lg flex flex-col items-center pt-10 gap-2 z-20 transition-all duration-500 ease-in-out ${focusedInput === 'email' ? '-translate-x-2 -rotate-6' : 'hover:-translate-y-2'}`}>
            <div className="flex gap-1">
               <SimpleEye color="#FACC15" />
               <SimpleEye color="#FACC15" /> 
            </div>
        </div>

      </div>
      
      {/* Interactive Text hint */}
      <div className="absolute top-8 right-8 text-black/10 font-bold text-xs tracking-widest uppercase">
         {focusedInput === 'password' ? "Don't look!" : focusedInput === 'email' ? "Typing..." : "Group Watch"}
      </div>
    </div>
  );
};

export default LoginShapes;
