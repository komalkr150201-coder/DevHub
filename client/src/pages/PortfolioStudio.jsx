import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { Badge } from '../components/Badge';
import { Icon } from '../components/Icons';
import { userAPI, portfolioAPI } from '../services/api';
import { TEMPLATE_DESIGNS } from './TemplateSelector';

const TEMPLATES = TEMPLATE_DESIGNS;
const SECTIONS = ['about', 'skills', 'projects', 'experience', 'education', 'contact'];
const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';

/* ---------- small helpers ---------- */
const Row = ({ children }) => <div className="form-grid">{children}</div>;
const Input = ({ value, onChange, ...p }) => (
  <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...p} />
);

function ListEditor({ items, onChange, fields, blank, addLabel }) {
  const set = (i, k, v) => onChange(items.map((it, n) => (n === i ? { ...it, [k]: v } : it)));
  return (
    <div className="stack">
      {items.map((it, i) => (
        <div key={i} className="gh-row" style={{ alignItems: 'stretch', flexDirection: 'column' }}>
          <Row>
            {fields.map(([k, label]) => (
              <FormField key={k} label={label} id={`${addLabel}-${i}-${k}`}>
                <Input id={`${addLabel}-${i}-${k}`} value={it[k]} onChange={(v) => set(i, k, v)} />
              </FormField>
            ))}
          </Row>
          <div className="row end">
            <Button variant="danger-ghost" size="sm" onClick={() => onChange(items.filter((_, n) => n !== i))}>
              Remove
            </Button>
          </div>
        </div>
      ))}
      <Button variant="secondary" size="sm" icon="plus" onClick={() => onChange([...items, { ...blank }])}>
        {addLabel}
      </Button>
    </div>
  );
}

/* ---------- Step 1: import wizard ---------- */
function ImportWizard({
  repos,
  onGenerate,
  busy,
  hasExisting,
  onCancel,
  currentTemplate,
  onTemplateChange,
}) {
  const navigate = useNavigate();
  const { toast } = useAuth();
  const [selected, setSelected] = useState([]);
  const [template, setTemplate] = useState(currentTemplate || 'aurora');
  const [extra, setExtra] = useState({ skills: '', education: [], experience: [], instruction: '' });
  const [fetchingBg, setFetchingBg] = useState(false);
  const [bgFetched, setBgFetched] = useState(false);

  useEffect(() => {
    if (currentTemplate && currentTemplate !== template) {
      setTemplate(currentTemplate);
    }
  }, [currentTemplate]);

  useEffect(() => {
    if (repos.length > 0 && selected.length === 0) {
      setSelected(repos.slice(0, Math.min(repos.length, 6)).map((r) => r._id));
    }
  }, [repos]);

  // Automatically fetch education, experience, and socials from GitHub
  const fetchGitHubBackground = useCallback(async (forced = false) => {
    setFetchingBg(true);
    try {
      const res = await portfolioAPI.getGitHubBackground(selected);
      if (res.data) {
        setExtra((prev) => ({
          ...prev,
          education: res.data.education?.length ? res.data.education : prev.education,
          experience: res.data.experience?.length ? res.data.experience : prev.experience,
          skills: prev.skills || (res.data.skills || []).join(', '),
          linkedin: res.data.linkedin || prev.linkedin,
          email: res.data.email || prev.email,
        }));
        setBgFetched(true);
        if (forced) {
          toast('Refreshed background & socials from GitHub!', 'success');
        }
      }
    } catch (e) {
      console.warn('Could not auto-fetch GitHub background:', e);
    } finally {
      setFetchingBg(false);
    }
  }, [selected, toast]);

  useEffect(() => {
    fetchGitHubBackground(false);
  }, [fetchGitHubBackground]);

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 8 ? s : [...s, id]));

  const selectAll = () => {
    if (selected.length === Math.min(repos.length, 8)) {
      setSelected([]);
    } else {
      setSelected(repos.slice(0, 8).map((r) => r._id));
    }
  };

  const activeTemplateObj = TEMPLATES.find((t) => t.id === template) || TEMPLATES[0];

  return (
    <div className="stack">
      <Card
        title="1. Choose repositories"
        subtitle="Select up to 8. The AI can only use what GitHub reports about these repos (languages, topics, README)."
        action={
          repos.length > 0 && (
            <Button size="sm" variant="ghost" onClick={selectAll}>
              {selected.length === Math.min(repos.length, 8) ? 'Deselect all' : 'Select all (up to 8)'}
            </Button>
          )
        }
      >
        {repos.length === 0 ? (
          <p className="muted">No repositories found. Sync from GitHub on the Repositories page first.</p>
        ) : (
          <div className="repo-grid">
            {repos.map((r) => (
              <label key={r._id} className={`repo-mini ${selected.includes(r._id) ? 'on' : ''}`} style={selected.includes(r._id) ? { borderColor: 'var(--vio)' } : null}>
                <span className="row between">
                  <h4 className="clamp1">{r.name}</h4>
                  <input type="checkbox" checked={selected.includes(r._id)} onChange={() => toggle(r._id)} aria-label={`Select ${r.name}`} />
                </span>
                <span className="muted small clamp2">{r.description || 'No description'}</span>
                <span className="muted small">
                  {(r.languages || [])
                    .slice(0, 3)
                    .map((l) => (typeof l === 'string' ? l : l?.name))
                    .filter(Boolean)
                    .join(' · ')}{' '}
                  {r.stars ? `· ★ ${r.stars}` : ''}
                </span>
              </label>
            ))}
          </div>
        )}
        <p className="muted small">{selected.length}/8 selected</p>
      </Card>

      <Card
        title="2. Education & Experience"
        subtitle="Automatically fetched from your GitHub profile, profile README, and repositories so you don't have to write them manually."
        action={
          <div className="row gap" style={{ alignItems: 'center' }}>
            {bgFetched && (
              <Badge tone="green">
                <Icon name="check" size={12} /> Auto-fetched from GitHub
              </Badge>
            )}
            <Button
              size="sm"
              variant="secondary"
              icon="sync"
              loading={fetchingBg}
              onClick={() => fetchGitHubBackground(true)}
            >
              Sync from GitHub
            </Button>
          </div>
        }
      >
        <FormField label="Extra skills (comma separated)" id="x-skills">
          <Input id="x-skills" value={extra.skills} onChange={(v) => setExtra({ ...extra, skills: v })} />
        </FormField>
        <div className="row between" style={{ alignItems: 'center', marginTop: '4px' }}>
          <h4>Education</h4>
          {fetchingBg && <span className="muted small">Fetching from GitHub…</span>}
        </div>
        <ListEditor items={extra.education} onChange={(education) => setExtra({ ...extra, education })} addLabel="Add education"
          blank={{ school: '', degree: '', period: '' }} fields={[['degree', 'Degree'], ['school', 'School'], ['period', 'Period']]} />
        <div className="row between" style={{ alignItems: 'center', marginTop: '10px' }}>
          <h4>Experience</h4>
          {fetchingBg && <span className="muted small">Fetching from GitHub…</span>}
        </div>
        <ListEditor items={extra.experience} onChange={(experience) => setExtra({ ...extra, experience })} addLabel="Add experience"
          blank={{ company: '', role: '', period: '', summary: '' }} fields={[['role', 'Role'], ['company', 'Company'], ['period', 'Period'], ['summary', 'Summary']]} />
        <FormField label="Tone / style guidance (optional)" id="x-ins" hint="Style only. It cannot add facts.">
          <Input id="x-ins" value={extra.instruction} maxLength={200} onChange={(v) => setExtra({ ...extra, instruction: v })} />
        </FormField>
      </Card>

      <Card
        title="3. Portfolio Template"
        subtitle="Choose the visual layout and style in which AI will generate your portfolio."
      >
        <div
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--line)',
            borderRadius: '14px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background:
                  template === 'terminal'
                    ? '#161b22'
                    : template === 'minimal'
                    ? '#ffffff'
                    : template === 'cyberpunk'
                    ? 'linear-gradient(135deg, #a855f7, #06b6d4)'
                    : 'linear-gradient(135deg, #6366f1, #22d3ee)',
                color: template === 'minimal' ? '#000' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                border: template === 'terminal' ? '1px solid #30363d' : 'none',
                boxShadow:
                  template === 'aurora'
                    ? '0 0 16px rgba(99, 102, 241, 0.4)'
                    : template === 'cyberpunk'
                    ? '0 0 16px rgba(168, 85, 247, 0.5)'
                    : 'none',
              }}
            >
              {template === 'terminal' ? '>_' : template === 'minimal' ? 'Aa' : '✨'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '1.05rem', color: 'var(--ink)' }}>
                  {activeTemplateObj.name}
                </strong>
                <Badge tone={activeTemplateObj.tone || 'violet'}>Selected Design</Badge>
              </div>
              <span className="muted small">
                {activeTemplateObj.tagline || activeTemplateObj.description}
              </span>
            </div>
          </div>

          <Button
            variant="secondary"
            icon="grid"
            onClick={() =>
              navigate('/app/templates', {
                state: {
                  returnTo: '/app/generator',
                  selectedTemplate: template,
                },
              })
            }
          >
            Change template
          </Button>
        </div>
      </Card>

      <div className="row gap end">
        {hasExisting && <Button variant="ghost" onClick={onCancel}>Back to editor</Button>}
        <Button
          icon="zap"
          loading={busy}
          disabled={!selected.length}
          onClick={() =>
            onGenerate({
              repoIds: selected,
              template,
              instruction: extra.instruction,
              userInfo: {
                skills: extra.skills.split(',').map((s) => s.trim()).filter(Boolean),
                education: extra.education,
                experience: extra.experience,
                linkedin: extra.linkedin,
                email: extra.email,
              },
            })
          }
        >
          {busy ? 'Generating with Gemini…' : 'Generate portfolio'}
        </Button>
      </div>
      {hasExisting && <p className="muted small">Generating again replaces headline, bio, skills and projects. Your previous version is kept in history.</p>}
    </div>
  );
}

/* ---------- Live preview ---------- */
function Preview({ draft }) {
  const [html, setHtml] = useState('');
  const [width, setWidth] = useState('100%');
  const [err, setErr] = useState('');
  const timer = useRef();
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const res = await portfolioAPI.preview(draft);
        setHtml(res.data.html);
        setErr('');
      } catch (e) {
        setErr(errMsg(e));
      }
    }, 450);
    return () => clearTimeout(timer.current);
  }, [draft]);
  return (
    <Card title="Live preview" action={
      <div className="row gap">
        {[['100%', 'Desktop'], ['768px', 'Tablet'], ['390px', 'Mobile']].map(([w, l]) => (
          <button key={w} type="button" className={`tab ${width === w ? 'active' : ''}`} onClick={() => setWidth(w)}>{l}</button>
        ))}
      </div>
    }>
      {err && <p className="error small">{err}</p>}
      <div style={{ background: '#05060c', borderRadius: 12, overflow: 'auto', display: 'flex', justifyContent: 'center', minHeight: 450, alignItems: 'center' }}>
        {!html && !err ? (
          <p className="muted small">Generating live preview…</p>
        ) : (
          <iframe
            title="Portfolio preview"
            sandbox="allow-scripts allow-popups allow-forms allow-same-origin allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
            srcDoc={html}
            style={{ width, maxWidth: '100%', height: 640, border: 0, background: '#0b0d14' }}
          />
        )}
      </div>
    </Card>
  );
}

/* ---------- Editor ---------- */
function Editor({ portfolio, setPortfolio, toast, onRegenerateAll }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(portfolio);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState('content');
  const [saving, setSaving] = useState(false);
  const [busyKey, setBusyKey] = useState('');
  const [slug, setSlug] = useState(portfolio.slug || '');
  const [slugInfo, setSlugInfo] = useState(null);
  const [versions, setVersions] = useState([]);

  useEffect(() => { setDraft(portfolio); setDirty(false); }, [portfolio]);
  const change = (patch) => { setDraft((d) => ({ ...d, ...patch })); setDirty(true); };
  const setProfile = (k, v) => change({ profile: { ...draft.profile, [k]: v } });
  const setLink = (k, v) => change({ profile: { ...draft.profile, links: { ...draft.profile.links, [k]: v } } });
  const editable = useMemo(() => ({
    template: draft.template, theme: draft.theme, sections: draft.sections, profile: draft.profile,
    skills: draft.skills, projects: draft.projects, education: draft.education, experience: draft.experience,
  }), [draft]);

  const run = async (key, fn, okMsg) => {
    setBusyKey(key);
    try { const r = await fn(); if (okMsg) toast(okMsg, 'success'); return r; }
    catch (e) { toast(errMsg(e), 'error'); }
    finally { setBusyKey(''); }
  };
  const save = () => run('save', async () => {
    setSaving(true);
    try { const r = await portfolioAPI.update(editable); setPortfolio(r.data.portfolio); }
    finally { setSaving(false); }
  }, 'Portfolio saved');
  const regen = (section, projectName) => run(`r-${section}-${projectName || ''}`, async () => {
    if (dirty) await portfolioAPI.update(editable); // regenerate from the latest saved state
    const r = await portfolioAPI.regenerate({ section, projectName });
    setPortfolio(r.data.portfolio);
  }, 'Regenerated');
  const download = () => run('zip', async () => {
    if (dirty) await portfolioAPI.update(editable);
    const r = await portfolioAPI.exportZip();
    const url = URL.createObjectURL(r.data);
    const a = document.createElement('a');
    a.href = url; a.download = `${draft.slug || 'portfolio'}.zip`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }, 'ZIP downloaded');
  const checkSlug = async () => { try { setSlugInfo((await portfolioAPI.checkSlug(slug)).data); } catch (e) { toast(errMsg(e), 'error'); } };
  const publish = () => run('pub', async () => {
    if (dirty) await portfolioAPI.update(editable);
    const r = await portfolioAPI.publish(slug); setPortfolio(r.data.portfolio);
  }, 'Published');
  const unpublish = () => run('unpub', async () => { const r = await portfolioAPI.unpublish(); setPortfolio(r.data.portfolio); }, 'Unpublished');
  const loadVersions = () => run('ver', async () => setVersions((await portfolioAPI.versions()).data.versions));
  const restore = (id) => run('restore', async () => { const r = await portfolioAPI.restore(id); setPortfolio(r.data.portfolio); }, 'Version restored');

  // Handle Send Email and Download clicks from the live preview iframe
  useEffect(() => {
    const handleFrameMessage = (e) => {
      if (e.data?.type === 'DEVHUB_SEND_EMAIL' && e.data.href) {
        let cleanHref = e.data.href;
        let cleanUrl = e.data.url || '';
        const currentOrigin = window.location.origin;

        // Strip about:// or invalid protocols from href and url
        if (cleanHref.includes('about://')) {
          cleanHref = cleanHref.replace(/about:\/\/[^/]+/g, currentOrigin);
        }
        if (cleanUrl.includes('about://')) {
          cleanUrl = cleanUrl.replace(/about:\/\/[^/]+/g, currentOrigin);
        }

        // When running on a public deployed domain (e.g. Vercel), ensure local network IPs are mapped to current domain
        if (!window.location.hostname.includes('localhost') && window.location.hostname !== '127.0.0.1') {
          cleanHref = cleanHref.replace(/https?:\/\/192\.168\.[0-9.]+(:\d+)?/g, currentOrigin);
          cleanHref = cleanHref.replace(/https?:\/\/10\.[0-9.]+(:\d+)?/g, currentOrigin);
          cleanHref = cleanHref.replace(/https?:\/\/172\.(1[6-9]|2\d|3[01])\.[0-9.]+(:\d+)?/g, currentOrigin);
          cleanHref = cleanHref.replace(/https?:\/\/localhost(:\d+)?/g, currentOrigin);

          cleanUrl = cleanUrl.replace(/https?:\/\/192\.168\.[0-9.]+(:\d+)?/g, currentOrigin);
          cleanUrl = cleanUrl.replace(/https?:\/\/10\.[0-9.]+(:\d+)?/g, currentOrigin);
          cleanUrl = cleanUrl.replace(/https?:\/\/172\.(1[6-9]|2\d|3[01])\.[0-9.]+(:\d+)?/g, currentOrigin);
          cleanUrl = cleanUrl.replace(/https?:\/\/localhost(:\d+)?/g, currentOrigin);
        }

        if (cleanUrl) {
          navigator.clipboard?.writeText?.(cleanUrl).catch(() => {});
        }
        window.location.href = cleanHref;
        toast('Opening email client with your portfolio link...', 'success');
      } else if (e.data?.type === 'DEVHUB_DOWNLOAD_PORTFOLIO') {
        download();
      }
    };
    window.addEventListener('message', handleFrameMessage);
    return () => window.removeEventListener('message', handleFrameMessage);
  }, [toast, download]);

  const [syncingSocials, setSyncingSocials] = useState(false);
  const syncSocials = () => run('sync-soc', async () => {
    setSyncingSocials(true);
    try {
      const res = await portfolioAPI.getGitHubBackground([]);
      let updated = false;
      const newProfile = { ...draft.profile, links: { ...draft.profile.links } };
      if (res.data?.email && (!newProfile.email || newProfile.email.includes('devhub.dev') || newProfile.email.includes('example.com'))) {
        newProfile.email = res.data.email;
        updated = true;
      }
      if (res.data?.linkedin && !newProfile.links.linkedin) {
        newProfile.links.linkedin = res.data.linkedin;
        updated = true;
      }
      if (updated) {
        change({ profile: newProfile });
      }
      return res;
    } finally {
      setSyncingSocials(false);
    }
  }, 'Social links auto-fetched');

  const RegenBtn = ({ section, name }) => (
    <Button size="sm" variant="secondary" icon="zap" loading={busyKey === `r-${section}-${name || ''}`} onClick={() => regen(section, name)}>
      Regenerate
    </Button>
  );
  const p = draft.profile;
  const tabs = [['content', 'Content'], ['projects', 'Projects'], ['background', 'Experience & education'], ['design', 'Design'], ['publish', 'Publish & export']];

  return (
    <div className="stack">
      <div className="row between wrap gap">
        <div className="tabs" role="tablist">
          {tabs.map(([id, l]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => { setTab(id); if (id === 'publish') loadVersions(); }}>{l}</button>
          ))}
        </div>
        <div className="row gap">
          {dirty && <Badge tone="amber">Unsaved changes</Badge>}
          <Button variant="ghost" size="sm" onClick={onRegenerateAll}>Re-import repos</Button>
          <Button size="sm" icon="check" loading={saving} disabled={!dirty} onClick={save}>Save</Button>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="stack">
          {tab === 'content' && (
            <Card title="Profile">
              <Row>
                <FormField label="Name" id="p-name"><Input id="p-name" value={p.name} onChange={(v) => setProfile('name', v)} /></FormField>
                <FormField label="Location" id="p-loc"><Input id="p-loc" value={p.location} onChange={(v) => setProfile('location', v)} /></FormField>
              </Row>
              <FormField label="Headline" id="p-head"><Input id="p-head" value={p.headline} maxLength={160} onChange={(v) => setProfile('headline', v)} /></FormField>
              <div className="row end"><RegenBtn section="headline" /></div>
              <FormField label="About me" id="p-bio"><textarea id="p-bio" rows={6} maxLength={1200} value={p.bio} onChange={(e) => setProfile('bio', e.target.value)} /></FormField>
              <div className="row end"><RegenBtn section="bio" /></div>
              <FormField label="Skills (comma separated)" id="p-skills" hint="Regenerated skills only include technologies found in your repos.">
                <Input id="p-skills" value={draft.skills.join(', ')} onChange={(v) => change({ skills: v.split(',').map((s) => s.trim()).filter(Boolean) })} />
              </FormField>
              <div className="row end"><RegenBtn section="skills" /></div>
              <div className="row between" style={{ alignItems: 'center', marginTop: '16px', marginBottom: '8px' }}>
                <h4 style={{ margin: 0 }}>Contact & social</h4>
                <Button size="sm" variant="secondary" icon="sync" loading={syncingSocials} onClick={syncSocials}>
                  Auto-fetch socials
                </Button>
              </div>
              <Row>
                <FormField label="Email" id="p-mail"><Input id="p-mail" type="email" value={p.email} onChange={(v) => setProfile('email', v)} /></FormField>
                <FormField label="Website" id="p-web"><Input id="p-web" value={p.links.website} onChange={(v) => setLink('website', v)} /></FormField>
                <FormField label="GitHub" id="p-gh"><Input id="p-gh" value={p.links.github} onChange={(v) => setLink('github', v)} /></FormField>
                <FormField label="LinkedIn" id="p-li"><Input id="p-li" value={p.links.linkedin} onChange={(v) => setLink('linkedin', v)} /></FormField>
                <FormField label="Twitter / X" id="p-tw"><Input id="p-tw" value={p.links.twitter} onChange={(v) => setLink('twitter', v)} /></FormField>
              </Row>
            </Card>
          )}

          {tab === 'projects' && (
            <Card title="Projects" subtitle="Toggle visibility, edit text, or regenerate a single description.">
              {draft.projects.length === 0 && <p className="muted">No projects yet. Use “Re-import repos”.</p>}
              {draft.projects.map((pr, i) => {
                const set = (k, v) => change({ projects: draft.projects.map((x, n) => (n === i ? { ...x, [k]: v } : x)) });
                return (
                  <div key={pr._id || i} className="gh-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div className="row between"><strong>{pr.name}</strong>
                      <div className="row gap">
                        <RegenBtn section="projects" name={pr.name} />
                        <label className="check"><input type="checkbox" checked={pr.visible} onChange={(e) => set('visible', e.target.checked)} /> Show</label>
                      </div>
                    </div>
                    <textarea rows={3} maxLength={600} value={pr.description} onChange={(e) => set('description', e.target.value)} aria-label={`${pr.name} description`} />
                    <Input value={pr.liveUrl} placeholder="Live demo URL (optional)" onChange={(v) => set('liveUrl', v)} aria-label={`${pr.name} live URL`} />
                  </div>
                );
              })}
            </Card>
          )}

          {tab === 'background' && (
            <Card title="Experience & education" subtitle="Only what you type here appears on your site.">
              <h4>Experience</h4>
              <ListEditor items={draft.experience} onChange={(experience) => change({ experience })} addLabel="Add experience"
                blank={{ company: '', role: '', period: '', summary: '' }} fields={[['role', 'Role'], ['company', 'Company'], ['period', 'Period'], ['summary', 'Summary']]} />
              <h4>Education</h4>
              <ListEditor items={draft.education} onChange={(education) => change({ education })} addLabel="Add education"
                blank={{ school: '', degree: '', period: '' }} fields={[['degree', 'Degree'], ['school', 'School'], ['period', 'Period']]} />
            </Card>
          )}

          {tab === 'design' && (
            <Card
              title="Design"
              subtitle="Template design, accent colors, and visible sections."
              action={
                <Button
                  size="sm"
                  variant="secondary"
                  icon="grid"
                  onClick={() =>
                    navigate('/app/templates', {
                      state: {
                        returnTo: '/app/generator',
                        selectedTemplate: draft.template,
                      },
                    })
                  }
                >
                  Change template
                </Button>
              }
            >
              <div
                style={{
                  background: 'var(--bg2)',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '14px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '1rem' }}>
                      Current Template: {TEMPLATES.find((t) => t.id === draft.template)?.name || draft.template}
                    </strong>
                    <Badge tone="violet">Active</Badge>
                  </div>
                  <span className="muted small">
                    {TEMPLATES.find((t) => t.id === draft.template)?.tagline || 'Explore all designs in grid view.'}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  icon="grid"
                  onClick={() =>
                    navigate('/app/templates', {
                      state: {
                        returnTo: '/app/generator',
                        selectedTemplate: draft.template,
                      },
                    })
                  }
                >
                  Change template
                </Button>
              </div>

              <Row>
                <FormField label="Accent colour" id="c1"><input id="c1" type="color" value={draft.theme.accent} onChange={(e) => change({ theme: { ...draft.theme, accent: e.target.value } })} /></FormField>
                <FormField label="Secondary accent" id="c2"><input id="c2" type="color" value={draft.theme.accent2} onChange={(e) => change({ theme: { ...draft.theme, accent2: e.target.value } })} /></FormField>
              </Row>
              <div className="toggles">
                {SECTIONS.map((s) => (
                  <ToggleSwitch key={s} id={`sec-${s}`} label={s[0].toUpperCase() + s.slice(1)} checked={draft.sections[s] !== false}
                    onChange={(v) => change({ sections: { ...draft.sections, [s]: v } })} />
                ))}
              </div>
            </Card>
          )}

          {tab === 'publish' && (
            <>
              <Card title="Publish" subtitle="Your public site lives at /u/your-url.">
                <div className="input-group">
                  <Input value={slug} onChange={(v) => { setSlug(v.toLowerCase()); setSlugInfo(null); }} placeholder="your-url" aria-label="Public URL slug" />
                  <Button variant="secondary" onClick={checkSlug}>Check</Button>
                </div>
                {slugInfo && <p className={slugInfo.available ? 'small' : 'error small'}>{slugInfo.available ? `“${slugInfo.slug}” is available` : slugInfo.reason}</p>}
                <div className="row gap wrap">
                  <Button icon="globe" loading={busyKey === 'pub'} onClick={publish}>{portfolio.status === 'published' ? 'Update published site' : 'Publish'}</Button>
                  {portfolio.status === 'published' && <Button variant="danger-ghost" loading={busyKey === 'unpub'} onClick={unpublish}>Unpublish</Button>}
                </div>
                {portfolio.publicUrl && (() => {
                  const resolvedUrl = (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1') && (portfolio.publicUrl.includes('192.168.') || portfolio.publicUrl.includes('localhost')))
                    ? `${window.location.origin}/u/${portfolio.slug || slug || ''}`
                    : portfolio.publicUrl;
                  return (
                    <p className="small">Live: <a className="link" href={resolvedUrl} target="_blank" rel="noopener noreferrer">{resolvedUrl}</a></p>
                  );
                })()}
              </Card>
              <Card title="Download source" subtitle="index.html, CSS, JavaScript, assets/ and a README with deployment steps.">
                <Button icon="download" loading={busyKey === 'zip'} onClick={download}>Download ZIP</Button>
              </Card>
              <Card title="Version history" subtitle={`Last ${versions.length} changes`}>
                {versions.length === 0 ? <p className="muted small">No history yet.</p> : (
                  <ul className="list">
                    {versions.slice(0, 8).map((v) => (
                      <li key={v.id} className="list-row between">
                        <span className="small">{new Date(v.at).toLocaleString()} <span className="muted">· {v.reason}</span></span>
                        <Button size="sm" variant="ghost" onClick={() => restore(v.id)}>Restore</Button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </>
          )}
        </div>
        <Preview draft={editable} />
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export function PortfolioStudio() {
  const { toast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [repos, setRepos] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [wizard, setWizard] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  // Template chosen from /app/templates or remembered
  const [selectedTemplate, setSelectedTemplate] = useState(
    location.state?.selectedTemplate || localStorage.getItem('devhub_selected_template') || 'aurora'
  );

  useEffect(() => {
    if (location.state?.selectedTemplate) {
      setSelectedTemplate(location.state.selectedTemplate);
      localStorage.setItem('devhub_selected_template', location.state.selectedTemplate);
    }
  }, [location.state?.selectedTemplate]);

  const load = useCallback(async () => {
    try {
      const [me, pf] = await Promise.all([userAPI.getMe(), portfolioAPI.get()]);
      setRepos((me.data.repos || []).filter((r) => !r.isHidden));
      const p = pf.data.portfolio;
      const u = me.data?.user || {};

      // Auto-fetch and fill email and linkedin if missing
      if (p?.profile) {
        if (!p.profile.email && u.email) {
          p.profile.email = u.email;
        }
        if (!p.profile.links) p.profile.links = {};
        if (!p.profile.links.github && u.username) {
          p.profile.links.github = u.links?.github || `https://github.com/${u.username}`;
        }
        if (!p.profile.links.linkedin) {
          p.profile.links.linkedin = u.links?.linkedin || (u.username ? `https://www.linkedin.com/in/${u.username}` : '');
        }
      }
      if (location.state?.selectedTemplate && p) {
        p.template = location.state.selectedTemplate;
      } else if (p?.template) {
        setSelectedTemplate(p.template);
      }
      setPortfolio(p);
      setWizard(!p.generatedFrom?.at);
    } catch (e) { toast(errMsg(e), 'error'); }
    finally { setLoading(false); }
  }, [toast, location.state?.selectedTemplate]);
  useEffect(() => { load(); }, [load]);

  const generate = async (payload) => {
    setBusy(true);
    try {
      const r = await portfolioAPI.generate(payload);
      setPortfolio(r.data.portfolio);
      setWizard(false);
      toast('Portfolio generated. Review and edit before publishing.', 'success');
    } catch (e) { toast(errMsg(e), 'error'); }
    finally { setBusy(false); }
  };

  if (loading) return <p className="muted">Loading…</p>;
  const hasExisting = !!portfolio?.generatedFrom?.at;
  return (
    <>
      <PageHeader
        title="AI Portfolio Generator"
        text="Turn your GitHub projects into a professional website. Content is generated only from your repository data and what you provide."
        actions={portfolio?.status === 'published' && <Badge tone="green"><Icon name="globe" size={12} /> Published</Badge>}
      />
      {wizard || !portfolio ? (
        <ImportWizard
          repos={repos}
          onGenerate={generate}
          busy={busy}
          hasExisting={hasExisting}
          onCancel={() => setWizard(false)}
          currentTemplate={selectedTemplate}
          onTemplateChange={setSelectedTemplate}
        />
      ) : (
        <Editor portfolio={portfolio} setPortfolio={setPortfolio} toast={toast} onRegenerateAll={() => setWizard(true)} />
      )}
    </>
  );
}

export default PortfolioStudio;
