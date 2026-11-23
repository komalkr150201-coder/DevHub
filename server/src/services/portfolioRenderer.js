function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderCss(portfolio = {}) {
  const template = portfolio.template || 'aurora';
  const accent = portfolio.theme?.accent || '#6366f1';
  const accent2 = portfolio.theme?.accent2 || '#22d3ee';

  if (template === 'terminal') {
    return `
:root {
  --bg: #0d1117;
  --surface: #161b22;
  --surface-border: #30363d;
  --text: #e6edf3;
  --text-muted: #8b949e;
  --accent: ${accent || '#39d353'};
  --accent2: ${accent2 || '#58a6ff'};
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-mono);
  line-height: 1.6;
  padding: 2rem 1.5rem;
}
.container { max-width: 900px; margin: 0 auto; }
header {
  border-bottom: 1px dashed var(--surface-border);
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}
.prompt { color: var(--accent); font-weight: bold; }
.nav-links a {
  color: var(--text-muted);
  text-decoration: none;
  margin-left: 1.25rem;
  font-size: 0.9rem;
}
.nav-links a:hover { color: var(--accent); text-decoration: underline; }
section { margin-bottom: 3rem; }
.section-title {
  color: var(--accent);
  font-size: 1.2rem;
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.section-title::before { content: "$ ls -la ./"; color: var(--text-muted); }
.hero-box {
  background: var(--surface);
  border: 1px solid var(--surface-border);
  border-left: 4px solid var(--accent);
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-radius: 4px;
}
.hero-avatar {
  width: 72px;
  height: 72px;
  border-radius: 4px;
  border: 1px solid var(--surface-border);
  object-fit: cover;
  margin-bottom: 1rem;
}
.name { font-size: 1.8rem; color: var(--text); font-weight: bold; }
.headline { color: var(--accent2); margin-bottom: 0.75rem; font-size: 1.05rem; }
.bio { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1rem; white-space: pre-line; }
.links { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem; }
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  border: 1px solid var(--surface-border);
  background: var(--surface);
  color: var(--text);
  text-decoration: none;
  font-size: 0.85rem;
}
.btn:hover { border-color: var(--accent); color: var(--accent); }
.btn-primary { background: var(--accent); color: #000; border-color: var(--accent); font-weight: bold; }
.btn-primary:hover { opacity: 0.9; color: #000; }
.skills-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.skill-tag {
  background: var(--surface);
  border: 1px solid var(--surface-border);
  padding: 0.2rem 0.6rem;
  border-radius: 3px;
  font-size: 0.85rem;
  color: var(--text-muted);
}
.skill-tag:hover { color: var(--accent); border-color: var(--accent); }
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}
.project-card {
  background: var(--surface);
  border: 1px solid var(--surface-border);
  padding: 1.25rem;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.project-card:hover { border-color: var(--accent2); }
.project-card h3 { font-size: 1.1rem; color: var(--text); margin-bottom: 0.5rem; }
.project-card p { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem; flex-grow: 1; }
.project-tech { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem; }
.project-tech span { font-size: 0.75rem; color: var(--accent2); }
.timeline-item {
  border-left: 2px dashed var(--surface-border);
  padding-left: 1.25rem;
  margin-left: 0.5rem;
  margin-bottom: 1.5rem;
  position: relative;
}
.timeline-item::before {
  content: "";
  position: absolute;
  left: -5px;
  top: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
}
.timeline-item h4 { font-size: 1rem; color: var(--text); }
.timeline-item .sub { font-size: 0.85rem; color: var(--accent2); margin-bottom: 0.4rem; }
.timeline-item .date { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem; }
.timeline-item p { font-size: 0.85rem; color: var(--text-muted); }
footer {
  margin-top: 4rem;
  padding-top: 1.5rem;
  border-top: 1px dashed var(--surface-border);
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted);
}
`;
  }

  if (template === 'minimal') {
    return `
:root {
  --bg: #fafafa;
  --surface: #ffffff;
  --surface-border: #e5e5e5;
  --text: #171717;
  --text-muted: #737373;
  --accent: ${accent || '#171717'};
  --accent2: ${accent2 || '#404040'};
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  padding: 3rem 1.5rem;
}
.container { max-width: 860px; margin: 0 auto; }
header {
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--surface-border);
  margin-bottom: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 1rem;
}
.prompt { font-family: Georgia, serif; font-size: 1.25rem; font-weight: bold; color: var(--text); }
.nav-links a {
  color: var(--text-muted);
  text-decoration: none;
  margin-left: 1.5rem;
  font-size: 0.9rem;
}
.nav-links a:hover { color: var(--text); }
section { margin-bottom: 3.5rem; }
.section-title {
  font-family: Georgia, serif;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
  border-bottom: 1px solid var(--surface-border);
  padding-bottom: 0.5rem;
}
.hero-box {
  margin-bottom: 3rem;
}
.hero-avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1.25rem;
}
.name { font-family: Georgia, serif; font-size: 2.4rem; font-weight: 600; margin-bottom: 0.25rem; }
.headline { font-size: 1.15rem; color: var(--text-muted); margin-bottom: 1rem; }
.bio { font-size: 1rem; color: var(--text); line-height: 1.7; margin-bottom: 1.25rem; white-space: pre-line; }
.links { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--surface-border);
  background: var(--surface);
  color: var(--text);
  text-decoration: none;
  font-size: 0.85rem;
}
.btn:hover { background: #f0f0f0; }
.btn-primary { background: var(--text); color: #fff; border-color: var(--text); }
.btn-primary:hover { background: #333; }
.skills-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.skill-tag {
  background: var(--surface);
  border: 1px solid var(--surface-border);
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: var(--text);
}
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
.project-card {
  background: var(--surface);
  border: 1px solid var(--surface-border);
  padding: 1.5rem;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
}
.project-card h3 { font-family: Georgia, serif; font-size: 1.2rem; margin-bottom: 0.5rem; }
.project-card p { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem; flex-grow: 1; }
.project-tech { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem; }
.project-tech span { font-size: 0.75rem; color: var(--text-muted); background: #f5f5f5; padding: 0.15rem 0.4rem; border-radius: 3px; }
.timeline-item {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--surface-border);
  margin-bottom: 1.5rem;
}
.timeline-item:last-child { border-bottom: none; }
.timeline-item h4 { font-size: 1.1rem; color: var(--text); font-weight: 600; }
.timeline-item .sub { font-size: 0.95rem; color: var(--text-muted); }
.timeline-item .date { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem; }
.timeline-item p { font-size: 0.9rem; color: var(--text); }
footer {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid var(--surface-border);
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted);
}
`;
  }

  if (template === 'cyberpunk') {
    return `
:root {
  --bg: #070913;
  --surface: #0f172a;
  --surface-border: rgba(168, 85, 247, 0.25);
  --text: #f8fafc;
  --text-muted: #94a3b8;
  --accent: ${accent || '#a855f7'};
  --accent2: ${accent2 || '#06b6d4'};
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--bg);
  background-image: 
    linear-gradient(rgba(168, 85, 247, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px);
  background-size: 32px 32px;
  color: var(--text);
  font-family: var(--font-sans);
  line-height: 1.6;
  padding: 2.5rem 1.5rem;
  min-height: 100vh;
}
.container { max-width: 940px; margin: 0 auto; }
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.25rem;
  padding: 1.2rem 1.75rem;
  background: var(--surface);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  box-shadow: 0 0 25px -10px rgba(168, 85, 247, 0.4);
  margin-bottom: 3.5rem;
}
.prompt { font-weight: 800; font-size: 1.25rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--accent); }
.nav-links a {
  color: var(--text-muted);
  text-decoration: none;
  margin-left: 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  transition: color 0.2s;
}
.nav-links a:hover { color: var(--accent2); }
section { margin-bottom: 4rem; }
.section-title {
  font-size: 1.5rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-left: 4px solid var(--accent);
  padding-left: 0.75rem;
}
.hero-box {
  background: var(--surface);
  border: 1px solid var(--surface-border);
  padding: 2.5rem;
  border-radius: 12px;
  margin-bottom: 3.5rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.7);
}
.hero-box::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
}
.hero-avatar {
  width: 96px;
  height: 96px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid var(--accent);
  margin-bottom: 1.25rem;
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.5);
}
.name {
  font-size: 2.5rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #fff;
  margin-bottom: 0.25rem;
}
.headline {
  font-size: 1.2rem;
  color: var(--accent2);
  font-weight: 600;
  margin-bottom: 1.25rem;
}
.bio {
  color: var(--text-muted);
  font-size: 1.05rem;
  max-width: 720px;
  margin-bottom: 1.75rem;
  line-height: 1.7;
  white-space: pre-line;
}
.links { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  border: 1px solid var(--surface-border);
  background: rgba(15, 23, 42, 0.8);
  color: #fff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
}
.btn:hover {
  border-color: var(--accent);
  box-shadow: 0 0 12px rgba(168, 85, 247, 0.4);
}
.btn-primary {
  background: linear-gradient(135deg, var(--accent), #7c3aed);
  border: none;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.6);
}
.btn-primary:hover {
  box-shadow: 0 0 28px rgba(168, 85, 247, 0.9);
}
.skills-grid { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.skill-tag {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid var(--surface-border);
  padding: 0.4rem 0.9rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
  transition: all 0.2s;
}
.skill-tag:hover {
  border-color: var(--accent2);
  color: var(--accent2);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.4);
}
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 1.5rem;
}
.project-card {
  background: var(--surface);
  border: 1px solid var(--surface-border);
  padding: 1.75rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s;
}
.project-card:hover {
  border-color: var(--accent2);
  box-shadow: 0 0 20px -5px rgba(6, 182, 212, 0.35);
}
.project-card h3 { font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem; }
.project-card p { font-size: 0.92rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1.25rem; flex-grow: 1; }
.project-tech { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.25rem; }
.project-tech span {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: var(--accent2);
}
.timeline-item {
  background: var(--surface);
  border: 1px solid var(--surface-border);
  border-left: 3px solid var(--accent);
  padding: 1.5rem;
  border-radius: 6px;
  margin-bottom: 1.25rem;
}
.timeline-item h4 { font-size: 1.15rem; font-weight: 700; color: #fff; }
.timeline-item .sub { font-size: 0.95rem; color: var(--accent2); font-weight: 600; }
.timeline-item .date { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.6rem; }
.timeline-item p { font-size: 0.92rem; color: var(--text-muted); }
footer {
  margin-top: 5rem;
  padding-top: 2rem;
  border-top: 1px solid var(--surface-border);
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-muted);
}
`;
  }

  // Default: Aurora (Modern Glass & Gradients)
  return `
:root {
  --bg: #0b0f19;
  --surface: rgba(22, 27, 46, 0.7);
  --surface-border: rgba(255, 255, 255, 0.08);
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --accent: ${accent || '#6366f1'};
  --accent2: ${accent2 || '#22d3ee'};
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--bg);
  background-image: 
    radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
    radial-gradient(circle at 85% 85%, rgba(34, 211, 238, 0.12) 0%, transparent 40%);
  color: var(--text);
  font-family: var(--font-sans);
  line-height: 1.6;
  padding: 2.5rem 1.5rem;
  min-height: 100vh;
}
.container { max-width: 960px; margin: 0 auto; }
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.25rem;
  padding: 1rem 1.5rem;
  background: var(--surface);
  border: 1px solid var(--surface-border);
  border-radius: 9999px;
  backdrop-filter: blur(12px);
  margin-bottom: 3.5rem;
}
.prompt { font-weight: 700; font-size: 1.15rem; background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.nav-links a {
  color: var(--text-muted);
  text-decoration: none;
  margin-left: 1.25rem;
  font-size: 0.9rem;
  transition: color 0.2s;
}
.nav-links a:hover { color: #fff; }
section { margin-bottom: 4rem; }
.section-title {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.section-title span {
  background: linear-gradient(135deg, #fff, var(--text-muted));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero-box {
  background: var(--surface);
  border: 1px solid var(--surface-border);
  padding: 2.5rem;
  border-radius: 20px;
  backdrop-filter: blur(16px);
  margin-bottom: 3.5rem;
  position: relative;
  overflow: hidden;
}
.hero-box::after {
  content: "";
  position: absolute;
  top: 0; right: 0; width: 250px; height: 250px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
  pointer-events: none;
}
.hero-avatar {
  width: 96px;
  height: 96px;
  border-radius: 24px;
  object-fit: cover;
  border: 2px solid var(--surface-border);
  margin-bottom: 1.25rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
}
.name {
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(to right, #fff, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.25rem;
}
.headline {
  font-size: 1.2rem;
  color: var(--accent2);
  font-weight: 500;
  margin-bottom: 1.25rem;
}
.bio {
  color: var(--text-muted);
  font-size: 1.05rem;
  max-width: 720px;
  margin-bottom: 1.75rem;
  line-height: 1.7;
  white-space: pre-line;
}
.links { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  border: 1px solid var(--surface-border);
  background: var(--surface);
  color: #fff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}
.btn:hover {
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.btn-primary {
  background: linear-gradient(135deg, var(--accent), #4f46e5);
  border: none;
  color: #fff;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.btn-primary:hover {
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
}
.skills-grid { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.skill-tag {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--surface-border);
  padding: 0.4rem 0.9rem;
  border-radius: 9999px;
  font-size: 0.9rem;
  color: var(--text);
  backdrop-filter: blur(8px);
  transition: all 0.2s;
}
.skill-tag:hover {
  border-color: var(--accent);
  background: rgba(99, 102, 241, 0.15);
  color: #fff;
}
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 1.5rem;
}
.project-card {
  background: var(--surface);
  border: 1px solid var(--surface-border);
  padding: 1.75rem;
  border-radius: 16px;
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  transition: all 0.2s;
}
.project-card:hover {
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-3px);
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.5);
}
.project-card h3 { font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
.project-card p { font-size: 0.92rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1.25rem; flex-grow: 1; }
.project-tech { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.25rem; }
.project-tech span {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  background: rgba(34, 211, 238, 0.1);
  color: var(--accent2);
}
.timeline-item {
  background: var(--surface);
  border: 1px solid var(--surface-border);
  padding: 1.5rem;
  border-radius: 14px;
  margin-bottom: 1.25rem;
  backdrop-filter: blur(10px);
}
.timeline-item h4 { font-size: 1.15rem; font-weight: 700; color: #fff; }
.timeline-item .sub { font-size: 0.95rem; color: var(--accent2); font-weight: 500; }
.timeline-item .date { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.6rem; }
.timeline-item p { font-size: 0.92rem; color: var(--text-muted); }
footer {
  margin-top: 5rem;
  padding-top: 2rem;
  border-top: 1px solid var(--surface-border);
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-muted);
}
`;
}

export function renderJs() {
  return `
document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for internal anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Dynamic portfolio link and email dispatch handler
  document.querySelectorAll('.btn-send-email').forEach((btn) => {
    btn.addEventListener('click', function(e) {
      const email = this.getAttribute('data-email');
      if (!email) return;
      const name = this.getAttribute('data-name') || 'Developer';
      const slug = this.getAttribute('data-slug') || '';
      
      let origin = window.location.origin;
      try {
        if (window.parent && window.parent !== window && window.parent.location?.origin) {
          origin = window.parent.location.origin;
        }
      } catch (_) {}

      const isBlankOrPreview = window.location.href.includes('about:') || window.location.href.startsWith('data:');
      const url = slug ? (origin + '/u/' + slug) : (!isBlankOrPreview ? window.location.href : (origin + '/u/' + (slug || 'portfolio')));
      const dlUrl = slug ? (origin + '/u/' + slug + '/download') : '';

      const subject = encodeURIComponent('Developer Portfolio - ' + name);
      let bodyText = 'Hi,\\n\\nHere is my developer portfolio link:\\n' + url + '\\n\\nYou can explore my projects, technical skills, and experience, and download the full portfolio package.\\n';
      if (dlUrl) {
        bodyText += '\\nDownload portfolio: ' + dlUrl + '\\n';
      }
      bodyText += '\\nLooking forward to connecting!\\n\\nBest regards,\\n' + name;
      
      const dynamicHref = 'mailto:' + email + '?subject=' + subject + '&body=' + encodeURIComponent(bodyText);
      this.href = dynamicHref;

      // Communicate to parent window if inside preview iframe
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'DEVHUB_SEND_EMAIL', href: dynamicHref, url: url }, '*');
        }
      } catch (_) {}
    });
  });

  // Dynamic download handler
  document.querySelectorAll('.btn-download-portfolio').forEach((btn) => {
    btn.addEventListener('click', function(e) {
      const slug = this.getAttribute('data-slug') || '';
      let origin = window.location.origin;
      try {
        if (window.parent && window.parent !== window && window.parent.location?.origin) {
          origin = window.parent.location.origin;
        }
      } catch (_) {}

      if (slug) {
        this.href = origin + '/u/' + slug + '/download';
      }

      // If running inside preview iframe, notify parent to trigger direct export
      try {
        if (window.parent && window.parent !== window) {
          e.preventDefault();
          window.parent.postMessage({ type: 'DEVHUB_DOWNLOAD_PORTFOLIO', slug: slug }, '*');
        }
      } catch (_) {}
    });
  });
});
`;
}

export function renderHtml(portfolio = {}, { inline = false } = {}) {
  const p = portfolio.profile || {};
  const sections = portfolio.sections || {};
  const name = escapeHtml(p.name || 'Developer Portfolio');
  const headline = escapeHtml(p.headline || 'Full-Stack Developer');
  const bio = escapeHtml(p.bio || '');
  const email = escapeHtml(p.email || '');
  const avatarUrl = p.avatarUrl ? escapeHtml(p.avatarUrl) : '';
  const links = p.links || {};

  const skills = Array.isArray(portfolio.skills) ? portfolio.skills : [];
  const projects = (portfolio.projects || []).filter((pr) => pr.visible !== false);
  const education = portfolio.education || [];
  const experience = portfolio.experience || [];

  const slug = portfolio.slug || '';
  const hostBase = portfolio.publicBaseUrl || '';
  const portfolioUrl = hostBase ? `${hostBase}/u/${slug || ''}` : (slug ? `/u/${slug}` : '');
  const downloadUrl = hostBase ? `${hostBase}/u/${slug || ''}/download` : (slug ? `/u/${slug}/download` : '');

  const mailSubject = `Developer Portfolio - ${name}`;
  const mailBody = `Hi,

Here is my developer portfolio link:
${portfolioUrl || 'Portfolio link'}

You can explore my featured projects, technical skills, and experience, and download the full portfolio package.
${downloadUrl ? `Direct Download: ${downloadUrl}\n` : ''}
Looking forward to connecting!

Best regards,
${name}`;

  const mailtoHref = email
    ? `mailto:${email}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`
    : '';

  const styleTag = inline
    ? `<style>${renderCss(portfolio)}</style>`
    : `<link rel="stylesheet" href="css/style.css">`;

  const scriptTag = inline
    ? `<script>${renderJs()}</script>`
    : `<script src="js/main.js"></script>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} - ${headline}</title>
  <meta name="description" content="${headline}. ${bio.slice(0, 140)}">
  ${styleTag}
</head>
<body>
  <div class="container">
    <header>
      <div class="prompt">${name}</div>
      <nav class="nav-links">
        ${sections.about !== false ? '<a href="#about">About</a>' : ''}
        ${sections.skills !== false && skills.length ? '<a href="#skills">Skills</a>' : ''}
        ${sections.projects !== false && projects.length ? '<a href="#projects">Projects</a>' : ''}
        ${sections.experience !== false && experience.length ? '<a href="#experience">Experience</a>' : ''}
        ${sections.education !== false && education.length ? '<a href="#education">Education</a>' : ''}
        ${sections.contact !== false && (email || links.github) ? '<a href="#contact">Contact</a>' : ''}
      </nav>
    </header>

    <main>
      <section id="about" class="hero-box">
        ${avatarUrl ? `<img src="${avatarUrl}" alt="${name}" class="hero-avatar">` : ''}
        <h1 class="name">${name}</h1>
        <p class="headline">${headline}</p>
        ${bio ? `<div class="bio">${bio}</div>` : ''}
        
        <div class="links">
          ${email ? `<a href="${mailtoHref}" class="btn btn-primary btn-send-email" data-email="${email}" data-name="${name}" data-slug="${escapeHtml(slug)}" target="_blank" rel="noopener noreferrer">Get in Touch</a>` : ''}
          <a href="${downloadUrl || '#'}" class="btn btn-download-portfolio" data-slug="${escapeHtml(slug)}" download="${slug || 'portfolio'}.zip">Download Portfolio</a>
          ${links.github ? `<a href="${escapeHtml(links.github)}" target="_blank" rel="noopener noreferrer" class="btn">GitHub</a>` : ''}
          ${links.linkedin ? `<a href="${escapeHtml(links.linkedin)}" target="_blank" rel="noopener noreferrer" class="btn">LinkedIn</a>` : ''}
          ${links.twitter ? `<a href="${escapeHtml(links.twitter)}" target="_blank" rel="noopener noreferrer" class="btn">Twitter/X</a>` : ''}
          ${links.website ? `<a href="${escapeHtml(links.website)}" target="_blank" rel="noopener noreferrer" class="btn">Website</a>` : ''}
        </div>
      </section>

      ${sections.skills !== false && skills.length ? `
      <section id="skills">
        <h2 class="section-title"><span>Skills & Technologies</span></h2>
        <div class="skills-grid">
          ${skills.map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}
        </div>
      </section>
      ` : ''}

      ${sections.projects !== false && projects.length ? `
      <section id="projects">
        <h2 class="section-title"><span>Featured Projects</span></h2>
        <div class="projects-grid">
          ${projects.map((proj) => `
            <div class="project-card">
              <div>
                <h3>${escapeHtml(proj.name)}</h3>
                <p>${escapeHtml(proj.description)}</p>
                ${(proj.languages && proj.languages.length) ? `
                  <div class="project-tech">
                    ${proj.languages.map((l) => `<span>${escapeHtml(l)}</span>`).join('')}
                  </div>
                ` : ''}
              </div>
              <div class="links" style="margin-top: 1rem;">
                ${proj.repoUrl ? `<a href="${escapeHtml(proj.repoUrl)}" target="_blank" rel="noopener noreferrer" class="btn">View Code</a>` : ''}
                ${proj.liveUrl ? `<a href="${escapeHtml(proj.liveUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Live Demo</a>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </section>
      ` : ''}

      ${sections.experience !== false && experience.length ? `
      <section id="experience">
        <h2 class="section-title"><span>Experience</span></h2>
        ${experience.map((exp) => `
          <div class="timeline-item">
            <h4>${escapeHtml(exp.role || 'Software Engineer')}</h4>
            <div class="sub">${escapeHtml(exp.company || '')}</div>
            ${exp.period ? `<div class="date">${escapeHtml(exp.period)}</div>` : ''}
            ${exp.summary ? `<p>${escapeHtml(exp.summary)}</p>` : ''}
          </div>
        `).join('')}
      </section>
      ` : ''}

      ${sections.education !== false && education.length ? `
      <section id="education">
        <h2 class="section-title"><span>Education</span></h2>
        ${education.map((edu) => `
          <div class="timeline-item">
            <h4>${escapeHtml(edu.degree || 'Degree')}</h4>
            <div class="sub">${escapeHtml(edu.school || '')}</div>
            ${edu.period ? `<div class="date">${escapeHtml(edu.period)}</div>` : ''}
            ${edu.details ? `<p>${escapeHtml(edu.details)}</p>` : ''}
          </div>
        `).join('')}
      </section>
      ` : ''}

      ${sections.contact !== false ? `
      <section id="contact" class="hero-box" style="text-align: center;">
        <h2 class="section-title" style="justify-content: center;"><span>Let's Build Something Together</span></h2>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Have a project in mind or interested in collaborating? Feel free to reach out.</p>
        <div class="links" style="justify-content: center;">
          ${email ? `<a href="${mailtoHref}" class="btn btn-primary btn-send-email" data-email="${email}" data-name="${name}" data-slug="${escapeHtml(slug)}" target="_blank" rel="noopener noreferrer">Send Email</a>` : ''}
          <a href="${downloadUrl || '#'}" class="btn btn-download-portfolio" data-slug="${escapeHtml(slug)}" download="${slug || 'portfolio'}.zip">Download Portfolio</a>
          ${links.github ? `<a href="${escapeHtml(links.github)}" target="_blank" rel="noopener noreferrer" class="btn">GitHub</a>` : ''}
          ${links.linkedin ? `<a href="${escapeHtml(links.linkedin)}" target="_blank" rel="noopener noreferrer" class="btn">LinkedIn</a>` : ''}
        </div>
      </section>
      ` : ''}
    </main>

    <footer>
      <p>&copy; ${new Date().getFullYear()} ${name}. Powered by <a href="/" style="color: inherit;">DevHub</a>.</p>
    </footer>
  </div>
  ${scriptTag}
</body>
</html>
`;
}
