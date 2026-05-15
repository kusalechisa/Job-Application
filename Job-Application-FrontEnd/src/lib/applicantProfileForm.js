export const EMPTY_APPLICANT_PROFILE = {
  firstName: "",
  lastName: "",
  middleName: "",
  dateOfBirth: "",
  nationality: "",
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
  highestEducation: "",
  university: "",
  college: "",
  fieldOfStudy: "",
  graduationYear: "",
  skills: "",
  languages: "",
  technicalSkills: "",
  softSkills: "",
  resume: null,
};

export function profileToForm(profile, accountEmail = "") {
  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  };

  const joinList = (items) => (Array.isArray(items) ? items.join(", ") : "");

  return {
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    middleName: profile.middleName || "",
    dateOfBirth: formatDate(profile.dateOfBirth),
    nationality: profile.nationality || "",
    maritalStatus: profile.maritalStatus || "",
    profilePicture: null,
    phone: profile.phone || "",
    alternativePhone: profile.alternativePhone || "",
    email: profile.email || accountEmail || "",
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
    highestEducation: profile.highestEducation || "",
    university: profile.university || "",
    college: profile.college || "",
    fieldOfStudy: profile.fieldOfStudy || "",
    graduationYear:
      profile.graduationYear !== null && profile.graduationYear !== undefined
        ? String(profile.graduationYear)
        : "",
    skills: joinList(profile.skills),
    languages: joinList(profile.languages),
    technicalSkills: joinList(profile.technicalSkills),
    softSkills: joinList(profile.softSkills),
    resume: null,
  };
}

const FORM_FIELDS = Object.keys(EMPTY_APPLICANT_PROFILE).filter(
  (key) => !["profilePicture", "resume"].includes(key)
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
  return data;
}
