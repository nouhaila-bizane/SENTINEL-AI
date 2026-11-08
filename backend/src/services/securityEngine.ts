import { IFinding, Severity } from '../models/Analysis';

interface PatternRule {
  code: string;
  severity: Severity;
  category: string;
  title: string;
  description: string;
  pattern: RegExp;
  suggestion: string;
}

const RULES: PatternRule[] = [
  {
    code: 'SEC-001',
    severity: 'Critical',
    category: 'Credentials',
    title: 'Hardcoded password detected',
    description: 'A password literal appears to be embedded directly in source code.',
    pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"`][^'"`\s]{4,}['"`]/gi,
    suggestion: 'Move credentials to environment variables or a secure vault.',
  },
  {
    code: 'SEC-002',
    severity: 'Critical',
    category: 'Credentials',
    title: 'Hardcoded API key or secret',
    description: 'A string matching common API key patterns was found.',
    pattern: /(?:api[_-]?key|secret[_-]?key|access[_-]?token|auth[_-]?token)\s*[:=]\s*['"`][A-Za-z0-9_\-]{16,}['"`]/gi,
    suggestion: 'Store secrets in environment variables or a secrets manager.',
  },
  {
    code: 'SEC-003',
    severity: 'Critical',
    category: 'Credentials',
    title: 'AWS access key detected',
    description: 'A string matching AWS access key format was found.',
    pattern: /AKIA[0-9A-Z]{16}/g,
    suggestion: 'Rotate the key immediately and use IAM roles or environment variables.',
  },
  {
    code: 'SEC-004',
    severity: 'Critical',
    category: 'Credentials',
    title: 'Private key material detected',
    description: 'A private key block was found in source code.',
    pattern: /-----BEGIN\s+(RSA|DSA|EC|OPENSSH|PGP)?\s*PRIVATE KEY-----/g,
    suggestion: 'Remove private keys from source code and use secure storage.',
  },
  {
    code: 'SEC-005',
    severity: 'High',
    category: 'Execution',
    title: 'Unsafe eval() usage',
    description: 'The use of eval() can lead to code injection vulnerabilities.',
    pattern: /\beval\s*\(/g,
    suggestion: 'Replace eval() with safer alternatives such as JSON.parse or Function constructors with strict validation.',
  },
  {
    code: 'SEC-006',
    severity: 'High',
    category: 'Execution',
    title: 'Unsafe Function constructor',
    description: 'Dynamic code generation via new Function() is risky.',
    pattern: /new\s+Function\s*\(/g,
    suggestion: 'Avoid dynamic code execution. Use static logic or validated templates.',
  },
  {
    code: 'SEC-007',
    severity: 'High',
    category: 'Injection',
    title: 'Potential SQL injection (string concatenation)',
    description: 'SQL query built with string concatenation detected.',
    pattern: /(?:SELECT|INSERT|UPDATE|DELETE)\s+.*\+\s*[a-zA-Z_]/gi,
    suggestion: 'Use parameterized queries or prepared statements.',
  },
  {
    code: 'SEC-008',
    severity: 'High',
    category: 'Injection',
    title: 'Potential command injection',
    description: 'Shell execution with interpolated input detected.',
    pattern: /(?:exec|execSync|spawn)\s*\(\s*[`'"][^`'"]*\$\{/g,
    suggestion: 'Avoid shell execution with user input. Use safe APIs with argument arrays.',
  },
  {
    code: 'SEC-009',
    severity: 'Medium',
    category: 'Configuration',
    title: 'Debug mode enabled',
    description: 'Debug or development flags are enabled in source.',
    pattern: /(?:DEBUG|NODE_ENV)\s*[:=]\s*['"`]?(?:true|development)['"`]?/gi,
    suggestion: 'Disable debug mode in production builds.',
  },
  {
    code: 'SEC-010',
    severity: 'Medium',
    category: 'Configuration',
    title: 'CORS wildcard origin',
    description: 'Access-Control-Allow-Origin set to wildcard.',
    pattern: /Access-Control-Allow-Origin['"]?\s*[:=]\s*['"`]\*['"`]/gi,
    suggestion: 'Restrict CORS to specific trusted origins.',
  },
  {
    code: 'SEC-011',
    severity: 'Medium',
    category: 'Cryptography',
    title: 'Weak hashing algorithm (MD5/SHA1)',
    description: 'Use of MD5 or SHA1 for security-sensitive hashing.',
    pattern: /(?:createHash|crypto\.md5|crypto\.sha1|md5\(|sha1\()/gi,
    suggestion: 'Use SHA-256 or stronger for integrity; use bcrypt/argon2 for passwords.',
  },
  {
    code: 'SEC-012',
    severity: 'Medium',
    category: 'Cookies',
    title: 'Cookie without Secure flag',
    description: 'A cookie is set without the Secure attribute.',
    pattern: /res\.cookie\s*\([^)]*\)(?!.*secure\s*:\s*true)/g,
    suggestion: 'Set Secure, HttpOnly, and SameSite attributes on all cookies.',
  },
  {
    code: 'SEC-013',
    severity: 'Low',
    category: 'Logging',
    title: 'Console.log with sensitive variable name',
    description: 'Logging statements may leak sensitive data.',
    pattern: /console\.log\s*\(\s*[^)]*(?:password|secret|token|key)[^)]*\)/gi,
    suggestion: 'Avoid logging sensitive data. Use structured logging with redaction.',
  },
  {
    code: 'SEC-014',
    severity: 'Low',
    category: 'Error Handling',
    title: 'Empty catch block',
    description: 'Errors are silently swallowed.',
    pattern: /catch\s*\([^)]*\)\s*\{\s*\}/g,
    suggestion: 'Log or handle errors appropriately.',
  },
  {
    code: 'SEC-015',
    severity: 'Info',
    category: 'Dependency',
    title: 'TODO/FIXME/HACK marker',
    description: 'Code contains unresolved markers that may indicate risk.',
    pattern: /\b(?:TODO|FIXME|HACK|XXX)\b/gi,
    suggestion: 'Review and resolve outstanding markers before release.',
  },
];

export interface ScanResult {
  findings: IFinding[];
  scannedAt: Date;
  rulesEvaluated: number;
  sourceLength: number;
}

export const runSecurityScan = (source: string, fileName?: string): ScanResult => {
  const findings: IFinding[] = [];
  const lines = source.split('\n');

  for (const rule of RULES) {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
    let match: RegExpExecArray | null;
    const seen = new Set<string>();

    while ((match = regex.exec(source)) !== null) {
      const idx = match.index;
      const lineNo = source.substring(0, idx).split('\n').length;
      const lineContent = lines[lineNo - 1]?.trim() || '';
      const key = `${rule.code}:${lineNo}`;
      if (seen.has(key)) continue;
      seen.add(key);

      findings.push({
        code: rule.code,
        severity: rule.severity,
        category: rule.category,
        title: rule.title,
        description: rule.description,
        evidence: lineContent.substring(0, 200),
        file: fileName || 'source',
        line: lineNo,
        suggestion: rule.suggestion,
      });

      if (!regex.global) break;
    }
  }

  return {
    findings,
    scannedAt: new Date(),
    rulesEvaluated: RULES.length,
    sourceLength: source.length,
  };
};