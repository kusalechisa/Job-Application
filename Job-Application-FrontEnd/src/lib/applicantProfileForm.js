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
  if (parts.length === 0)
    return { firstName: "", middleName: "", lastName: "" };
  if (parts.length === 1)
    return { firstName: parts[0], middleName: "", lastName: "" };
  if (parts.length === 2)
    return { firstName: parts[0], middleName: "", lastName: parts[1] };
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

  // Handle education data from backend
  let educationData = [];
  if (Array.isArray(profile.education) && profile.education.length > 0) {
    educationData = profile.education.map((edu) => ({
      highestEducation: edu.highestEducation || "",
      university: edu.university || "",
      college: edu.college || "",
      fieldOfStudy: edu.fieldOfStudy || "",
      graduationYear: edu.graduationYear ? String(edu.graduationYear) : "",
    }));
  }

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
    yearsOfExperience: profile.yearsOfExperience
      ? String(profile.yearsOfExperience)
      : "",
    employmentStatus: profile.employmentStatus || "",
    portfolioUrl: profile.portfolioUrl || "",
    linkedinUrl: profile.linkedinUrl || "",
    githubUrl: profile.githubUrl || "",
    education: educationData,
    skills: joinList(profile.skills),
    languages: joinList(profile.languages),
    technicalSkills: joinList(profile.technicalSkills),
    softSkills: joinList(profile.softSkills),
    resume: null,
  };
}

const FORM_FIELDS = Object.keys(EMPTY_APPLICANT_PROFILE).filter(
  (key) => !["profilePicture", "resume", "education"].includes(key),
);

export function formToFormData(form) {
  const data = new FormData();

  // Add all basic fields
  for (const key of FORM_FIELDS) {
    if (form[key] !== undefined && form[key] !== null && form[key] !== "") {
      data.append(key, form[key]);
    }
  }

  // Handle profile picture
  if (form.profilePicture && form.profilePicture instanceof File) {
    data.append("profilePicture", form.profilePicture);
  }

  // Handle resume
  if (form.resume && form.resume instanceof File) {
    data.append("resume", form.resume);
  }

  // CRITICAL FIX: Handle education array - Send as JSON string
  if (Array.isArray(form.education) && form.education.length > 0) {
    // Filter out completely empty education entries
    const validEducation = form.education.filter(
      (edu) =>
        edu.highestEducation ||
        edu.university ||
        edu.college ||
        edu.fieldOfStudy ||
        edu.graduationYear,
    );

    if (validEducation.length > 0) {
      // Send as JSON string - most reliable format
      data.append("education", JSON.stringify(validEducation));
      console.log("Sending education data:", validEducation);
    }
  } else if (Array.isArray(form.education) && form.education.length === 0) {
    // Send empty array if no education
    data.append("education", JSON.stringify([]));
  }

  // Debug logging
  console.log("=== Final FormData contents ===");
  for (let pair of data.entries()) {
    if (pair[0] === "education") {
      console.log(`${pair[0]}: ${pair[1]}`);
    } else if (pair[1] instanceof File) {
      console.log(`${pair[0]}: File (${pair[1].name}, ${pair[1].size} bytes)`);
    } else {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
  }

  return data;
}
