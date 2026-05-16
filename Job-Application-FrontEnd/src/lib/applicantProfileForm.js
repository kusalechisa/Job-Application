export const EMPTY_APPLICANT_PROFILE = {
  firstName: "",
  lastName: "",
  middleName: "",
  dateOfBirth: "",
  nationality: "",
  gender: "",
  maritalStatus: "",
  profilePicture: null,
  phone: "",
  alternativePhone: "",
  email: "",
  address: "",
  city: "",
  subCity: "",
  region: "",
  profession: "",
  currentJobTitle: "",
  yearsOfExperience: "",
  employmentStatus: "",
  portfolioUrl: "",
  linkedinUrl: "",
  githubUrl: "",
  education: [],
  skills: "",
  languages: "",
  technicalSkills: "",
  softSkills: "",
  resume: null,
};

function parseAccountName(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", middleName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], middleName: "", lastName: "" };
  if (parts.length === 2) return { firstName: parts[0], middleName: "", lastName: parts[1] };
  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

export function profileToForm(profile, accountEmail = "") {
  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const joinList = (items) => (Array.isArray(items) ? items.join(", ") : "");

  const account = profile.account || {};
  const nameFromAccount = parseAccountName(account.name || "");

  return {
    firstName: profile.firstName || nameFromAccount.firstName || "",
    lastName: profile.lastName || nameFromAccount.lastName || "",
    middleName: profile.middleName || nameFromAccount.middleName || "",
    dateOfBirth: formatDate(profile.dateOfBirth),
    nationality: profile.nationality || "",
    gender: profile.gender || "",
    maritalStatus: profile.maritalStatus || "",
    profilePicture: null,
    phone: profile.phone || "",
    alternativePhone: profile.alternativePhone || "",
    email: profile.email || account.email || accountEmail || "",
    address: profile.address || "",
    city: profile.city || "",
    subCity: profile.subCity || "",
    region: profile.region || "",
    profession: profile.profession || "",
    currentJobTitle: profile.currentJobTitle || "",
    yearsOfExperience:
      profile.yearsOfExperience !== null && profile.yearsOfExperience !== undefined
        ? String(profile.yearsOfExperience)
        : "",
    employmentStatus: profile.employmentStatus || "",
    portfolioUrl: profile.portfolioUrl || "",
    linkedinUrl: profile.linkedinUrl || "",
    githubUrl: profile.githubUrl || "",
    education: Array.isArray(profile.education) 
      ? profile.education.map(edu => ({
          highestEducation: edu.highestEducation || "",
          university: edu.university || "",
          college: edu.college || "",
          fieldOfStudy: edu.fieldOfStudy || "",
          graduationYear: edu.graduationYear !== null && edu.graduationYear !== undefined
            ? String(edu.graduationYear)
            : "",
        }))
      : (profile.highestEducation || profile.university || profile.college || profile.fieldOfStudy || profile.graduationYear
          ? [{
              highestEducation: profile.highestEducation || "",
              university: profile.university || "",
              college: profile.college || "",
              fieldOfStudy: profile.fieldOfStudy || "",
              graduationYear: profile.graduationYear !== null && profile.graduationYear !== undefined
                ? String(profile.graduationYear)
                : "",
            }]
          : []),
    skills: joinList(profile.skills),
    languages: joinList(profile.languages),
    technicalSkills: joinList(profile.technicalSkills),
    softSkills: joinList(profile.softSkills),
    resume: null,
  };
}

const FORM_FIELDS = Object.keys(EMPTY_APPLICANT_PROFILE).filter(
  (key) => !["profilePicture", "resume", "education"].includes(key)
);

export function formToFormData(form) {
  const data = new FormData();
  for (const key of FORM_FIELDS) {
    if (form[key] !== undefined && form[key] !== null) {
      data.append(key, form[key]);
    }
  }
  if (form.profilePicture) data.append("profilePicture", form.profilePicture);
  if (form.resume) data.append("resume", form.resume);
  
  // Handle education array
  if (Array.isArray(form.education)) {
    form.education.forEach((edu, index) => {
      if (edu.highestEducation) data.append(`education[${index}][highestEducation]`, edu.highestEducation);
      if (edu.university) data.append(`education[${index}][university]`, edu.university);
      if (edu.college) data.append(`education[${index}][college]`, edu.college);
      if (edu.fieldOfStudy) data.append(`education[${index}][fieldOfStudy]`, edu.fieldOfStudy);
      if (edu.graduationYear) data.append(`education[${index}][graduationYear]`, edu.graduationYear);
    });
  }
  
  return data;
}
