import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
const translations = {
  en: {
    // Header & Nav
    'hospital.name': 'Vikram ENT Hospital',
    'hospital.location': 'Coimbatore',
    'opdFeedback': 'OPD Feedback',
    'ipdFeedback': 'IPD Feedback',
    'admin': 'Admin',
    'about': 'About',
    'raiseTicket': 'Raise Ticket',
    'backToHome': 'Back to Home',
    
    // Hero
    'elevateYour': 'Elevate Your',
    'healthcare': 'Healthcare',
    'subtitle': 'Curated high-performance care for patients, families, and professionals. Experience the difference of quality healthcare.',
    'shareFeedback': 'Share Feedback',
    'meetDoctors': 'Meet Our Doctors',
    
    // Dashboard Sections
    'quickAccess': 'Quick Access',
    'shareExperience': 'Share your experience',
    'rateStay': 'Rate your stay',
    'viewAnalytics': 'View analytics',
    'getSupport': 'Get support',
    
    // Features
    'emergency247': '24/7 Emergency Services',
    'emergencyDesc': 'Free expedited care on all emergencies over priority. Get immediate assistance when you need it most.',
    'expertDoctors': 'Expert Doctors',
    'expertDesc': 'Every healthcare service comes with our comprehensive quality guarantee and experienced medical professionals.',
    'premiumCare': 'Premium Care',
    'premiumDesc': 'Hand-picked services that meet our high standards for excellence in patient care and satisfaction.',
    
    // About / Story Section
    'about.est': 'Est. 2010 • Excellence in ENT Care',
    'about.redefining': 'Redefining',
    'about.redefiningCard': 'Healthcare',
    'about.heroDesc': 'Where compassion meets cutting-edge medical technology. Setting the benchmark for excellence in patient care since 2010.',
    'about.years': 'Years',
    'about.patients': 'Patients',
    'about.doctors': 'Doctors',
    'about.emergency': 'Emergency',
    'about.story.tag': 'Our Story',
    'about.story.legacy': 'A Legacy of',
    'about.story.healing': 'Healing',
    'about.story.desc': 'Vikram ENT Hospital is a premier healthcare facility dedicated to providing world-class medical services. With state-of-the-art infrastructure and a team of highly qualified medical professionals, we are committed to delivering exceptional patient care that transforms lives.',
    'about.nabh': 'NABH Accredited',
    'about.tech': 'Advanced Technology',
    'about.expertTeam': 'Expert Team',
    'about.teamImageAlt': 'Our Medical Team',
    'about.care247': '24/7 Care Available',
    'about.teamReady': 'Our team is always ready to serve',
    'about.purpose': 'Our Purpose',
    'about.mission.desc': 'To provide accessible, affordable, and quality healthcare services to all sections of society with compassion and dedication. We believe in healing with a human touch.',
    'about.vision.desc': 'To be recognized as a leading healthcare institution known for clinical excellence, patient satisfaction, and innovative medical practices that set new standards.',
    'about.advancing': 'ADVANCING EVERY DAY →',
    'about.facilities.tag': 'World-Class Facilities',
    'about.facilities.title': 'State of the Art',
    'about.facilities.desc': 'Equipped with the latest medical technology and designed for patient comfort',
    'about.fac1.title': 'Advanced Diagnostics',
    'about.fac1.desc': 'Cutting-edge diagnostic equipment',
    'about.fac2.title': 'Emergency Services',
    'about.fac2.desc': 'Round-the-clock emergency care',
    'about.fac3.title': 'Operation Theaters',
    'about.fac3.desc': 'Modern surgical suites',
    'about.fac4.title': 'Intensive Care',
    'about.fac4.desc': '24/7 monitored ICU beds',
    'about.values.tag': 'What We Stand For',
    'about.values.title': 'Our',
    'about.values.accent': 'Values',
    'about.values.desc': 'The principles that guide every decision we make and every life we touch.',
    'about.getInTouch': 'Get In Touch',
    'about.address.dummy': '123 Medical District, Healthcare City, State - 600001',
    'about.email': 'Email',
    'about.connect': 'Connect With Us',
    'about.rights': '© 2026 Vikram Hospital. All rights reserved.',

    // Centres of Excellence
    'coe.title': 'Centres Of',
    'coe.accent': 'Excellence',
    'coe.desc': 'Combining the best specialists and equipment to provide you nothing short of the best in healthcare.',
    'coe.cardiology': 'Cardiology',
    'coe.orthopedics': 'Orthopedics',
    'coe.oncology': 'Oncology',
    'coe.neurology': 'Neurology',
    'coe.gastro': 'Gastroenterology',
    'coe.nephro': 'Nephrology & Urology',

    // Welcome Section
    'welcome.title': 'Welcome To',
    'welcome.accent': 'Vikram ENT',
    'welcome.leader': 'The International Leader in',
    'welcome.leaderAccent': 'ENT Care',
    'welcome.desc': 'Looking for the best ENT Hospital in Coimbatore that not only treats you but truly understands what you’re going through? Vikram ENT Hospital and Research Institute has offered the best compassionate and specialised care for your ear, nose and throat conditions since 1972.',

    // Stats
    'stats.experience': 'Years of Experience',
    'stats.doctors': 'Expert Doctors',
    'stats.procedures': 'Successful Procedures',
    'stats.lives': 'Lives Touched',

    // Final Section
    'flow.tag': 'Patient Lifeline',
    'flow.title': 'Committed to the',
    'flow.accent': 'Flow of Healing',
    'flow.desc': 'At Vikram ENT, every pulse and every procedure is dedicated to your complete recovery and well-being.',

    // Doctors Section
    'medicalExcellence': 'Medical Excellence',
    'meetOur': 'Meet Our',
    'expertDoctorsTitle': 'Expert Doctors',
    'teamDesc': 'Our team of dedicated professionals is committed to providing you with the highest quality of care.',
    'loadingDoctors': 'Loading Doctors...',
    'noDoctors': 'No Doctors Found',
    'noDoctorsDesc': 'We could not find any doctors at this time. Please check back later.',
    
    // Testimonials
    'testimonials.title': 'Our',
    'testimonials.accent': 'Testimonials',
    'testimonials.list': [
      {
        id: 1,
        name: "Dr. Pradnya Gajallewar",
        role: "Consultant and Anesthesiologist",
        hospital: "Bethany Hospital Thane",
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=150&q=80",
        text: "I thank Dr.Vishal Jadhav for your Knowledge and guidance in bringing my project to a good shape. I have already had some positive feedback about my project from some of my friends. I'll be surely recommending your services."
      },
      {
        id: 2,
        name: "Dr. Rajesh Kumar",
        role: "Senior Surgeon",
        hospital: "City Medical Center",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=150&q=80",
        text: "The clinical management system has significantly improved our workflow. The attention to detail and professional support provided by the team at Vikram ENT is exceptional."
      },
      {
        id: 3,
        name: "Dr. Anita Sharma",
        role: "ENT Specialist",
        hospital: "Global Health Hospital",
        image: "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&w=150&q=80",
        text: "I highly recommend the specialized training and facilities at Vikram ENT. It has been a pleasure collaborating on complex cases and witnessing the 'Flow of Healing' firsthand."
      },
      {
        id: 4,
        name: "Dr. Sanjay Gupta",
        role: "Neurologist",
        hospital: "Apex Neuro Center",
        image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80",
        text: "Working with the Vikram ENT team has been a revelation in inter-disciplinary care. Their use of advanced diagnostics for complex cases is truly world-class."
      },
      {
        id: 5,
        name: "Dr. Priya Varma",
        role: "Pediatrician",
        hospital: "Little Hearts Clinic",
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=150&q=80",
        text: "The patient care at Vikram ENT is second to none. They treat every child with extraordinary compassion and patience, making them the best ENT facility for families."
      },
      {
        id: 6,
        name: "Dr. Mohamed Ibrahim",
        role: "Cardiologist",
        hospital: "Unity Health Institute",
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80",
        text: "Integrity and innovation are at the core of Vikram ENT. Their commitment to continuous improvement ensures that patients always receive the best possible medical outcomes."
      }
    ],

    // Badge & Notice
    'badge.matters': 'Your Perspective Matters: Helping Us Deliver World-Class Care Every Day.',
    'badge.committed': 'Committed to Excellence through Quality Care and Transparent Patient Feedback.',
    'notice.value': 'We value your feedback on our services',
    'notice.serve': 'Help us serve you better by sharing your experience',
    'notice.welcome': 'Feedback from In-patients and Out-patients is welcome',

    // Images
    'hero.images': [
      {
        url: "/hero_doctors_nebula.png",
        alt: "Our Expert Doctors",
        title: "Expert Doctors"
      },
      {
        url: "/operational_theater.png",
        alt: "Modern Operational Theatre",
        title: "Advanced Facilities"
      },
      {
        url: "/patient_satisfied.png",
        alt: "Satisfied Patient",
        title: "Patient Satisfaction"
      }
    ],

    // Complex Arrays
    'facilities': [
      'Advanced ENT Care',
      'Modern Diagnostic Lab',
      '24/7 Pharmacy',
      'Emergency Services',
      'In-patient Rooms',
      'Hearing Aid Center'
    ],
    'valuesItems': [
      {
        title: "Integrity",
        desc: ["We uphold the highest ethical standards in all our actions and decisions."],
        icon: "Shield"
      },
      {
        title: "Compassion",
        desc: ["We treat every patient with empathy, respect, and a caring heart."],
        icon: "Heart"
      },
      {
        title: "Excellence",
        desc: ["We strive for the highest quality in every medical procedure and service."],
        icon: "Star"
      },
      {
        title: "Innovation",
        desc: ["We embrace new medical technologies to improve patient outcomes."],
        icon: "Zap"
      },
      {
        title: "Patient-First",
        desc: ["Your well-being is our top priority in everything we do."],
        icon: "Users"
      }
    ]
  },
  ta: {
    // Header & Nav
    'hospital.name': 'விக்ரம் ENT மருத்துவமனை',
    'hospital.location': 'கோயம்புத்தூர்',
    'opdFeedback': 'வெளிநோயாளர் கருத்து',
    'ipdFeedback': 'உள்நோயாளர் கருத்து',
    'admin': 'நிர்வாகம்',
    'about': 'எங்களைப் பற்றி',
    'raiseTicket': 'புகார் பதிவு',
    'backToHome': 'முகப்புக்கு திரும்பு',
    
    // Hero
    'elevateYour': 'உங்கள்',
    'healthcare': 'சுகாதாரத்தை மேம்படுத்துங்கள்',
    'subtitle': 'நோயாளிகள், குடும்பங்கள் மற்றும் நிபுணர்களுக்கான உயர்தர சுகாதார சேவைகள். தரமான சுகாதாரத்தின் வித்தியாசத்தை அனுபவியுங்கள்.',
    'shareFeedback': 'கருத்து பகிர்',
    'meetDoctors': 'மருத்துவர்களை சந்திக்கவும்',
    
    // Dashboard Sections
    'quickAccess': 'விரைவு அணுகல்',
    'shareExperience': 'உங்கள் அனுபவத்தை பகிருங்கள்',
    'rateStay': 'தங்கலை மதிப்பிடுங்கள்',
    'viewAnalytics': 'புள்ளிவிவரங்களை பார்க்கவும்',
    'getSupport': 'ஆதரவு பெறவும்',
    
    // Features
    'emergency247': '24/7 அவசர சேவைகள்',
    'emergencyDesc': 'அனைத்து அவசர சேவைகளுக்கும் முன்னுரிமை அடிப்படையில் இலவச சிகிச்சை. உங்களுக்கு தேவைப்படும் போது உடனடி உதவி பெறுங்கள்.',
    'expertDoctors': 'நிபுணர் மருத்துவர்கள்',
    'expertDesc': 'ஒவ்வொரு சுகாதார சேவையும் எங்கள் விரிவான தர உத்தரவாதம் மற்றும் அனுபவமிக்க மருத்துவ நிபுணர்களுடன் வருகிறது.',
    'premiumCare': 'சிறந்த பராமரிப்பு',
    'premiumDesc': 'நோயாளி பராமரிப்பு மற்றும் திருப்தியில் சிறந்து விளங்கும் எங்கள் உயர் தரத்தை பூர்த்தி செய்யும் சேவைகள்.',
    
    // About / Story Section
    'about.est': '2010 முதல் • ENT சிகிச்சையில் சிறந்தது',
    'about.redefining': 'மருத்துவ',
    'about.redefiningCard': 'சேவையை மறுவரையறை',
    'about.heroDesc': 'கருணை மற்றும் நவீன மருத்துவ தொழில்நுட்பம் சந்திக்கும் இடம். 2010 முதல் நோயாளி பராமரிப்பில் சிறப்பை நிலைநாட்டுகிறோம்.',
    'about.years': 'ஆண்டுகள்',
    'about.patients': 'நோயாளிகள்',
    'about.doctors': 'மருத்துவர்கள்',
    'about.emergency': 'அவசரம்',
    'about.story.tag': 'எங்கள் கதை',
    'about.story.legacy': 'குணப்படுத்துதலின்',
    'about.story.healing': 'மரபு',
    'about.story.desc': 'விக்ரம் ENT மருத்துவமனை உலகத்தரம் வாய்ந்த மருத்துவ சேவைகளை வழங்குவதற்கு அர்ப்பணிக்கப்பட்ட ஒரு முன்னணி சுகாதார வசதி ஆகும். அதிநவீன உள்கட்டமைப்பு மற்றும் உயர் தகுதி வாய்ந்த மருத்துவ நிபுணர்கள் குழுவுடன், வாழ்க்கையை மாற்றும் விதிவிலக்கான நோயாளி பராமரிப்பை வழங்க நாங்கள் உறுதிபூண்டுள்ளோம்.',
    'about.nabh': 'NABH அங்கீகாரம்',
    'about.tech': 'நவீன தொழில்நுட்பம்',
    'about.expertTeam': 'நிபுணர் குழு',
    'about.teamImageAlt': 'எங்கள் மருத்துவ குழு',
    'about.care247': '24/7 பராமரிப்பு',
    'about.teamReady': 'எங்கள் குழு எப்போதும் தயாராக உள்ளது',
    'about.purpose': 'எங்கள் நோக்கம்',
    'about.mission.desc': 'இரக்கம் மற்றும் அர்ப்பணிப்புடன் சமூகத்தின் அனைத்து பிரிவினருக்கும் அணுகக்கூடிய, மலிவு மற்றும் தரமான சுகாதார சேவைகளை வழங்குவது. மனித நேயத்துடன் குணப்படுத்துவதை நாங்கள் நம்புகிறோம்.',
    'about.vision.desc': 'மருத்துவ சிறப்பு, நோயாளி திருப்தி மற்றும் புதிய தரநிலைகளை அமைக்கும் புதுமையான மருத்துவ நடைமுறைகளுக்காக அறியப்பட்ட முன்னணி சுகாதார நிறுவனமாக அங்கீகரிக்கப்பட வேண்டும்.',
    'about.advancing': 'ஒவ்வொரு நாளும் முன்னேறுகிறோம் →',
    'about.facilities.tag': 'உலகத்தரம் வாய்ந்த வசதிகள்',
    'about.facilities.title': 'நவீன வசதிகள்',
    'about.facilities.desc': 'சமீபத்திய மருத்துவ தொழில்நுட்பம் மற்றும் நோயாளி வசதிக்காக வடிவமைக்கப்பட்டது',
    'about.fac1.title': 'மேம்பட்ட நோயறிதல்',
    'about.fac1.desc': 'நவீன நோயறிதல் கருவிகள்',
    'about.fac2.title': 'அவசர சேவைகள்',
    'about.fac2.desc': '24 மணி நேர அவசர சிகிச்சை',
    'about.fac3.title': 'அறுவை சிகிச்சை அரங்கு',
    'about.fac3.desc': 'நவீன அறுவை சிகிச்சை அறைகள்',
    'about.fac4.title': 'தீவிர சிகிச்சை',
    'about.fac4.desc': '24/7 கண்காணிப்பு ICU படுக்கைகள்',
    'about.values.tag': 'நாங்கள் எதை பிரதிநிதித்துவப்படுகிறோம்',
    'about.values.title': 'எங்கள்',
    'about.values.accent': 'மதிப்புகள்',
    'about.values.desc': 'நாங்கள் எடுக்கும் ஒவ்வொரு முடிவையும் நாங்கள் சிகிச்சையளிக்கும் ஒவ்வொரு உயிரையும் வழிநடத்தும் கோட்பாடுகள்.',
    'about.getInTouch': 'தொடர்பு கொள்ளுங்கள்',
    'about.address.dummy': '123 மருத்துவ மாவட்டம், சுகாதார நகரம், மாநிலம் - 600001',
    'about.email': 'மின்னஞ்சல்',
    'about.connect': 'எங்களுடன் இணையுங்கள்',
    'about.rights': '© 2026 விக்ரம் மருத்துவமனை. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',

    // Centres of Excellence
    'coe.title': 'சிறப்பு',
    'coe.accent': 'மையங்கள்',
    'coe.desc': 'உங்களுக்கு சிறந்த சுகாதார சேவையை வழங்க சிறந்த நிபுணர்கள் மற்றும் உபகரணங்களை இணைக்கிறோம்.',
    'coe.cardiology': 'இருதயவியல்',
    'coe.orthopedics': 'எலும்பியல்',
    'coe.oncology': 'புற்றுநோயியல்',
    'coe.neurology': 'நரம்பியல்',
    'coe.gastro': 'இரைப்பை குடல் நோய்',
    'coe.nephro': 'சிறுநீரகவியல் மற்றும் சிறுநீரகம்',

    // Welcome Section
    'welcome.title': 'விக்ரம் ENT-க்கு',
    'welcome.accent': 'வரவேற்கிறோம்',
    'welcome.leader': 'ENT பராமரிப்பில்',
    'welcome.leaderAccent': 'சர்வதேச தலைவர்',
    'welcome.desc': 'உங்களை சிகிச்சையளிப்பதோடு மட்டுமல்லாமல், நீங்கள் என்ன செய்கிறீர்கள் என்பதை உண்மையாகப் புரிந்துகொள்ளும் கோயம்புத்தூரில் உள்ள சிறந்த ENT மருத்துவமனையைத் தேடுகிறீர்களா? விக்ரம் ENT மருத்துவமனை மற்றும் ஆராய்ச்சி நிறுவனம் 1972 முதல் உங்கள் காது, மூக்கு மற்றும் தொண்டை நிலைமைகளுக்கு சிறந்த கருணை மற்றும் சிறப்பு பராமரிப்பை வழங்குகிறது.',

    // Stats
    'stats.experience': 'ஆண்டுகால அனுபவம்',
    'stats.doctors': 'நிபுணர் மருத்துவர்கள்',
    'stats.procedures': 'வெற்றிகரமான சிகிச்சைகள்',
    'stats.lives': 'வாழ்நாட்கள் தொடப்பட்டன',

    // Final Section
    'flow.tag': 'நோயாளி உயிர்நாடி',
    'flow.title': 'குணப்படுத்துதலின்',
    'flow.accent': 'ஓட்டத்திற்கு உறுதியளிக்கிறோம்',
    'flow.desc': 'விக்ரம் ENT இல், ஒவ்வொரு துடிப்பும் ஒவ்வொரு செயல்முறையும் உங்களது முழுமையான மீட்சி மற்றும் நல்வாழ்வுக்காக அர்ப்பணிக்கப்பட்டுள்ளது.',

    // Doctors Section
    'medicalExcellence': 'மருத்துவ சிறப்பு',
    'meetOur': 'எங்கள்',
    'expertDoctorsTitle': 'நிபுணர் மருத்துவர்களை சந்திக்கவும்',
    'teamDesc': 'எங்கள் அர்ப்பணிப்புள்ள வல்லுநர்கள் குழு உங்களுக்கு மிக உயர்ந்த தரமான பராமரிப்பை வழங்க உறுதிபூண்டுள்ளது.',
    'loadingDoctors': 'மருத்துவர்கள் விவரங்கள் ஏற்றப்படுகின்றன...',
    'noDoctors': 'மருத்துவர்கள் யாரும் இல்லை',
    'noDoctorsDesc': 'தற்போது மருத்துவர்கள் யாரும் இல்லை. சிறிது நேரம் கழித்து மீண்டும் பார்க்கவும்.',
    
    // Testimonials
    'testimonials.title': 'எங்கள்',
    'testimonials.accent': 'சான்றுகள்',
    'testimonials.list': [
      {
        id: 1,
        name: "டாக்டர் பிரக்ஞா கஜலேவார்",
        role: "ஆலோசகர் மற்றும் மயக்க மருந்து நிபுணர்",
        hospital: "பெத்தானி மருத்துவமனை தானே",
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=150&q=80",
        text: "எனது திட்டத்தை ஒரு நல்ல வடிவத்திற்கு கொண்டு வருவதில் உங்கள் அறிவு மற்றும் வழிகாட்டுதலுக்காக டாக்டர் விஷால் ஜாதவ் அவர்களுக்கு நன்றி கூறுகிறேன். எனது சில நண்பர்களிடமிருந்து எனது திட்டம் குறித்து ஏற்கனவே சில நேர்மறையான கருத்துக்களைப் பெற்றுள்ளேன். உங்கள் சேவைகளை நான் நிச்சயமாக பரிந்துரைப்பேன்."
      },
      {
        id: 2,
        name: "டாக்டர் ராஜேஷ் குமார்",
        role: "மூத்த அறுவை சிகிச்சை நிபுணர்",
        hospital: "சிட்டி மருத்துவ மையம்",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=150&q=80",
        text: "மருத்துவ மேலாண்மை அமைப்பு எங்களது பணிப்பாய்வுகளை கணிசமாக மேம்படுத்தியுள்ளது. விக்ரம் ENT குழுவினரால் வழங்கப்பட்ட விவரம் மற்றும் தொழில்முறை ஆதரவு விதிவிலக்கானது."
      },
      {
        id: 3,
        name: "டாக்டர் அனிதா சர்மா",
        role: "ENT நிபுணர்",
        hospital: "குளோபல் ஹெல்த் மருத்துவமனை",
        image: "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&w=150&q=80",
        text: "விக்ரம் ENT இல் உள்ள சிறப்பு பயிற்சி மற்றும் வசதிகளை நான் கடுமையாக பரிந்துரைக்கிறேன். சிக்கலான வழக்குகளில் ஒத்துழைப்பதும், 'குணப்படுத்தும் ஓட்டத்தை' நேரடியாகக் காண்பதும் மகிழ்ச்சியாக இருந்தது."
      },
      {
        id: 4,
        name: "டாக்டர் சஞ்சய் குப்தா",
        role: "நரம்பியல் நிபுணர்",
        hospital: "அபெக்ஸ் நியூரோ மையம்",
        image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80",
        text: "விக்ரம் ENT குழுவினருடன் பணியாற்றுவது பலதுறை பராமரிப்பில் ஒரு புதிய மாற்றமாகும். சிக்கலான வழக்குகளுக்கு அவர்கள் மேம்பட்ட நோயறிதலைப் பயன்படுத்துவது உண்மையிலேயே உலகத்தரம் வாய்ந்தது."
      },
      {
        id: 5,
        name: "டாக்டர் பிரியா வர்மா",
        role: "குழந்தை மருத்துவர்",
        hospital: "லிட்டில் ஹார்ட்ஸ் கிளினிக்",
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=150&q=80",
        text: "விக்ரம் ENT இல் உள்ள நோயாளி பராமரிப்பு யாருக்கும் குறைவானது அல்ல. அவர்கள் ஒவ்வொரு குழந்தையையும் அசாதாரண கருணை மற்றும் பொறுமையுடன் நடத்துகிறார்கள், இது குடும்பங்களுக்கான சிறந்த ENT வசதியாக மாற்றுகிறது."
      },
      {
        id: 6,
        name: "டாக்டர் முகமது இப்ராஹிம்",
        role: "இருதய மருத்துவர்",
        hospital: "யுனிட்டி ஹெல்த் நிறுவனம்",
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80",
        text: "நேர்மை மற்றும் புதுமை ஆகியவை விக்ரம் ENT இன் மையத்தில் உள்ளன. தொடர்ச்சியான முன்னேற்றத்திற்கான அவர்களின் அர்ப்பணிப்பு நோயாளிகள் எப்போதும் சிறந்த மருத்துவ முடிவுகளைப் பெறுவதை உறுதி செய்கிறது."
      }
    ],

    // Badge & Notice
    'badge.matters': 'உங்கள் பார்வை முக்கியமானது: ஒவ்வொரு நாளும் உலகத்தரம் வாய்ந்த பராமரிப்பை வழங்க எங்களுக்கு உதவுகிறது.',
    'badge.committed': 'தரமான பராமரிப்பு மற்றும் வெளிப்படையான நோயாளி கருத்துக்கள் மூலம் சிறந்து விளங்க உறுதிபூண்டுள்ளோம்.',
    'notice.value': 'எங்கள் சேவைகள் குறித்த உங்கள் கருத்தை நாங்கள் மதிக்கிறோம்',
    'notice.serve': 'உங்கள் அனுபவத்தைப் பகிர்ந்து கொள்வதன் மூலம் உங்களுக்கு சிறந்த முறையில் சேவை செய்ய எங்களுக்கு உதவுங்கள்',
    'notice.welcome': 'உள்நோயாளிகள் மற்றும் வெளிநோயாளிகளின் கருத்துக்கள் வரவேற்கப்படுகின்றன',

    // Images
    'hero.images': [
      {
        url: "/hero_doctors_nebula.png",
        alt: "எங்கள் நிபுணர் மருத்துவர்கள்",
        title: "நிபுணர் மருத்துவர்கள்"
      },
      {
        url: "/operational_theater.png",
        alt: "நவீன அறுவை சிகிச்சை அரங்கு",
        title: "மேம்பட்ட வசதிகள்"
      },
      {
        url: "/patient_satisfied.png",
        alt: "திருப்தியான நோயாளி",
        title: "நோயாளி திருப்தி"
      }
    ],

    // Complex Arrays
    'facilities': [
      'மேம்பட்ட ENT பராமரிப்பு',
      'நவீன நோயறிதல் ஆய்வகம்',
      '24/7 மருந்தகம்',
      'அவசர சேவைகள்',
      'உள்நோயாளி அறைகள்',
      'காது கேட்கும் கருவி மையம்'
    ],
    'valuesItems': [
      {
        title: "நேர்மை",
        desc: ["எங்கள் அனைத்து செயல்களிலும் முடிவுகளிலும் மிக உயர்ந்த தார்மீக தரத்தை கடைபிடிக்கிறோம்."],
        icon: "Shield"
      },
      {
        title: "கருணை",
        desc: ["ஒவ்வொரு நோயாளியையும் இரக்கம் மற்றும் மரியாதையுடனும் நடத்துகிறோம்."],
        icon: "Heart"
      },
      {
        title: "சிறப்பு",
        desc: ["ஒவ்வொரு மருத்துவ நடைமுறையிலும் மிக உயர்ந்த தரத்திற்காக பாடுபடுகிறோம்."],
        icon: "Star"
      },
      {
        title: "புதுமை",
        desc: ["நோயாளி விளைவுகளை மேம்படுத்த புதிய மருத்துவத் தொழில்நுட்பங்களை ஏற்றுக்கொள்கிறோம்."],
        icon: "Zap"
      },
      {
        title: "நோயாளி-முதலில்",
        desc: ["நாங்கள் செய்யும் எல்லாவற்றிலும் உங்கள் நல்வாழ்வே எங்களது முன்னுரிமை."],
        icon: "Users"
      }
    ]
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): any => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
