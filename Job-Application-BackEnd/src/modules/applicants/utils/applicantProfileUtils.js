const TEXT_FIELDS = [
  "firstName",
  "lastName",
  "middleName",
  "nationality",
  "gender",
  "maritalStatus",
  "phone",
  "alternativePhone",
  "email",
  "address",
  "city",
  "subCity",
  "region",
  "profession",
  "currentJobTitle",
  "employmentStatus",
  "portfolioUrl",
  "linkedinUrl",
  "githubUrl",
  "highestEducation",
  "university",
  "college",
  "fieldOfStudy",
];

const ARRAY_FIELDS = ["skills", "languages", "technicalSkills", "softSkills"];

const INT_FIELDS = ["yearsOfExperience", "graduationYear"];

export function parseStringArray(value) {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function parseOptionalInt(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseOptionalDate(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function pickDefined(entries) {
  return Object.fromEntries(entries.filter(([, value]) => value !== undefined));
}

export function buildApplicantProfileData(body, files = {}) {
  const data = {};

  // Handle education array from frontend
  if (
    body.education &&
    Array.isArray(body.education) &&
    body.education.length > 0
  ) {
    const edu = body.education[0]; // Use first education entry for now
    if (edu.highestEducation !== undefined)
      data.highestEducation =
        edu.highestEducation === "" ? null : edu.highestEducation;
    if (edu.university !== undefined)
      data.university = edu.university === "" ? null : edu.university;
    if (edu.college !== undefined)
      data.college = edu.college === "" ? null : edu.college;
    if (edu.fieldOfStudy !== undefined)
      data.fieldOfStudy = edu.fieldOfStudy === "" ? null : edu.fieldOfStudy;
    if (edu.graduationYear !== undefined)
      data.graduationYear =
        edu.graduationYear === "" ? null : parseOptionalInt(edu.graduationYear);
  }

  for (const field of TEXT_FIELDS) {
    if (body[field] !== undefined && !data[field]) {
      // Skip if already set from education array
      data[field] = body[field] === "" ? null : body[field];
    }
  }

  if (body.dateOfBirth !== undefined) {
    data.dateOfBirth =
      body.dateOfBirth === "" ? null : parseOptionalDate(body.dateOfBirth);
  }

  for (const field of INT_FIELDS) {
    if (body[field] !== undefined) {
      data[field] = body[field] === "" ? null : parseOptionalInt(body[field]);
    }
  }

  for (const field of ARRAY_FIELDS) {
    if (body[field] !== undefined) {
      data[field] = parseStringArray(body[field]);
    }
  }

  if (files.resume?.[0]) {
    data.resume = files.resume[0].path;
  } else if (body.resume !== undefined && !files.resume) {
    data.resume = body.resume === "" ? null : body.resume;
  }

  if (files.profilePicture?.[0]) {
    data.profilePicture = files.profilePicture[0].path;
  }

  return data;
}

export function buildApplicantUpdateData(body, files = {}) {
  const partial = buildApplicantProfileData(body, files);
  return pickDefined(Object.entries(partial));
}
