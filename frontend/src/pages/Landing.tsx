import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Zap, CheckCircle2, ArrowRight, Code2, Server, Radar, FileCheck, ShieldAlert, Sparkles, DoorOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <div className="min-h-screen bg-sentinel-bg text-sentinel-text overflow-x-hidden">
      <nav className="fixed w-full z-50 bg-sentinel-bg/70 backdrop-blur-xl border-b border-sentinel-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sentinel-cyan to-sentinel-purple flex items-center justify-center">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <span className="font-bold tracking-wider">SENTINEL AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-sentinel-muted hover:text-sentinel-cyan transition">Features</a>
            <a href="#how" className="text-sentinel-muted hover:text-sentinel-cyan transition">How it works</a>
            <a href="#security" className="text-sentinel-muted hover:text-sentinel-cyan transition">Security</a>
            <a href="#pricing" className="text-sentinel-muted hover:text-sentinel-cyan transition">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-sentinel-muted hover:text-sentinel-text transition px-3 py-2">Login</Link>
            <Link to="/register" className="text-sm font-medium bg-gradient-to-r from-sentinel-blue to-sentinel-cyan text-white px-4 py-2 rounded-lg shadow-lg shadow-sentinel-blue/20 hover:opacity-90 transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-sentinel-cyan/10 rounded-full blur-[120px] animate-glow-pulse" />
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-sentinel-purple/10 rounded-full blur-[120px] animate-glow-pulse" />

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sentinel-cyan/30 bg-sentinel-cyan/5 text-sentinel-cyan text-xs font-medium mb-8">
              <Sparkles size={14} /> Intelligent Software Verification Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
              Your Software.<br />
              <span className="gradient-text">Verified. Secured.</span><br />
              Ready to Ship.
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-sentinel-muted leading-relaxed">
              An intelligent verification platform that transforms software specifications and code into actionable security insights and release confidence.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-sentinel-blue to-sentinel-purple text-white font-semibold shadow-xl shadow-sentinel-purple/25 hover:scale-[1.02] transition">
                Start Free <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
              </Link>
              <a href="#features" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-sentinel-border bg-sentinel-card/50 hover:border-sentinel-cyan/50 transition font-semibold">
                Explore Platform
              </a>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-xs text-sentinel-muted">
              {['SOC 2 Ready', 'Zero-Knowledge Auth', 'Deterministic Scans', 'Audit Logging'].map((t) => (
                <div key={t} className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-sentinel-success" />{t}</div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative max-w-6xl mx-auto mt-20">
          <div className="absolute -inset-4 bg-gradient-to-r from-sentinel-cyan/20 via-sentinel-blue/20 to-sentinel-purple/20 rounded-3xl blur-2xl" />
          <div className="relative glass-panel rounded-2xl p-2 glow-cyan">
            <div className="bg-sentinel-bg rounded-xl border border-sentinel-border overflow-hidden">
              <div className="h-10 bg-sentinel-card border-b border-sentinel-border flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-sentinel-danger/60" />
                <div className="w-3 h-3 rounded-full bg-sentinel-warning/60" />
                <div className="w-3 h-3 rounded-full bg-sentinel-success/60" />
                <div className="ml-4 text-xs text-sentinel-muted font-mono">sentinel.ai/dashboard</div>
              </div>
              <div className="p-6 grid grid-cols-12 gap-4 min-h-[400px]">
                <div className="col-span-3 space-y-3">
                  {['Overview', 'New Analysis', 'Security', 'Verification', 'Release Gate'].map((i, idx) => (
                    <div key={i} className={`h-9 rounded-lg ${idx === 0 ? 'bg-sentinel-cyan/10 border border-sentinel-cyan/30' : 'bg-sentinel-card border border-sentinel-border'}`} />
                  ))}
                </div>
                <div className="col-span-9 space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Security Score', value: '94', color: 'text-sentinel-success' },
                      { label: 'Active Analyses', value: '12', color: 'text-sentinel-cyan' },
                      { label: 'Vulnerabilities', value: '3', color: 'text-sentinel-warning' },
                      { label: 'Release Status', value: 'PASS', color: 'text-sentinel-success' },
                    ].map((s) => (
                      <div key={s.label} className="bg-sentinel-card border border-sentinel-border rounded-lg p-3">
                        <div className="text-[10px] text-sentinel-muted uppercase">{s.label}</div>
                        <div className={`text-xl font-bold ${s.color} mt-1`}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-sentinel-card border border-sentinel-border rounded-lg p-4 h-48 flex items-end gap-2">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-sentinel-blue to-sentinel-cyan rounded-t" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Complete verification pipeline</h2>
            <p className="text-sentinel-muted max-w-2xl mx-auto">From specification analysis to release decision — every step is deterministic, auditable, and secure.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileCheck, title: 'Specification Analysis', desc: 'Detects missing, ambiguous, or contradictory requirements before they become bugs.', color: 'cyan' },
              { icon: ShieldAlert, title: 'Security Scanning', desc: 'Deterministic detection of hardcoded secrets, unsafe patterns, and dangerous configurations.', color: 'danger' },
              { icon: CheckCircle2, title: 'Verification', desc: 'Runs structured checks with evidence. Tracks passed, failed, skipped, and unavailable states.', color: 'success' },
              { icon: Radar, title: 'Intelligent Recovery', desc: 'Up to two correction attempts per analysis, with full history and audit trail.', color: 'purple' },
              { icon: DoorOpen, title: 'Release Gate', desc: 'PASS, BLOCK, or RETRY decisions based on real evidence — never fabricated.', color: 'blue' },
              { icon: Code2, title: 'Evidence & Reports', desc: 'Downloadable PDF reports with full findings, verification runs, and release history.', color: 'warning' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative bg-sentinel-card border border-sentinel-border rounded-2xl p-6 hover:border-sentinel-cyan/40 transition"
              >
                <div className={`w-12 h-12 rounded-xl bg-sentinel-${f.color}/10 border border-sentinel-${f.color}/30 flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                  <f.icon className={`text-sentinel-${f.color}`} size={22} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sentinel-muted text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-24 px-6 bg-sentinel-bg2/50 border-y border-sentinel-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How it works</h2>
            <p className="text-sentinel-muted">Four steps from code to release confidence.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Submit', desc: 'Upload specifications and source code.' },
              { step: '02', title: 'Analyze', desc: 'Run specification and security analysis.' },
              { step: '03', title: 'Verify', desc: 'Execute verification and recovery checks.' },
              { step: '04', title: 'Release', desc: 'Receive a PASS, BLOCK, or RETRY decision.' },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                <div className="text-6xl font-black gradient-text opacity-30 mb-2">{s.step}</div>
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-sentinel-muted text-sm">{s.desc}</p>
                {i < 3 && <div className="hidden md:block absolute top-6 -right-3 text-sentinel-border"><ArrowRight /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-sentinel-cyan text-sm mb-4"><Lock size={16} /> Security-first architecture</div>
            <h2 className="text-4xl font-bold mb-6">Built for teams that cannot afford to be wrong.</h2>
            <p className="text-sentinel-muted mb-6">Every authentication, every analysis, every release decision is logged, auditable, and protected by defense-in-depth controls.</p>
            <ul className="space-y-3">
              {['HTTP-only secure cookies', 'bcrypt password hashing (cost 12)', 'Role-based access control', 'Rate limiting on all auth endpoints', 'Full audit trail of privileged actions', 'Protection of last super admin account'].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm"><CheckCircle2 size={16} className="text-sentinel-success mt-0.5 flex-shrink-0" /><span>{t}</span></li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-sentinel-cyan/20 to-sentinel-purple/20 rounded-3xl blur-2xl" />
            <div className="relative glass-panel rounded-2xl p-8 space-y-4">
              {[
                { label: 'Authentication', status: 'Secure', color: 'success' },
                { label: 'Data at rest', status: 'Encrypted', color: 'success' },
                { label: 'Access control', status: 'Enforced', color: 'success' },
                { label: 'Audit logging', status: 'Active', color: 'success' },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between py-3 border-b border-sentinel-border last:border-0">
                  <span className="text-sentinel-muted text-sm">{r.label}</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full bg-sentinel-${r.color}/10 text-sentinel-${r.color} border border-sentinel-${r.color}/30`}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 px-6 bg-sentinel-bg2/50 border-y border-sentinel-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-sentinel-muted">Start free. Scale when you need to.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Starter', price: 'Free', features: ['5 analyses / month', 'Basic security scan', 'Community support'], cta: 'Start free' },
              { name: 'Team', price: '$49', features: ['Unlimited analyses', 'Full verification pipeline', 'PDF reports', 'Priority support'], cta: 'Start trial', featured: true },
              { name: 'Enterprise', price: 'Custom', features: ['SSO', 'Dedicated infrastructure', 'SLA', 'Custom integrations'], cta: 'Contact sales' },
            ].map((p) => (
              <div key={p.name} className={`relative rounded-2xl p-8 ${p.featured ? 'bg-gradient-to-br from-sentinel-blue/20 to-sentinel-purple/20 border-2 border-sentinel-cyan/40' : 'bg-sentinel-card border border-sentinel-border'}`}>
                {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full bg-sentinel-cyan text-sentinel-bg">MOST POPULAR</div>}
                <h3 className="text-xl font-bold">{p.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{p.price}</span>
                  {p.price !== 'Free' && p.price !== 'Custom' && <span className="text-sentinel-muted">/mo</span>}
                </div>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm"><CheckCircle2 size={16} className="text-sentinel-cyan mt-0.5" />{f}</li>
                  ))}
                </ul>
                <Link to="/register" className={`mt-8 block text-center py-3 rounded-lg font-medium ${p.featured ? 'bg-gradient-to-r from-sentinel-blue to-sentinel-cyan text-white' : 'bg-sentinel-bg border border-sentinel-border hover:border-sentinel-cyan/50'}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-sentinel-cyan/10 via-sentinel-blue/10 to-sentinel-purple/10 rounded-3xl blur-3xl" />
          <div className="relative glass-panel rounded-3xl p-12 border border-sentinel-cyan/20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ship with confidence.</h2>
            <p className="text-sentinel-muted mb-8 max-w-xl mx-auto">Join teams that verify before they release.</p>
            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-sentinel-blue to-sentinel-purple text-white font-semibold shadow-xl shadow-sentinel-purple/25 hover:scale-[1.02] transition">
              Get Started <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-sentinel-border py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sentinel-cyan to-sentinel-purple flex items-center justify-center">
                <ShieldCheck size={18} className="text-white" />
              </div>
              <span className="font-bold">SENTINEL AI</span>
            </div>
            <p className="text-sm text-sentinel-muted">Intelligent verification for modern software teams.</p>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Security', 'Pricing', 'Changelog'] },
            { title: 'Resources', links: ['Documentation', 'API Reference', 'Status', 'Support'] },
            { title: 'Company', links: ['About', 'Contact', 'Privacy', 'Terms'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold mb-4 text-sm">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="text-sm text-sentinel-muted hover:text-sentinel-cyan transition">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-sentinel-border flex flex-col md:flex-row justify-between items-center text-xs text-sentinel-muted">
          <div>© 2026 SENTINEL AI. All rights reserved.</div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-sentinel-cyan">Privacy</a>
            <a href="#" className="hover:text-sentinel-cyan">Terms</a>
            <a href="#" className="hover:text-sentinel-cyan">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}