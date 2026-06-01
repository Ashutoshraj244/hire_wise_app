const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');

async function extractText(buffer, originalName) {
  const ext = path.extname(originalName).toLowerCase();

  if (ext === '.pdf') {
    const result = await pdfParse(buffer);
    return result.text || '';
  }

  if (ext === '.docx' || ext === '.doc') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }

  return buffer.toString('utf-8');
}

const SKILL_LIST = [
  'react', 'angular', 'vue', 'typescript', 'javascript', 'node', 'express',
  'python', 'django', 'flask', 'java', 'spring', 'kotlin', 'swift', 'go',
  'rust', 'c++', 'c#', 'php', 'ruby', 'rails', 'graphql', 'rest', 'sql',
  'postgresql', 'mysql', 'mongodb', 'redis', 'aws', 'gcp', 'azure', 'docker',
  'kubernetes', 'git', 'jest', 'redux', 'zustand', 'webpack', 'vite', 'next',
  'css', 'tailwind', 'sass', 'html', 'figma', 'linux', 'terraform',
];

function extractSkills(text) {
  const lower = text.toLowerCase();
  return SKILL_LIST.filter((skill) => lower.includes(skill));
}

function extractName(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 5)) {
    // Allows middle initials (e.g. "Marcus A. Webb") and professional suffixes (e.g. "John Doe, PhD")
    if (/^[A-Za-z][a-z]+(\s([A-Za-z]\.?\s)?[A-Za-z][a-z]+){1,3}(,\s?[A-Za-z.\s]+)?$/.test(line)) return line;
  }
  return null;
}

function extractEmail(text) {
  const m = text.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  return m ? m[0].toLowerCase() : null;
}

function extractPhone(text) {
  const m = text.match(/(\+?1?\s?)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/);
  return m ? m[0].trim() : null;
}

function extractExperience(text) {
  const matches = text.match(/(\d+)\+?\s*years?/gi) || [];
  let max = 0;
  matches.forEach((m) => {
    const n = parseInt(m);
    if (n > max && n < 40) max = n;
  });
  return max || null;
}

function extractEducation(text) {
  const lower = text.toLowerCase();
  const tiers = [
    { pattern: /(ph\.?d|doctorate)/i, label: 'PhD' },
    { pattern: /(m\.?s\.?|m\.?tech|masters|mba)/i, label: "Master's" },
    { pattern: /(b\.?s\.?|b\.?tech|b\.?e\.?|bachelor)/i, label: "Bachelor's" },
    { pattern: /associate/i, label: 'Associate' },
  ];
  for (const { pattern, label } of tiers) {
    if (pattern.test(lower)) return label;
  }
  return null;
}

function extractCollege(text) {
  // Regex to look for "University of X", "X University", "X Institute of Technology", "X College", etc.
  const regex = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:University|College|Institute|Academy|School)(?:\s+of\s+[A-Z][a-z]+)?)/g;
  const match = text.match(regex);
  if (match && match.length > 0) {
    return match[0].trim();
  }
  const lower = text.toLowerCase();
  if (lower.includes('stanford')) return 'Stanford University';
  if (lower.includes('harvard')) return 'Harvard University';
  if (lower.includes('mit') || lower.includes('massachusetts institute of technology')) return 'MIT';
  if (lower.includes('berkeley') || lower.includes('uc berkeley')) return 'UC Berkeley';
  return null;
}

function extractCompany(text) {
  const lower = text.toLowerCase();
  const popularCompanies = [
    'google', 'microsoft', 'apple', 'amazon', 'meta', 'netflix', 'twitter', 'stripe', 'uber',
    'lyft', 'airbnb', 'salesforce', 'adobe', 'spotify', 'shopify', 'zoom', 'slack', 'atlassian',
    'oracle', 'ibm', 'cisco', 'intel', 'nvidia', 'amd', 'tesla', 'spacex', 'coinbase', 'robinhood'
  ];
  for (const comp of popularCompanies) {
    if (lower.includes(comp)) {
      return comp.charAt(0).toUpperCase() + comp.slice(1);
    }
  }
  const matchAt = text.match(/(?:at|for)\s+([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+){0,2})/);
  if (matchAt) return matchAt[1].trim();
  return null;
}

function extractRole(text) {
  const commonRoles = [
    'frontend engineer', 'backend engineer', 'full stack engineer', 'software engineer',
    'frontend developer', 'backend developer', 'fullstack developer', 'software developer',
    'tech lead', 'technical lead', 'engineering manager', 'product manager', 'project manager',
    'data scientist', 'devops engineer', 'system administrator', 'qa engineer', 'ui/ux designer'
  ];
  const lower = text.toLowerCase();
  for (const role of commonRoles) {
    if (lower.includes(role)) {
      return role.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  return null;
}

function parseResume(text) {
  return {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    skills: extractSkills(text),
    experience: extractExperience(text),
    education: extractEducation(text),
    college: extractCollege(text),
    recentCompany: extractCompany(text),
    recentRole: extractRole(text),
    summary: text.slice(0, 300).replace(/\s+/g, ' ').trim(),
  };
}

module.exports = { extractText, parseResume };
