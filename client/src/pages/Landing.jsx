import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { Icon } from '../components/Icons';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { MatchRing } from '../components/MatchRing';
import { SkillChip } from '../components/SkillChip';
import { PublicNav } from '../components/PublicNav';
import { Mascot } from '../components/Mascot';
import { REAL_WORLD_DEVELOPERS } from '../context/AuthContext';

const SPEECH_BUBBLES = [
  "Hi! Ready to team up?",
  "Peace! Let us ship it.",
  "Show your real GitHub repos.",
  "Find your dream team."
];

const FEATURES = [
  { icon: "github", title: "Connect GitHub in one click", text: "Import your real repositories, stars and languages automatically. No manual copying." },
  { icon: "briefcase", title: "Portfolio that builds itself", text: "Pin your best repositories, add custom projects and get a clean, shareable page." },
  { icon: "zap", title: "Skills extracted from real code", text: "Verified skills computed directly from your repository languages, commit recency, and topics." },
  { icon: "users", title: "Skill-based developer matching", text: "Find real-world developers whose stack overlaps with yours and see a match percentage instantly." },
  { icon: "mail", title: "Collaboration requests", text: "Send, accept or decline requests with a short project proposal so teams start with context." },
  { icon: "shield", title: "Privacy first", text: "Choose what is public: email, repositories, skill levels or your whole profile." }
];

const HOW_IT_WORKS = [
  { n: "01", title: "Connect GitHub", text: "Sign in with GitHub or enter your username to import your public repositories, languages and stars." },
  { n: "02", title: "Shape your portfolio", text: "Pin your best projects, verify your skills, and share one clean living developer profile." },
  { n: "03", title: "Find collaborators", text: "Search real developers, check skill overlap percentages, and collaborate on real open-source software." }
];

export function Landing() {
  const navigate = useNavigate();
  const [pose, setPose] = useState("wave");
  const [clickCount, setClickCount] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    const x = Math.round(((e.clientX - rect.left) / rect.width - 0.5) * 40) / 20;
    const y = Math.round(((e.clientY - rect.top) / rect.height - 0.5) * 40) / 20;
    setTilt((prev) => (prev.x === x && prev.y === y ? prev : { x, y }));
  };

  const handleMascotClick = () => {
    setPose((prev) => (prev === 'wave' ? 'peace' : 'wave'));
    setClickCount((prev) => prev + 1);
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sampleDevs = REAL_WORLD_DEVELOPERS.slice(0, 3);
  const sampleMatches = [96, 92, 88];

  return (
    <div className="land">
      {/* Background Ambience */}
      <div className="land-bg" aria-hidden="true">
        <i className="blob b1" />
        <i className="blob b2" />
        <i className="blob b3" />
        <i className="dots" />
        <div
          className="glyphs"
          style={{
            transform: `translate3d(${tilt.x * -14}px, ${tilt.y * -10}px, 0)`
          }}
        >
          <span className="gl a">&lt;/&gt;</span>
          <span className="gl b">{'{ }'}</span>
          <span className="gl c">git</span>
          <span className="gl d">=&gt;</span>
          <span className="gl e">#</span>
          <span className="gl f">PR</span>
        </div>
      </div>

      {/* Top Public Navigation */}
      <PublicNav>
        <button type="button" className="navlink" onClick={() => scrollTo('features')}>
          Features
        </button>
        <button type="button" className="navlink" onClick={() => scrollTo('how')}>
          How it works
        </button>
        <button type="button" className="navlink" onClick={() => scrollTo('developers')}>
          Developers
        </button>
      </PublicNav>

      {/* Hero Section */}
      <section
        className="hero"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      >
        <div className="hero-copy">
          <Badge tone="violet" icon="zap">
            Real GitHub Repositories · Living Developer Portfolios
          </Badge>

          <h1 className="hero-title">
            Turn your GitHub into a <span className="grad">portfolio</span> and find your next{' '}
            <span className="grad">team</span>.
          </h1>

          <p className="hero-lead">
            DevHub imports your real repositories, languages and skills, builds a shareable developer profile, and matches you with real-world developers whose stack fits your projects.
          </p>

          <div className="hero-actions">
            <Button size="lg" iconRight="arrow" onClick={() => navigate('/signup')}>
              Sign Up Free
            </Button>
            <Button
              size="lg"
              variant="secondary"
              icon="eye"
              onClick={() => navigate('/u/gaearon')}
            >
              See sample profile
            </Button>
          </div>

          <ul className="hero-stats">
            <li>
              <b>10k+</b>
              <span>Real Developers</span>
            </li>
            <li>
              <b>42k</b>
              <span>Repos Imported</span>
            </li>
            <li>
              <b>3.2k</b>
              <span>Teams Formed</span>
            </li>
          </ul>
        </div>

        {/* Hero Interactive Mascot */}
        <div className="hero-art">
          <div className="aura" aria-hidden="true" />

          <div
            className="bubble-wrap"
            style={{
              transform: `translate3d(${tilt.x * -8}px, ${tilt.y * -6}px, 0)`
            }}
          >
            <div className="bubble" aria-live="polite">
              {SPEECH_BUBBLES[clickCount % SPEECH_BUBBLES.length]}
            </div>
          </div>

          <button
            type="button"
            className="mascot-btn"
            aria-label="Tap the character to change her gesture"
            onClick={handleMascotClick}
            style={{
              transform: `translate3d(${tilt.x * 12}px, ${tilt.y * 8}px, 0)`
            }}
          >
            <Mascot pose={pose} />
          </button>

          <div className="sparks" aria-hidden="true">
            {[
              ["-60px", "-70px", "#fde047"],
              ["40px", "-80px", "#8b5cf6"],
              ["80px", "-20px", "#38bdf8"],
              ["-90px", "-10px", "#f472b6"],
              ["60px", "50px", "#fff"]
            ].map(([dx, dy, color], i) => (
              <span
                key={i}
                className={`spark ${clickCount ? 'run-' + (clickCount % 2 ? 'a' : 'b') : ''}`}
                style={{
                  '--dx': dx,
                  '--dy': dy,
                  '--c': color
                }}
              />
            ))}
          </div>

          {/* Floating Cards with Real Repos */}
          <div
            className="float-card fc1"
            style={{
              transform: `translate3d(${tilt.x * -16}px, ${tilt.y * -10}px, 0)`
            }}
          >
            <MatchRing percent={96} size={44} />
            <div>
              <strong>96% match</strong>
              <span>React · TypeScript · Redux</span>
            </div>
          </div>

          <div
            className="float-card fc2"
            style={{
              transform: `translate3d(${tilt.x * -10}px, ${tilt.y * -14}px, 0)`
            }}
          >
            <Icon name="star" size={18} />
            <div>
              <strong>60.8k stars</strong>
              <span>redux</span>
            </div>
          </div>

          <p className="hint">
            <i /> Tap her to change the gesture
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section">
        <p className="eyebrow">Features</p>
        <h2>Everything a developer needs to be discovered</h2>
        <div className="features-grid">
          {FEATURES.map((item) => (
            <article key={item.title} className="feature">
              <span className="feature-icon">
                <Icon name={item.icon} size={22} />
              </span>
              <h3>{item.title}</h3>
              <p className="muted">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how" className="section">
        <p className="eyebrow">How it works</p>
        <h2>From GitHub login to collaboration in three steps</h2>
        <div className="steps">
          {HOW_IT_WORKS.map((step) => (
            <article key={step.n} className="step-card">
              <span className="step-n">{step.n}</span>
              <h3>{step.title}</h3>
              <p className="muted">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Real Developers Preview Section */}
      <section id="developers" className="section">
        <p className="eyebrow">Skill-based matching</p>
        <h2>See who fits your stack, instantly</h2>
        <div className="preview-grid">
          {sampleDevs.map((dev, i) => (
            <article key={dev.id} className="card dev-mini">
              <div className="row gap">
                <img
                  src={dev.avatarUrl}
                  alt={dev.name}
                  style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div className="grow">
                  <strong>{dev.name}</strong>
                  <p className="muted small">{dev.role}</p>
                </div>
                <MatchRing percent={sampleMatches[i]} size={50} />
              </div>
              <div className="chips">
                {dev.skills.slice(0, 4).map((s) => (
                  <SkillChip key={s}>{s}</SkillChip>
                ))}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/u/${dev.username}`)}
              >
                View profile
              </Button>
            </article>
          ))}
        </div>
      </section>

      {/* CTA Band */}
      <section className="section cta-band">
        <div>
          <h2>Ready to show your real work?</h2>
          <p className="muted">Connect your real GitHub and have a verified public portfolio in under two minutes.</p>
        </div>
        <Button size="lg" icon="github" onClick={() => navigate('/signup')}>
          Sign Up with GitHub
        </Button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
        <p className="muted small">
          © 2026 DevHub. Built for developers who build together.
        </p>
        <div className="foot-links">
          <button type="button" className="navlink" onClick={() => scrollTo('features')}>
            Features
          </button>
          <button type="button" className="navlink" onClick={() => navigate('/login')}>
            Log in
          </button>
          <button type="button" className="navlink" onClick={() => navigate('/signup')}>
            Sign up
          </button>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
