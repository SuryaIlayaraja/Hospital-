import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
const translations = {
  en: {
    // Header
    'hospital.name': 'Vikram ENT Hospital',
    'hospital.location': 'Coimbatore',
    'nav.opd': 'OPD Feedback',
    'nav.ipd': 'IPD Feedback',
    
    // Progress Bar
    'progress.title': 'Form Progress',
    'progress.completed': 'fields completed',
    'progress.complete': 'Complete',
    'progress.ready': 'Form completed! Ready to submit.',
    
    // Common
    'common.name': 'Name',
    'common.uhid': 'UHID',
    'common.date': 'Date',
    'common.mobile': 'Mobile',
    'common.submit': 'Submit',
    'common.required': '*',
    'common.excellent': 'Excellent',
    'common.good': 'Good',
    'common.average': 'Average',
    
    // OPD
    'opd.title': 'OPD FEEDBACK',
    'opd.subtitle': 'Your feedback helps us improve our outpatient services',
    'opd.patient.info': 'Patient Information',
    'opd.overall.experience': 'Overall Experience',
    'opd.overall.question': 'How do you rate your overall experience?',
    'opd.service.quality': 'Service Quality Rating',
    'opd.submit.button': 'Submit OPD Feedback',
    'opd.appointment.booking': 'Reception - Was the appointment booking easy?',
    'opd.reception.staff': 'Was the Reception staff polite & helpful?',
    'opd.billing.process': 'Billing - Timely Execution of Billing process?',
    'opd.nursing.care': 'Nursing - Care and Courteous behaviour?',
    'opd.lab.staff': 'Lab - Lab staff are Skilled and potential',
    'opd.lab.waiting': 'Waiting time for Lab services',
    'opd.radiology.staff': 'Radiology - Radiology staff are Skilled and potential',
    'opd.radiology.waiting': 'Waiting time for Radiology services',
    'opd.pharmacy.waiting': 'Pharmacy - Waiting time for Pharmacy services',
    'opd.medication.dispensed': 'Was the medication dispensed promptly & correctly?',
    'opd.drug.explanation': 'Explained about the drugs clearly',
    'opd.counselling.session': 'Counselling - Was the counselling session satisfactory?',
    'opd.audiology.staff': 'Audiology - Were the Audiology staff skilled and potential?',
    'opd.hospital.cleanliness': 'Hospitality - Cleanliness of the Hospital?',
    'opd.employee.recognition': 'Employee Recognition',
    'opd.employee.question': 'Would you like to nominate an employee for his/her outstanding service?',
    'opd.employee.placeholder': 'Please mention the employee name and department...',
    'opd.additional.comments': 'Additional Comments',
    'opd.comments.question': 'Any Comments / Suggestions:',
    'opd.comments.placeholder': 'Please share your suggestions or any additional feedback...',
    
    // IPD
    'ipd.title': 'IPD FEEDBACK',
    'ipd.subtitle': 'Your feedback helps us improve our inpatient services',
    'ipd.patient.info': 'Patient Information',
    'ipd.overall.experience': 'Overall Experience',
    'ipd.overall.question': 'How do you rate your overall experience?',
    'ipd.service.quality': 'Service Quality Rating',
    'ipd.submit.button': 'Submit IPD Feedback',
    'ipd.registration.process': 'Admission Desk - Registration Process',
    'ipd.room.readiness': 'Facility - Readiness of the Room / speed of Room Check in',
    'ipd.room.cleanliness': 'Cleanliness of the Room - Toilet/Pillows/sheets',
    'ipd.doctor.explanation': 'Doctor - Explanation of Treatment',
    'ipd.nurse.communication': 'Nurse - Communication, Courtesy & Respect',
    'ipd.plan.explanation': 'Explanation of Plan & Procedures',
    'ipd.promptness.attending': 'Promptness in attending on your Needs',
    'ipd.pharmacy.timeliness': 'Pharmacy Services - Timeliness in Drug dispensing',
    'ipd.billing.courtesy': 'Billing - Courteousness /Helpfulness of the staff',
    'ipd.operations.hospitality': 'Operations - Hospitality',
    'ipd.discharge.process': 'Discharge Process within Time frame',
    'ipd.employee.recognition': 'Employee Recognition',
    'ipd.employee.question': 'Would you like to nominate an employee for his/her outstanding service?',
    'ipd.employee.placeholder': 'Please mention the employee name and department...',
    'ipd.additional.comments': 'Additional Comments',
    'ipd.comments.question': 'Any Comments / Suggestions:',
    'ipd.comments.placeholder': 'Please share your suggestions or any additional feedback...',
    
    // Footer
    'footer.copyright': '© 2025 Vikram ENT Hospital, Coimbatore. All rights reserved.',
  },
  ta: {
    // Header
    'hospital.name': 'விக்ரம் ENT மருத்துவமனை',
    'hospital.location': 'கோயம்புத்தூர்',
    'nav.opd': 'OPD கருத்து',
    'nav.ipd': 'IPD கருத்து',
    
    // Progress Bar
    'progress.title': 'படிவ முன்னேற்றம்',
    'progress.completed': 'புலங்கள் முடிந்தது',
    'progress.complete': 'முடிந்தது',
    'progress.ready': 'படிவம் முடிந்தது! சமர்ப்பிக்க தயார்.',
    
    // Common
    'common.name': 'பெயர்',
    'common.uhid': 'UHID',
    'common.date': 'தேதி',
    'common.mobile': 'மொபைல்',
    'common.submit': 'சமர்ப்பி',
    'common.required': '*',
    'common.excellent': 'சிறந்தது',
    'common.good': 'நல்லது',
    'common.average': 'சராசரி',
    
    // OPD
    'opd.title': 'OPD கருத்து',
    'opd.subtitle': 'உங்கள் கருத்து எங்கள் வெளிநோயாளி சேவைகளை மேம்படுத்த உதவுகிறது',
    'opd.patient.info': 'நோயாளி தகவல்',
    'opd.overall.experience': 'மொத்த அனுபவம்',
    'opd.overall.question': 'உங்கள் மொத்த அனுபவத்தை எவ்வாறு மதிப்பிடுகிறீர்கள்?',
    'opd.service.quality': 'சேவை தர மதிப்பீடு',
    'opd.submit.button': 'OPD கருத்தை சமர்ப்பி',
    'opd.appointment.booking': 'ரிசப்ஷன் - நியமன பதிவு எளிதாக இருந்ததா?',
    'opd.reception.staff': 'ரிசப்ஷன் ஊழியர்கள் நாகரீகமாகவும் உதவியாகவும் இருந்தார்களா?',
    'opd.billing.process': 'பில்லிங் - பில்லிங் செயல்முறை சரியான நேரத்தில் நடைபெற்றதா?',
    'opd.nursing.care': 'நர்ஸிங் - பராமரிப்பு மற்றும் நாகரீகமான நடத்தை?',
    'opd.lab.staff': 'லேப் - லேப் ஊழியர்கள் திறமையானவர்கள் மற்றும் சாத்தியமானவர்கள்',
    'opd.lab.waiting': 'லேப் சேவைகளுக்கான காத்திருப்பு நேரம்',
    'opd.radiology.staff': 'ரேடியாலஜி - ரேடியாலஜி ஊழியர்கள் திறமையானவர்கள் மற்றும் சாத்தியமானவர்கள்',
    'opd.radiology.waiting': 'ரேடியாலஜி சேவைகளுக்கான காத்திருப்பு நேரம்',
    'opd.pharmacy.waiting': 'பார்மசி - பார்மசி சேவைகளுக்கான காத்திருப்பு நேரம்',
    'opd.medication.dispensed': 'மருந்துகள் சரியான நேரத்தில் மற்றும் சரியாக வழங்கப்பட்டனவா?',
    'opd.drug.explanation': 'மருந்துகள் பற்றி தெளிவாக விளக்கப்பட்டது',
    'opd.counselling.session': 'ஆலோசனை - ஆலோசனை அமர்வு திருப்திகரமாக இருந்ததா?',
    'opd.audiology.staff': 'ஆடியாலஜி - ஆடியாலஜி ஊழியர்கள் திறமையானவர்கள் மற்றும் சாத்தியமானவர்களா?',
    'opd.hospital.cleanliness': 'விருந்தோம்பல் - மருத்துவமனையின் சுத்தம்?',
    'opd.employee.recognition': 'ஊழியர் அங்கீகாரம்',
    'opd.employee.question': 'அவரின்/அவரின் சிறந்த சேவைக்காக ஓர் ஊழியரை பரிந்துரைக்க விரும்புகிறீர்களா?',
    'opd.employee.placeholder': 'தயவுசெய்து ஊழியரின் பெயர் மற்றும் துறையைக் குறிப்பிடவும்...',
    'opd.additional.comments': 'கூடுதல் கருத்துகள்',
    'opd.comments.question': 'ஏதேனும் கருத்துகள் / பரிந்துரைகள்:',
    'opd.comments.placeholder': 'தயவுசெய்து உங்கள் பரிந்துரைகள் அல்லது கூடுதல் கருத்துகளைப் பகிர்ந்து கொள்ளவும்...',
    
    // IPD
    'ipd.title': 'IPD கருத்து',
    'ipd.subtitle': 'உங்கள் கருத்து எங்கள் உள்நோயாளி சேவைகளை மேம்படுத்த உதவுகிறது',
    'ipd.patient.info': 'நோயாளி தகவல்',
    'ipd.overall.experience': 'மொத்த அனுபவம்',
    'ipd.overall.question': 'உங்கள் மொத்த அனுபவத்தை எவ்வாறு மதிப்பிடுகிறீர்கள்?',
    'ipd.service.quality': 'சேவை தர மதிப்பீடு',
    'ipd.submit.button': 'IPD கருத்தை சமர்ப்பி',
    'ipd.registration.process': 'சேர்க்கை மேசை - பதிவு செயல்முறை',
    'ipd.room.readiness': 'வசதி - அறையின் தயார்நிலை / அறை சேர்க்கை வேகம்',
    'ipd.room.cleanliness': 'அறையின் சுத்தம் - கழிப்பறை/தலையணைகள்/துணிகள்',
    'ipd.doctor.explanation': 'மருத்துவர் - சிகிச்சை விளக்கம்',
    'ipd.nurse.communication': 'நர்ஸ் - தொடர்பு, நாகரீகம் மற்றும் மரியாதை',
    'ipd.plan.explanation': 'திட்டம் மற்றும் செயல்முறைகளின் விளக்கம்',
    'ipd.promptness.attending': 'உங்கள் தேவைகளுக்கு உதவும் விரைவு',
    'ipd.pharmacy.timeliness': 'பார்மசி சேவைகள் - மருந்து வழங்குவதில் சரியான நேரம்',
    'ipd.billing.courtesy': 'பில்லிங் - ஊழியர்களின் நாகரீகம் / உதவியாக இருத்தல்',
    'ipd.operations.hospitality': 'அறுவை சிகிச்சை - விருந்தோம்பல்',
    'ipd.discharge.process': 'சரியான நேரத்தில் வெளியேற்ற செயல்முறை',
    'ipd.employee.recognition': 'ஊழியர் அங்கீகாரம்',
    'ipd.employee.question': 'அவரின்/அவரின் சிறந்த சேவைக்காக ஓர் ஊழியரை பரிந்துரைக்க விரும்புகிறீர்களா?',
    'ipd.employee.placeholder': 'தயவுசெய்து ஊழியரின் பெயர் மற்றும் துறையைக் குறிப்பிடவும்...',
    'ipd.additional.comments': 'கூடுதல் கருத்துகள்',
    'ipd.comments.question': 'ஏதேனும் கருத்துகள் / பரிந்துரைகள்:',
    'ipd.comments.placeholder': 'தயவுசெய்து உங்கள் பரிந்துரைகள் அல்லது கூடுதல் கருத்துகளைப் பகிர்ந்து கொள்ளவும்...',
    
    // Footer
    'footer.copyright': '© 2025 விக்ரம் ENT மருத்துவமனை, கோயம்புத்தூர். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
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
