# SENTINEL AI
## Final Engineering Directive
### AI-Native Software Quality & Security Gate

## 1. Mission

SENTINEL AI explores how software quality, security verification, and release decisions can become part of one integrated engineering workflow.

Its mission is to reduce the gap between writing code and proving that the resulting software is ready for release.

The guiding principle is:

**No release should be approved solely because the software appears to work. Release decisions must be supported by verifiable evidence.**

## 2. Current Implementation

The prototype is built with:

- **Frontend:** React, TypeScript, and Vite.
- **Backend:** Node.js, Express, and TypeScript.
- **Database:** MongoDB and Mongoose.
- **Authentication:** Protected routes and role-based access control.
- **Security controls:** Input validation, rate limiting, authorization checks, and audit logging.

The platform brings together source analysis, specification checks, verification results, and release decisions.

Its release gate supports decisions such as **BLOCK** and **RETRY**, allowing identified problems and failed verification to affect the release process.

## 3. Engineering Directive

The following rules guide the current release-assessment workflow:

1. **Critical and high-severity security findings:** Block release while unresolved.
2. **Failed or incomplete required verification:** Do not treat the project as successfully verified; require another assessment.
3. **Missing evidence:** Do not silently interpret unavailable checks as successful checks.
4. **Authorization failures:** Reject access to protected resources and administrative operations when permissions are insufficient.
5. **Recovery limits:** Enforce configured recovery-attempt limits.
6. **Auditability:** Record important platform activities and release-related operations.

The release gate is designed to prioritize safety over speed. Automation must never turn an unknown or failed result into an automatic approval.

## 4. Verification Evidence

The prototype was built and checked through functional and security-focused tests.

### Build and dependency checks

- Backend TypeScript build completed successfully.
- Frontend production build completed successfully.
- Backend dependency audit reported zero known vulnerabilities.
- Frontend dependency audit reported zero known vulnerabilities.
- Dependency trees were checked after updates.

These results concern the dependencies checked at the time of testing. They do not prove that the entire application is free from vulnerabilities.

### Security and access-control checks

The following scenarios were tested:

- Unauthenticated access to protected endpoints was rejected.
- A normal user attempting administrative operations received a forbidden response.
- Attempts to access another user's analysis were rejected.
- Attempts to escalate a normal user's role were rejected.
- Invalid request parameters were rejected through validation.
- NoSQL-style query input was rejected where an object was expected.
- Rate limits were triggered on authentication, analysis, and general API requests.
- Malicious HTML input was displayed as text rather than executed.
- Frontend source inspection found no use of `dangerouslySetInnerHTML`, `innerHTML`, `insertAdjacentHTML`, or `outerHTML`.
- Administrative activity was recorded in audit logs.

### Functional checks

- Analysis creation and result display were tested.
- Release decisions were checked against security findings and verification results.
- Recovery-attempt limits were enforced.
- Administrative settings and user-management operations were tested.
- PDF report generation and export were verified.

### Example analysis

A deliberately unsafe sample project was submitted to demonstrate the analysis workflow.

The assessment identified:

- A critical hardcoded-password finding.
- A high-severity unsafe `eval()` finding.
- Missing or insufficient specification information.
- A failed deterministic security scan.
- Dependency auditing skipped because the submitted sample did not contain a detected dependency manifest.
- License validation failed because no license identifier was provided.

The resulting assessment demonstrated how findings and missing evidence can influence the release decision.

This sample was a test input. Its findings must not be interpreted as vulnerabilities found in SENTINEL AI itself.

## 5. Current Limitations

The current prototype is a focused engineering demonstration, not a complete autonomous software-development system.

It does not yet:

- Convert every natural-language requirement into a complete formal specification.
- Independently implement entire software features.
- Automatically repair every detected vulnerability.
- Guarantee detection of all security or functional defects.
- Guarantee production-scale performance or resilience.
- Achieve the long-term targets of sub-one-hour lead time or near-zero human intervention.

Its security analysis is based on implemented detection rules and available project evidence. Results therefore have limitations, including possible false positives and false negatives.

## 6. Next Engineering Priorities

The next development stages should focus on:

1. **Specification intelligence:** Use AI to turn incomplete requirements into structured, testable specifications.
2. **Agent-assisted implementation:** Allow isolated agents to propose code changes based on approved specifications.
3. **Automated test generation:** Generate tests from specifications and expected behavior.
4. **Independent verification:** Verify generated changes separately from the agent that created them.
5. **Controlled remediation:** Propose fixes for detected problems, then run verification again.
6. **CI/CD integration:** Connect the release gate to real development and deployment pipelines.
7. **Evaluation and observability:** Measure false positives, false negatives, verification reliability, and time saved.
8. **Human oversight:** Preserve approval requirements for high-impact or uncertain decisions.

## 7. Long-Term Engineering Targets

SENTINEL AI is designed around two ambitious future targets:

**Sub-One-Hour Lead Time**

Reduce the time between an implementation-ready specification and a verified software result.

**Near-Zero Human Intervention**

Automate repetitive implementation, testing, and verification tasks while preserving human oversight for security-sensitive and high-impact decisions.

These are strategic targets, not capabilities claimed by the current prototype.

## 8. Final Directive

SENTINEL AI should evolve toward a system in which every important engineering action produces evidence, every critical finding affects the release decision, and every automated change is independently verified.

The system must prefer a safe rejection over an unsupported approval.

Automation should increase engineering speed without weakening security, accountability, or reliability.

**The objective is not simply to automate software development. It is to make automated software development verifiable, secure, and trustworthy.**