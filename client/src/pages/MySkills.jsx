import React, { useState, useMemo } from 'react';
import { useAuth, SKILL_CATEGORIES, SUGGESTED_SKILLS } from '../context/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { Tabs } from '../components/Tabs';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { FormField } from '../components/FormField';
import { Icon } from '../components/Icons';

export const getProficiencyLabel = (level) => {
  if (level >= 85) return "Expert";
  if (level >= 65) return "Advanced";
  if (level >= 40) return "Intermediate";
  return "Beginner";
};

function SkillModalContent({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [category, setCategory] = useState(initial?.category || 'Frontend');
  const [level, setLevel] = useState(initial?.level ?? 60);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a skill name.');
      return;
    }
    onSave({
      name: name.trim(),
      category,
      level: Number(level)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <FormField label="Skill name" id="sk-name">
        <input
          id="sk-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          placeholder="e.g. GraphQL"
          autoFocus
        />
        {error && <p className="error small">{error}</p>}
      </FormField>

      <FormField label="Category" id="sk-cat">
        <select
          id="sk-cat"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {SKILL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label={`Proficiency: ${level}% (${getProficiencyLabel(level)})`}
        id="sk-level"
      >
        <input
          id="sk-level"
          type="range"
          min="10"
          max="100"
          step="5"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        />
      </FormField>

      <div className="row gap end">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initial ? 'Save changes' : 'Add skill'}
        </Button>
      </div>
    </form>
  );
}

export function MySkills() {
  const { skills, addSkill, updateSkill, removeSkill } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalState, setModalState] = useState(null); // { mode: 'add' } or { mode: 'edit', skill }
  const [deleteConfirmSkill, setDeleteConfirmSkill] = useState(null);

  const tabs = [
    { value: 'All', label: 'All', count: skills.length },
    ...SKILL_CATEGORIES.filter((cat) => skills.some((s) => s.category === cat)).map(
      (cat) => ({
        value: cat,
        label: cat,
        count: skills.filter((s) => s.category === cat).length
      })
    )
  ];

  const filteredSkills = useMemo(() => {
    return selectedCategory === 'All'
      ? skills
      : skills.filter((s) => s.category === selectedCategory);
  }, [skills, selectedCategory]);

  const availableSuggestions = SUGGESTED_SKILLS.filter(
    (sug) =>
      !skills.some((s) => s.name.toLowerCase() === sug.name.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="My Skills"
        text="Add, edit and manage the technologies you work with."
        actions={
          <Button icon="plus" onClick={() => setModalState({ mode: 'add' })}>
            Add skill
          </Button>
        }
      />

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        value={selectedCategory}
        onChange={setSelectedCategory}
      />

      {/* Skill Grid */}
      {filteredSkills.length === 0 ? (
        <EmptyState
          icon="zap"
          title="No skills in this category"
          text="Add your first skill to show it on your portfolio."
          action={
            <Button onClick={() => setModalState({ mode: 'add' })}>
              Add skill
            </Button>
          }
        />
      ) : (
        <div className="skill-grid">
          {filteredSkills.map((skill) => (
            <article key={skill.id} className="card skill-card">
              <div className="between">
                <h4>{skill.name}</h4>
                <Badge>{skill.category}</Badge>
              </div>

              <ProgressBar value={skill.level} />

              <div className="between small">
                <span className="muted">{getProficiencyLabel(skill.level)}</span>
                <b>{skill.level}%</b>
              </div>

              <div className="row gap">
                <Button
                  size="sm"
                  variant="secondary"
                  icon="edit"
                  onClick={() => setModalState({ mode: 'edit', skill })}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger-ghost"
                  icon="trash"
                  onClick={() => setDeleteConfirmSkill(skill)}
                >
                  Remove
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Suggested Skills */}
      {availableSuggestions.length > 0 && (
        <Card
          title="Suggested for you"
          subtitle="Popular skills among developers with a similar stack"
        >
          <div className="chips">
            {availableSuggestions.map((sug) => (
              <button
                key={sug.name}
                type="button"
                className="skill-chip suggest"
                onClick={() => addSkill({ ...sug, level: 50 })}
              >
                <Icon name="plus" size={12} /> {sug.name}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Add / Edit Skill Modal */}
      {modalState && (
        <Modal
          title={modalState.mode === 'add' ? 'Add a skill' : `Edit ${modalState.skill.name}`}
          width={460}
          onClose={() => setModalState(null)}
        >
          <SkillModalContent
            initial={modalState.skill}
            onCancel={() => setModalState(null)}
            onSave={(data) => {
              if (modalState.mode === 'add') {
                const ok = addSkill(data);
                if (ok) setModalState(null);
              } else {
                updateSkill(modalState.skill.id, data);
                setModalState(null);
              }
            }}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmSkill && (
        <Modal
          title="Remove skill?"
          width={420}
          onClose={() => setDeleteConfirmSkill(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteConfirmSkill(null)}>
                Keep it
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  removeSkill(deleteConfirmSkill.id);
                  setDeleteConfirmSkill(null);
                }}
              >
                Remove
              </Button>
            </>
          }
        >
          <p>
            Are you sure you want to remove <strong>{deleteConfirmSkill.name}</strong> from your profile?
          </p>
        </Modal>
      )}
    </>
  );
}

export default MySkills;
