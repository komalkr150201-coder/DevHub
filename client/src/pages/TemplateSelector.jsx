import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Icon } from '../components/Icons';
import { Modal } from '../components/Modal';
import { portfolioAPI } from '../services/api';

export const TEMPLATE_DESIGNS = [
  {
    id: 'aurora',
    name: 'Aurora',
    badge: 'Glassmorphism',
    tone: 'violet',
    accent: '#6366f1',
    accent2: '#22d3ee',
    tagline: 'Modern Glassmorphism & Fluid Gradients',
    description: 'Deep cosmic dark background with luminous radial glows, rounded glass cards, smooth backdrop-filter blurs, and vibrant accent pills.',
    bestFor: 'Full-Stack Developers, Web & Cloud Engineers, Mobile Devs',
    features: [
      'Frosted glassmorphic card styling',
      'Ambient indigo and cyan radial glows',
      'Smooth pill navigation & rounded badges',
      'Modern sans-serif typography'
    ],
    previewBg: '#0b0f19',
    previewBorder: 'rgba(255, 255, 255, 0.1)',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    badge: 'Editorial Serif',
    tone: 'amber',
    accent: '#171717',
    accent2: '#404040',
    tagline: 'Editorial Serif & Crisp Swiss Geometry',
    description: 'High-contrast monochrome palette, sharp hairline borders, and classic serif typography inspired by elite editorial publications.',
    bestFor: 'Architects, Systems Researchers, Technical Writers, Senior Engineers',
    features: [
      'Editorial Georgia serif typography',
      'Distraction-free high-contrast layout',
      'Precision hairline dividers & sharp corners',
      'Ultra-clean, bookish aesthetic'
    ],
    previewBg: '#fafafa',
    previewBorder: '#e5e5e5',
  },
  {
    id: 'terminal',
    name: 'Terminal',
    badge: 'Monospace Hacker',
    tone: 'green',
    accent: '#39d353',
    accent2: '#58a6ff',
    tagline: 'Retro Hacker Shell & Monospace CLI',
    description: 'Command-line hacker aesthetic featuring monospace font, bash prompts ($ ls -la ./), dashed wireframe cards, and phosphor green highlights.',
    bestFor: 'DevOps, Systems Programmers, Backend Developers, Linux Hackers',
    features: [
      'Monospace terminal typography',
      'Interactive bash command prompt header',
      'Dashed ASCII-inspired wireframe borders',
      'Phosphor matrix green & cyber blue telemetry'
    ],
    previewBg: '#0d1117',
    previewBorder: '#30363d',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    badge: 'Neo-Brutalist Tech',
    tone: 'sky',
    accent: '#a855f7',
    accent2: '#06b6d4',
    tagline: 'High-Voltage Neon & Cyber Tech',
    description: 'Obsidian dark canvas with high-energy neon violet and electric cyan glows, angled accents, and futuristic developer badges.',
    bestFor: 'Creative Coders, Game Devs, Frontend Architects, Web3 Developers',
    features: [
      'Vibrant neon violet & cyan glows',
      'Angular cyber cards & sharp telemetry',
      'High-contrast glowing borders',
      'Futuristic developer badges & tech tags'
    ],
    previewBg: '#070913',
    previewBorder: 'rgba(168, 85, 247, 0.3)',
  },
];

/* Miniature styled mockup preview component */
function TemplateCardPreview({ t, sampleUser }) {
  const isMinimal = t.id === 'minimal';
  const isTerminal = t.id === 'terminal';
  const isCyberpunk = t.id === 'cyberpunk';
  const isAurora = t.id === 'aurora';

  return (
    <div
      style={{
        background: t.previewBg,
        border: `1px solid ${t.previewBorder}`,
        borderRadius: isMinimal ? 6 : isTerminal ? 4 : isCyberpunk ? 8 : 14,
        padding: '16px',
        color: isMinimal ? '#171717' : '#f1f5f9',
        fontFamily: isTerminal
          ? 'ui-monospace, SFMono-Regular, Menlo, monospace'
          : isMinimal
          ? 'Georgia, serif'
          : 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '260px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: isAurora
          ? '0 10px 25px -10px rgba(99, 102, 241, 0.3)'
          : isCyberpunk
          ? '0 0 20px -5px rgba(168, 85, 247, 0.4)'
          : 'none',
      }}
    >
      {/* Background Glow effects */}
      {isAurora && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-20px',
              left: '-20px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(34, 211, 238, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      {/* Mini Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '10px',
          borderBottom: isTerminal
            ? '1px dashed #30363d'
            : isMinimal
            ? '1px solid #e5e5e5'
            : isCyberpunk
            ? '1px solid rgba(168, 85, 247, 0.3)'
            : '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: isTerminal ? '#39d353' : isCyberpunk ? '#a855f7' : isMinimal ? '#171717' : '#c4b5fd',
          }}
        >
          {isTerminal ? '$ whoami' : sampleUser.name || 'Developer'}
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '10px', opacity: 0.7 }}>
          <span>About</span>
          <span>Projects</span>
          <span>Contact</span>
        </div>
      </div>

      {/* Mini Hero */}
      <div
        style={{
          background: isAurora
            ? 'rgba(255, 255, 255, 0.04)'
            : isTerminal
            ? '#161b22'
            : isCyberpunk
            ? '#0f172a'
            : '#ffffff',
          border: isAurora
            ? '1px solid rgba(255, 255, 255, 0.08)'
            : isTerminal
            ? '1px solid #30363d'
            : isCyberpunk
            ? '1px solid rgba(168, 85, 247, 0.25)'
            : '1px solid #e5e5e5',
          borderRadius: isMinimal ? 4 : isTerminal ? 3 : isCyberpunk ? 6 : 10,
          padding: '12px',
          marginBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: isMinimal ? '50%' : isTerminal ? '2px' : isCyberpunk ? '6px' : '8px',
              background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isMinimal ? '#fff' : '#000',
              fontWeight: 800,
              fontSize: '12px',
              border: isTerminal ? '1px solid #39d353' : 'none',
            }}
          >
            {sampleUser.name ? sampleUser.name[0] : 'D'}
          </div>
          <div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: isMinimal ? '#171717' : '#fff',
              }}
            >
              {sampleUser.name || 'Developer Name'}
            </div>
            <div
              style={{
                fontSize: '10px',
                color: t.accent2,
                fontWeight: 500,
              }}
            >
              Full-Stack Software Engineer
            </div>
          </div>
        </div>
        <p
          style={{
            fontSize: '9.5px',
            opacity: 0.75,
            lineHeight: 1.4,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          Specializing in scalable distributed systems, responsive full-stack web applications, and developer tools.
        </p>
      </div>

      {/* Mini Project Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div
          style={{
            background: isMinimal ? '#fff' : isTerminal ? '#161b22' : isCyberpunk ? '#0f172a' : 'rgba(255, 255, 255, 0.03)',
            border: isTerminal ? '1px dashed #30363d' : `1px solid ${t.previewBorder}`,
            borderRadius: isMinimal ? 3 : isTerminal ? 2 : 6,
            padding: '8px',
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: 700, marginBottom: '4px' }}>TrapTech</div>
          <div style={{ fontSize: '8.5px', opacity: 0.7 }}>Security shields</div>
          <span
            style={{
              display: 'inline-block',
              marginTop: '6px',
              fontSize: '8px',
              color: t.accent2,
              background: isMinimal ? '#f0f0f0' : 'rgba(255,255,255,0.06)',
              padding: '1px 5px',
              borderRadius: '3px',
            }}
          >
            React
          </span>
        </div>
        <div
          style={{
            background: isMinimal ? '#fff' : isTerminal ? '#161b22' : isCyberpunk ? '#0f172a' : 'rgba(255, 255, 255, 0.03)',
            border: isTerminal ? '1px dashed #30363d' : `1px solid ${t.previewBorder}`,
            borderRadius: isMinimal ? 3 : isTerminal ? 2 : 6,
            padding: '8px',
          }}
        >
          <div style={{ fontSize: '10px', fontWeight: 700, marginBottom: '4px' }}>SmartAI</div>
          <div style={{ fontSize: '8.5px', opacity: 0.7 }}>IoT telemetry</div>
          <span
            style={{
              display: 'inline-block',
              marginTop: '6px',
              fontSize: '8px',
              color: t.accent2,
              background: isMinimal ? '#f0f0f0' : 'rgba(255,255,255,0.06)',
              padding: '1px 5px',
              borderRadius: '3px',
            }}
          >
            Python
          </span>
        </div>
      </div>
    </div>
  );
}

export function TemplateSelector() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, toast } = useAuth();

  // Retrieve current selected template from navigation state, localStorage, or default
  const savedTemplate = localStorage.getItem('devhub_selected_template');
  const initialTemplate = location.state?.selectedTemplate || savedTemplate || 'aurora';

  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate);
  const [previewModal, setPreviewModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const returnTo = location.state?.returnTo || '/app/generator';

  const handleSelectTemplate = async (templateId) => {
    setSelectedTemplate(templateId);
    localStorage.setItem('devhub_selected_template', templateId);

    try {
      setSaving(true);
      // Attempt to save template to portfolio in background
      await portfolioAPI.update({ template: templateId }).catch(() => null);
      const chosen = TEMPLATE_DESIGNS.find((t) => t.id === templateId);
      toast(`Selected "${chosen?.name || templateId}" template design!`, 'success');

      // Return to generator or previous page with state
      navigate(returnTo, {
        state: {
          selectedTemplate: templateId,
          fromTemplates: true,
        },
      });
    } catch {
      navigate(returnTo, {
        state: {
          selectedTemplate: templateId,
          fromTemplates: true,
        },
      });
    } finally {
      setSaving(false);
    }
  };

  const currentTemplateObj = TEMPLATE_DESIGNS.find((t) => t.id === selectedTemplate) || TEMPLATE_DESIGNS[0];

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <Button
          variant="ghost"
          size="sm"
          icon="arrow"
          className="flip"
          onClick={() => navigate(returnTo, { state: { selectedTemplate } })}
        >
          Back to AI Studio
        </Button>
      </div>

      <PageHeader
        title="Choose Portfolio Template"
        text="Select the visual layout, color atmosphere, and typography in which AI generates your portfolio. Previews show live styles."
        actions={
          <div className="row gap" style={{ alignItems: 'center' }}>
            <span className="muted small">Current:</span>
            <Badge tone="violet">
              <Icon name="check" size={13} /> {currentTemplateObj.name}
            </Badge>
          </div>
        }
      />

      {/* Grid view of all template designs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '24px',
          alignItems: 'stretch',
        }}
      >
        {TEMPLATE_DESIGNS.map((t) => {
          const isSelected = selectedTemplate === t.id;

          return (
            <Card
              key={t.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderColor: isSelected ? 'var(--vio)' : undefined,
                boxShadow: isSelected ? '0 0 25px -5px rgba(124, 58, 237, 0.35)' : undefined,
                position: 'relative',
                transition: 'all 0.25s ease',
              }}
            >
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    zIndex: 2,
                  }}
                >
                  <Badge tone="green">
                    <Icon name="check" size={12} /> Active
                  </Badge>
                </div>
              )}

              <div className="stack" style={{ gap: '14px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: isSelected ? '70px' : '0' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '2px' }}>{t.name}</h3>
                    <span className="muted small">{t.tagline}</span>
                  </div>
                  <Badge tone={t.tone}>{t.badge}</Badge>
                </div>

                {/* Visual Mockup Preview */}
                <TemplateCardPreview t={t} sampleUser={profile} />

                {/* Description & Details */}
                <p className="muted small" style={{ lineHeight: 1.55 }}>
                  {t.description}
                </p>

                {/* Features List */}
                <div
                  style={{
                    background: 'var(--bg2)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    border: '1px solid var(--line)',
                  }}
                >
                  <strong style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--mut)', display: 'block', marginBottom: '6px' }}>
                    Key Characteristics
                  </strong>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '16px',
                      fontSize: '12.5px',
                      color: 'var(--ink)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    {t.features.map((feat, idx) => (
                      <li key={idx}>{feat}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                className="row between gap"
                style={{
                  marginTop: '18px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--line)',
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  icon="eye"
                  onClick={() => setPreviewModal(t)}
                >
                  Quick view
                </Button>

                <Button
                  variant={isSelected ? 'secondary' : 'primary'}
                  size="sm"
                  icon={isSelected ? 'check' : 'zap'}
                  loading={saving && selectedTemplate === t.id}
                  onClick={() => handleSelectTemplate(t.id)}
                >
                  {isSelected ? 'Selected (Use this)' : `Choose ${t.name}`}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick View Modal */}
      {previewModal && (
        <Modal
          title={`${previewModal.name} Template Preview`}
          onClose={() => setPreviewModal(null)}
        >
          <div className="stack" style={{ gap: '16px' }}>
            <div className="row between">
              <div>
                <strong>{previewModal.tagline}</strong>
                <p className="muted small">{previewModal.description}</p>
              </div>
              <Badge tone={previewModal.tone}>{previewModal.badge}</Badge>
            </div>

            <div style={{ transform: 'scale(1)', width: '100%' }}>
              <TemplateCardPreview t={previewModal} sampleUser={profile} />
            </div>

            <div
              style={{
                background: 'var(--card)',
                borderRadius: '12px',
                padding: '14px',
                border: '1px solid var(--line)',
              }}
            >
              <strong style={{ display: 'block', fontSize: '13px', marginBottom: '4px' }}>
                Recommended For:
              </strong>
              <p className="muted small">{previewModal.bestFor}</p>
            </div>

            <div className="row gap end" style={{ marginTop: '10px' }}>
              <Button variant="ghost" onClick={() => setPreviewModal(null)}>
                Close
              </Button>
              <Button
                icon="check"
                onClick={() => {
                  setPreviewModal(null);
                  handleSelectTemplate(previewModal.id);
                }}
              >
                Use {previewModal.name} Template
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export default TemplateSelector;
