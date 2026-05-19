// applicantProfileForm.js

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

export function profileToForm(profile) {
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

  // Handle education data from backend - include cgpa and exitExamScore
  let educationData = [];
  if (Array.isArray(profile.education) && profile.education.length > 0) {
    educationData = profile.education.map((edu) => ({
      highestEducation: edu.highestEducation || "",
      university: edu.university || "",
      college: edu.college || "",
      fieldOfStudy: edu.fieldOfStudy || "",
      graduationYear: edu.graduationYear ? String(edu.graduationYear) : "",
      cgpa:
        edu.cgpa !== undefined && edu.cgpa !== null && edu.cgpa !== ""
          ? String(edu.cgpa)
          : "",
      exitExamScore:
        edu.exitExamScore !== undefined &&
        edu.exitExamScore !== null &&
        edu.exitExamScore !== ""
          ? String(edu.exitExamScore)
          : "",
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

export function formToFormData(form) {
  const data = new FormData();

  // Fields to exclude from root level (handled separately)
  const excludeFromRoot = ["profilePicture", "resume", "education"];

  // Add all basic fields except excluded ones
  for (const key of Object.keys(EMPTY_APPLICANT_PROFILE)) {
    if (excludeFromRoot.includes(key)) continue;

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

  // Handle education array - CRITICAL: Send cgpa and exitExamScore inside each education entry
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

    // Send each education entry as nested form data
    validEducation.forEach((edu, index) => {
      if (edu.highestEducation) {
        data.append(
          `education[${index}][highestEducation]`,
          edu.highestEducation,
        );
      }
      if (edu.university) {
        data.append(`education[${index}][university]`, edu.university);
      }
      if (edu.college) {
        data.append(`education[${index}][college]`, edu.college);
      }
      if (edu.fieldOfStudy) {
        data.append(`education[${index}][fieldOfStudy]`, edu.fieldOfStudy);
      }
      if (edu.graduationYear) {
        data.append(`education[${index}][graduationYear]`, edu.graduationYear);
      }
      // CRITICAL: Send cgpa and exitExamScore as part of the education object
      if (edu.cgpa && edu.cgpa !== "") {
        data.append(`education[${index}][cgpa]`, edu.cgpa);
      }
      if (edu.exitExamScore && edu.exitExamScore !== "") {
        data.append(`education[${index}][exitExamScore]`, edu.exitExamScore);
      }
    });

    console.log(
      "Sending education data with CGPA and ExitExam:",
      validEducation,
    );
  }

  // Debug logging
  console.log("=== Final FormData contents ===");
  for (let pair of data.entries()) {
    if (pair[1] instanceof File) {
      console.log(`${pair[0]}: File (${pair[1].name}, ${pair[1].size} bytes)`);
    } else {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
  }

  return data;
}
