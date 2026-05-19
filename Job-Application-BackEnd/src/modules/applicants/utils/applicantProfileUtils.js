const TEXT_FIELDS = [
  "firstName",
  "lastName",
  "middleName",
  "nationality",
  "gender",
  "maritalStatus",
  "phone",
  "alternativePhone",
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

/** Optional decimals (CGPA, exit exam %); empty string clears to null */
const FLOAT_FIELDS = ["cgpa", "exitExamScore"];

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

function parseOptionalFloat(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number.parseFloat(String(value).trim());
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

  // Handle education from FormData (nested fields: education[0][highestEducation], etc.)
  if (!body) return [];

  // First, check if there are nested form fields (education[0][highestEducation])
  const keys = Object.keys(body);
  const hasNestedEducation = keys.some((key) => key.startsWith("education["));

  if (hasNestedEducation) {
    // Parse nested form fields
    const educationMap = new Map();

    keys.forEach((key) => {
      const match = key.match(/education\[(\d+)\]\[(.+)\]/);
      if (match) {
        const index = parseInt(match[1]);
        const field = match[2];
        const value = body[key];

        if (!educationMap.has(index)) {
          educationMap.set(index, {});
        }

        const edu = educationMap.get(index);
        edu[field] = value;
      }
    });

    // Convert map to array and process
    educationData = Array.from(educationMap.values());

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
        cgpa:
          edu.cgpa !== undefined && edu.cgpa !== null && edu.cgpa !== ""
            ? parseOptionalFloat(edu.cgpa)
            : null,
        exitExamScore:
          edu.exitExamScore !== undefined &&
          edu.exitExamScore !== null &&
          edu.exitExamScore !== ""
            ? parseOptionalFloat(edu.exitExamScore)
            : null,
      }));
  }

  // Handle JSON string or array format
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
      cgpa:
        edu.cgpa !== undefined && edu.cgpa !== null && edu.cgpa !== ""
          ? parseOptionalFloat(edu.cgpa)
          : null,
      exitExamScore:
        edu.exitExamScore !== undefined &&
        edu.exitExamScore !== null &&
        edu.exitExamScore !== ""
          ? parseOptionalFloat(edu.exitExamScore)
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

  for (const field of FLOAT_FIELDS) {
    if (body[field] !== undefined) {
      if (body[field] === "" || body[field] === null) {
        data[field] = null;
        continue;
      }
      const num = parseOptionalFloat(body[field]);
      if (num === undefined) continue;
      if (field === "exitExamScore" && (num < 0 || num > 100)) {
        throw new Error("Exit exam score must be between 0 and 100");
      }
      if (field === "cgpa" && (num < 0 || num > 10)) {
        throw new Error("CGPA must be between 0 and 10");
      }
      data[field] = num;
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
