export interface CollegeOption {
  id: string;
  name: string;
}

export interface ProgramOption {
  id: string;
  name: string;
  level: "degree" | "diploma" | "certificate";
}

export const COLLEGES: CollegeOption[] = [
  { id: "muhas", name: "Muhimbili University of Health and Allied Sciences (MUHAS)" },
  { id: "kcmuco", name: "Kilimanjaro Christian Medical University College (KCMUCo)" },
  { id: "cuhas", name: "Catholic University of Health and Allied Sciences (CUHAS) – Bugando" },
  { id: "hkmu", name: "Hubert Kairuki Memorial University (HKMU)" },
  { id: "sfuchas", name: "St. Francis University College of Health and Allied Sciences (SFUCHAS)" },
  { id: "udom", name: "University of Dodoma (UDOM) – College of Health Sciences" },
  { id: "imtu", name: "International Medical and Technological University (IMTU)" },
  { id: "aku", name: "Aga Khan University, Tanzania" },
  { id: "suza", name: "State University of Zanzibar (SUZA) – School of Health and Medical Sciences" },
  { id: "mchas", name: "Mbeya College of Health and Allied Sciences (MCHAS)" },
  { id: "sjchas", name: "St. Joseph University College of Health and Allied Sciences (SJCHAS)" },
  { id: "umst", name: "University of Medical Sciences and Technology (UMST)" },
  { id: "mshas", name: "Muhimbili School of Health and Allied Sciences (MSHAS)" },
  { id: "mnazi-mmoja", name: "Mnazi Mmoja School of Health Sciences" },
  { id: "mbeya-cohas", name: "Mbeya College of Health Sciences" },
  { id: "mwanza-cohas", name: "Mwanza College of Health and Allied Sciences" },
  { id: "tabora-cohas", name: "Tabora College of Health and Allied Sciences" },
  { id: "mtwara-cohas", name: "Mtwara College of Health and Allied Sciences" },
  { id: "chato-cohas", name: "Chato College of Health and Allied Sciences" },
  { id: "sengerema", name: "Sengerema Health Training Institute" },
  { id: "kilimanjaro-pharm", name: "Kilimanjaro School of Pharmacy" },
  { id: "bugando-nursing", name: "Bugando School of Nursing" },
  { id: "kcmc-nursing", name: "KCMC School of Nursing" },
  { id: "kilimanjaro-ihs", name: "Kilimanjaro Institute of Health Sciences" },
];

export const PROGRAMS: ProgramOption[] = [
  { id: "prog-mbbs", name: "Doctor of Medicine (MD)", level: "degree" },
  { id: "prog-bds", name: "Bachelor of Dental Surgery (BDS)", level: "degree" },
  { id: "prog-nursing", name: "Bachelor of Science in Nursing (BScN)", level: "degree" },
  { id: "prog-pharm", name: "Bachelor of Pharmacy (BPharm)", level: "degree" },
  { id: "prog-bmls", name: "Bachelor of Science in Medical Laboratory Sciences", level: "degree" },
  { id: "prog-bsc-clinical-medicine", name: "Bachelor of Science in Clinical Medicine", level: "degree" },
  { id: "prog-bsc-physiotherapy", name: "Bachelor of Science in Physiotherapy", level: "degree" },
  { id: "prog-bsc-environmental-health", name: "Bachelor of Science in Environmental Health Sciences", level: "degree" },
  { id: "prog-bsc-nutrition", name: "Bachelor of Science in Nutrition and Dietetics", level: "degree" },
  { id: "prog-dip-clinical-medicine", name: "Diploma in Clinical Medicine", level: "diploma" },
  { id: "prog-dip-nursing-midwifery", name: "Diploma in Nursing and Midwifery", level: "diploma" },
  { id: "prog-dip-pharmaceutical", name: "Diploma in Pharmaceutical Sciences", level: "diploma" },
  { id: "prog-dip-medical-lab", name: "Diploma in Medical Laboratory Sciences", level: "diploma" },
  { id: "prog-dip-radiography", name: "Diploma in Radiography", level: "diploma" },
  { id: "prog-dip-physiotherapy", name: "Diploma in Physiotherapy", level: "diploma" },
  { id: "prog-dip-environmental-health", name: "Diploma in Environmental Health Sciences", level: "diploma" },
  { id: "prog-dip-nutrition", name: "Diploma in Nutrition", level: "diploma" },
  { id: "prog-dip-dental-therapy", name: "Diploma in Dental Therapy", level: "diploma" },
  { id: "prog-dip-health-records", name: "Diploma in Health Records and Information Technology", level: "diploma" },
  { id: "prog-dip-public-health", name: "Diploma in Public Health", level: "diploma" },
  { id: "prog-cert-nursing", name: "Certificate in Nursing and Midwifery", level: "certificate" },
  { id: "prog-cert-clinical-medicine", name: "Certificate in Clinical Medicine", level: "certificate" },
  { id: "prog-cert-pharmaceutical", name: "Certificate in Pharmaceutical Sciences", level: "certificate" },
  { id: "prog-cert-medical-lab", name: "Certificate in Medical Laboratory Sciences", level: "certificate" },
  { id: "prog-cert-environmental-health", name: "Certificate in Environmental Health Sciences", level: "certificate" },
  { id: "prog-cert-nutrition", name: "Certificate in Nutrition", level: "certificate" },
  { id: "prog-cert-health-records", name: "Certificate in Health Records", level: "certificate" },
];
