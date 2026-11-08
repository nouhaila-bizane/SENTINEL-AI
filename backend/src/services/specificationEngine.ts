import { IFinding } from '../models/Analysis';

const AMBIGUITY_MARKERS = [
  { pattern: /\b(?:maybe|perhaps|possibly|might|could be|not sure)\b/gi, code: 'SPEC-001', title: 'Ambiguous qualifier' },
  { pattern: /\b(?:as soon as possible|soon|quickly|fast|later)\b/gi, code: 'SPEC-002', title: 'Vague timing' },
  { pattern: /\b(?:user-friendly|easy|simple|intuitive|nice|good)\b/gi, code: 'SPEC-003', title: 'Subjective requirement' },
  { pattern: /\b(?:and\/or|etc\.?|other similar|similar things)\b/gi, code: 'SPEC-004', title: 'Unclear scope' },
  { pattern: /\b(?:should|ought to)\b(?!\s+not)/gi, code: 'SPEC-005', title: 'Weak obligation (should vs must)' },
];

const REQUIRED_SECTIONS = ['authentication', 'authorization', 'error handling', 'input validation', 'logging'];

const CONTRADICTION_PAIRS: Array<[RegExp, RegExp, string]> = [
  [/\bmust be public\b/i, /\bmust be private\b/i, 'Public vs private requirement conflict'],
  [/\brequired\b/i, /\boptional\b/i, 'Required vs optional conflict on same item'],
  [/\breal-?time\b/i, /\bbatch(?:ed)?\b/i, 'Real-time vs batch processing conflict'],
  [/\bsynchronous\b/i, /\basynchronous\b/i, 'Sync vs async conflict'],
];

export const runSpecificationAnalysis = (spec: string): IFinding[] => {
  const findings: IFinding[] = [];
  const lower = spec.toLowerCase();

  for (const marker of AMBIGUITY_MARKERS) {
    const regex = new RegExp(marker.pattern.source, marker.pattern.flags);
    const matches = spec.match(regex);
    if (matches && matches.length > 0) {
      findings.push({
        code: marker.code,
        severity: 'Medium',
        category: 'Ambiguity',
        title: marker.title,
        description: `Found ${matches.length} instance(s) of ambiguous language.`,
        evidence: matches.slice(0, 3).join(', '),
        suggestion: 'Rewrite with precise, measurable language.',
      });
    }
  }

  for (const section of REQUIRED_SECTIONS) {
    if (!lower.includes(section)) {
      findings.push({
        code: 'SPEC-010',
        severity: 'High',
        category: 'Missing Requirement',
        title: `Missing section: ${section}`,
        description: `The specification does not address ${section}.`,
        suggestion: `Add a dedicated section describing ${section} behavior.`,
      });
    }
  }

  for (const [a, b, desc] of CONTRADICTION_PAIRS) {
    if (a.test(spec) && b.test(spec)) {
      findings.push({
        code: 'SPEC-020',
        severity: 'High',
        category: 'Contradiction',
        title: 'Contradictory requirements',
        description: desc,
        suggestion: 'Clarify which behavior is expected and remove the contradiction.',
      });
    }
  }

  const wordCount = spec.trim().split(/\s+/).length;
  if (wordCount < 30) {
    findings.push({
      code: 'SPEC-030',
      severity: 'High',
      category: 'Completeness',
      title: 'Specification too short',
      description: `Only ${wordCount} words provided. Specifications should be comprehensive.`,
      suggestion: 'Expand the specification with detailed functional and non-functional requirements.',
    });
  }

  return findings;
};