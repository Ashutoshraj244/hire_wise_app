// Scoring weights: Skills 50%, Experience 25%, Education 15%, Keywords 10%

const SKILL_LIST = [
  'react', 'angular', 'vue', 'typescript', 'javascript', 'node', 'express',
  'python', 'django', 'flask', 'java', 'spring', 'graphql', 'rest', 'sql',
  'postgresql', 'mysql', 'mongodb', 'redis', 'aws', 'gcp', 'azure', 'docker',
  'kubernetes', 'git', 'jest', 'redux', 'webpack', 'vite', 'next', 'tailwind',
];

const EDU_WEIGHTS = {
  phd: 100, doctorate: 100, "master's": 90, mtech: 88, mba: 85,
  "bachelor's": 75, btech: 75, associate: 55,
};

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s+#]/g, ' ').split(/\s+/).filter((t) => t.length > 1);
}

function jaccardSimilarity(a, b) {
  const sa = new Set(tokenize(a));
  const sb = new Set(tokenize(b));
  const inter = [...sa].filter((t) => sb.has(t)).length;
  return inter / (sa.size + sb.size - inter) || 0;
}

function extractJdSkills(jdText) {
  const lower = jdText.toLowerCase();
  return SKILL_LIST.filter((s) => lower.includes(s));
}

function skillScore(resumeSkills, jdSkills) {
  if (!jdSkills.length) return 70;
  const matched = resumeSkills.filter((s) => jdSkills.includes(s));
  return Math.round((matched.length / jdSkills.length) * 100);
}

function expScore(resumeExp, jdText) {
  const m = jdText.match(/(\d+)\+?\s*years?/i);
  const wanted = m ? parseInt(m[1]) : 3;
  if (!resumeExp) return 30;
  if (resumeExp >= wanted + 3) return 100;
  if (resumeExp >= wanted) return 85;
  if (resumeExp >= wanted - 1) return 65;
  return Math.max(20, Math.round((resumeExp / wanted) * 70));
}

function eduScore(education) {
  if (!education) return 55;
  const lower = education.toLowerCase();
  let best = 55;
  Object.entries(EDU_WEIGHTS).forEach(([k, v]) => {
    if (lower.includes(k) && v > best) best = v;
  });
  return best;
}

// Uses rawText for full keyword similarity — always prefer this over parsed-only scoring
function scoreWithText(parsed, rawText, jdText, customWeights = null) {
  const w = customWeights || { skills: 50, experience: 25, education: 15, keyword: 10 };
  const w_sk = w.skills / 100;
  const w_ex = w.experience / 100;
  const w_ed = w.education / 100;
  const w_kw = w.keyword / 100;

  const jdSkills = extractJdSkills(jdText);
  const resumeSkills = parsed.skills || [];

  const ss = skillScore(resumeSkills, jdSkills);
  const es = expScore(parsed.experience, jdText);
  const edu = eduScore(parsed.education);
  const kw = Math.round(jaccardSimilarity(rawText, jdText) * 100);

  const total = Math.round(ss * w_sk + es * w_ex + edu * w_ed + kw * w_kw);

  return {
    total: Math.min(99, Math.max(5, total)),
    breakdown: {
      skills: Math.min(w.skills, Math.round(ss * w_sk)),
      experience: Math.min(w.experience, Math.round(es * w_ex)),
      education: Math.min(w.education, Math.round(edu * w_ed)),
      keyword: Math.min(w.keyword, Math.round(kw * w_kw)),
    },
    matchedSkills: jdSkills.filter((s) => resumeSkills.includes(s)),
    missingSkills: jdSkills.filter((s) => !resumeSkills.includes(s)),
  };
}

module.exports = { scoreWithText };
