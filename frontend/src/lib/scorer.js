// Scoring engine — weighted match against job description
// Weights: Skills 50%, Experience 25%, Education 15%, Keywords 10%

const SKILL_KEYWORDS = [
  'react', 'angular', 'vue', 'typescript', 'javascript', 'node', 'express',
  'python', 'django', 'flask', 'java', 'spring', 'kotlin', 'swift', 'go',
  'rust', 'c++', 'c#', 'php', 'laravel', 'ruby', 'rails', 'graphql',
  'rest', 'api', 'sql', 'postgresql', 'mysql', 'mongodb', 'redis',
  'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'ci/cd', 'git',
  'jest', 'testing', 'redux', 'zustand', 'webpack', 'vite', 'next',
  'css', 'tailwind', 'sass', 'html', 'figma', 'linux',
];

const EDUCATION_TIERS = {
  phd: 100,
  'ph.d': 100,
  doctorate: 100,
  masters: 90,
  'm.s': 90,
  m_s: 90,
  mtech: 88,
  mba: 85,
  bachelors: 75,
  'b.s': 75,
  'b.tech': 75,
  btech: 75,
  'b.e': 73,
  associate: 55,
  bootcamp: 50,
  'self-taught': 45,
};

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s.+#]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function extractSkills(text) {
  const tokens = tokenize(text);
  const found = new Set();
  SKILL_KEYWORDS.forEach((skill) => {
    const parts = skill.split('/');
    parts.forEach((p) => {
      if (tokens.includes(p) || text.toLowerCase().includes(skill)) {
        found.add(skill);
      }
    });
  });
  return [...found];
}

function tfidfSimilarity(docA, docB) {
  const tokensA = tokenize(docA);
  const tokensB = tokenize(docB);
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = [...setA].filter((t) => setB.has(t));
  const freqBonus = intersection.reduce((sum, t) => {
    const freqA = tokensA.filter((x) => x === t).length;
    const freqB = tokensB.filter((x) => x === t).length;
    return sum + Math.min(freqA, freqB) * 0.1;
  }, 0);
  const base = intersection.length / Math.sqrt(setA.size * setB.size);
  return Math.min(1, base + freqBonus * 0.05);
}

function scoreSkills(resumeSkills, jdSkills) {
  if (!jdSkills.length) return 50;
  const matched = resumeSkills.filter((s) => jdSkills.includes(s));
  return Math.round((matched.length / jdSkills.length) * 100);
}

function scoreExperience(yearsText, jdText) {
  const yearMatches = yearsText.match(/(\d+)\+?\s*years?/gi) || [];
  let maxYears = 0;
  yearMatches.forEach((m) => {
    const n = parseInt(m);
    if (n > maxYears && n < 40) maxYears = n;
  });
  const jdMatch = jdText.match(/(\d+)\+?\s*years?/i);
  const wantedYears = jdMatch ? parseInt(jdMatch[1]) : 3;
  if (maxYears === 0) return 30;
  if (maxYears >= wantedYears + 3) return 100;
  if (maxYears >= wantedYears) return 85;
  if (maxYears >= wantedYears - 1) return 65;
  return Math.max(20, Math.round((maxYears / wantedYears) * 70));
}

function scoreEducation(resumeText) {
  const lower = resumeText.toLowerCase();
  let best = 0;
  Object.entries(EDUCATION_TIERS).forEach(([key, val]) => {
    if (lower.includes(key.replace('_', '.'))) {
      if (val > best) best = val;
    }
  });
  const topSchools = ['mit', 'stanford', 'berkeley', 'carnegie', 'georgia tech', 'waterloo', 'iit'];
  const schoolBonus = topSchools.some((s) => lower.includes(s)) ? 8 : 0;
  return Math.min(100, (best || 55) + schoolBonus);
}

// Extract projects section from resume text
export function parseProjects(text) {
  const lines = text.split('\n').map((l) => l.trim());
  const projects = [];
  let inProjects = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upper = line.toUpperCase();

    // Detect start of PROJECTS section
    if (/^PROJECTS?$/i.test(line) || upper === 'PROJECTS' || upper === 'SIDE PROJECTS' || upper === 'PERSONAL PROJECTS') {
      inProjects = true;
      continue;
    }

    // Stop if we hit another major section
    if (inProjects && /^(EXPERIENCE|EDUCATION|SKILLS|CERTIFICATIONS|AWARDS|PUBLICATIONS)$/i.test(line)) {
      break;
    }

    if (inProjects && line.length > 4) {
      // Lines starting with - or • are project bullets; bare lines are project names
      const clean = line.replace(/^[-•*]\s*/, '').trim();
      if (clean && !clean.startsWith('http')) {
        projects.push(clean);
      }
    }
  }

  return projects.slice(0, 6); // cap at 6
}

export function scoreResume(resumeText, jdText) {
  const jdSkills = extractSkills(jdText);
  const resumeSkills = extractSkills(resumeText);

  const skillScore = scoreSkills(resumeSkills, jdSkills);
  const expScore = scoreExperience(resumeText, jdText);
  const eduScore = scoreEducation(resumeText);
  const keywordScore = Math.round(tfidfSimilarity(resumeText, jdText) * 100);

  const total = Math.round(
    skillScore * 0.5 +
    expScore * 0.25 +
    eduScore * 0.15 +
    keywordScore * 0.1
  );

  const missingSkills = jdSkills.filter((s) => !resumeSkills.includes(s));
  const matchedSkills = jdSkills.filter((s) => resumeSkills.includes(s));

  return {
    total: Math.min(99, Math.max(5, total)),
    breakdown: {
      skills: Math.min(50, Math.round(skillScore * 0.5)),
      experience: Math.min(25, Math.round(expScore * 0.25)),
      education: Math.min(15, Math.round(eduScore * 0.15)),
      keyword: Math.min(10, Math.round(keywordScore * 0.1)),
    },
    extractedSkills: resumeSkills,
    missingSkills,
    matchedSkills,
    projects: parseProjects(resumeText),
  };
}

export function parseResumeName(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 5)) {
    // Allows middle initials (e.g. "Marcus A. Webb") and professional suffixes (e.g. "John Doe, PhD")
    if (/^[A-Za-z][a-z]+(\s([A-Za-z]\.?\s)?[A-Za-z][a-z]+){1,3}(,\s?[A-Za-z.\s]+)?$/.test(line)) {
      return line;
    }
  }
  return 'Unknown Candidate';
}

export function parseResumeEmail(text) {
  const match = text.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  return match ? match[0].toLowerCase() : null;
}

export function parseResumePhone(text) {
  const match = text.match(/(\+?1?\s?)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/);
  return match ? match[0].trim() : null;
}

export function parseExperience(text) {
  const yearMatches = text.match(/(\d+)\+?\s*years?/gi) || [];
  let max = 0;
  yearMatches.forEach((m) => {
    const n = parseInt(m);
    if (n > max && n < 40) max = n;
  });
  return max || null;
}

export { extractSkills };
