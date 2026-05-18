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
];

const ARRAY_FIELDS = ["skills", "languages", "technicalSkills", "softSkills"];

const INT_FIELDS = ["yearsOfExperience"];

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

export function parseEducationArray(body) {
  let educationData = [];

  if (body.education) {
    if (Array.isArray(body.education)) {
      educationData = body.education;
    } else if (typeof body.education === "string") {
      try {
        const parsed = JSON.parse(body.education);
        if (Array.isArray(parsed)) {
          educationData = parsed;
        }
      } catch {
        // If parsing fails, return empty array
        educationData = [];
      }
    }
  }

  // Filter and transform education data
  return educationData
    .filter(
      (edu) =>
        edu.highestEducation ||
        edu.university ||
        edu.college ||
        edu.fieldOfStudy ||
        edu.graduationYear,
    )
    .map((edu) => ({
      highestEducation: edu.highestEducation || null,
      university: edu.university || null,
      college: edu.college || null,
      fieldOfStudy: edu.fieldOfStudy || null,
      graduationYear: edu.graduationYear
        ? parseOptionalInt(edu.graduationYear)
        : null,
    }));
}

export function buildApplicantProfileData(body, files = {}) {
  const data = {};

  for (const field of TEXT_FIELDS) {
    if (body[field] !== undefined) {
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
  } else if (body.profilePicture !== undefined && !files.profilePicture) {
    data.profilePicture =
      body.profilePicture === "" ? null : body.profilePicture;
  }

  return data;
}

export function buildApplicantUpdateData(body, files = {}) {
  const partial = buildApplicantProfileData(body, files);
  return pickDefined(Object.entries(partial));
}
