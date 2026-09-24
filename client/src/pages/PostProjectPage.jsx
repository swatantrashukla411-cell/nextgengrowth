import React, { useState } from 'react';
import API from '../api/client';

const initialForm = { title: '', description: '', budget: '', category: '', deadline: '', tags: '', questions: '' };

export function PostProjectPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      const response = await API.post('/api/brand/project', {
        title: form.title.trim(),
        description: form.description.trim(),
        budget: form.budget.trim(),
        category: form.category,
        deadline: form.deadline.trim(),
        tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 12),
        applicationQuestions: form.questions.split('\n').map((question) => question.trim()).filter(Boolean).slice(0, 8),
      });
      setNotice(response.data.message || 'Project posted. Students can apply now.');
      setForm(initialForm);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post this project. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section style={{ padding: 24 }}>
      <form className="card" onSubmit={submit} style={{ display: 'grid', gap: 16, maxWidth: 860 }}>
        <div>
          <div className="st">Post a student project</div>
          <p style={{ color: 'var(--ts)', marginTop: 6 }}>Write a clear brief with a budget and the skills you need.</p>
        </div>
        {error && <div role="alert" style={{ color: '#b91c1c' }}>{error}</div>}
        {notice && <div role="status" style={{ color: '#047857' }}>{notice}</div>}

        <label style={{ display: 'grid', gap: 6 }}>Project title
          <input required maxLength={160} value={form.title} onChange={(event) => update('title', event.target.value)} />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>Brief and deliverables
          <textarea required minLength={10} maxLength={5000} rows={7} value={form.description} onChange={(event) => update('description', event.target.value)} />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <label style={{ display: 'grid', gap: 6 }}>Budget
            <input required maxLength={60} placeholder="₹5,000" value={form.budget} onChange={(event) => update('budget', event.target.value)} />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>Category
            <select required value={form.category} onChange={(event) => update('category', event.target.value)}>
              <option value="">Choose a category</option>
              <option value="design">Design</option>
              <option value="video">Video editing</option>
              <option value="development">Development</option>
              <option value="writing">Writing and content</option>
              <option value="marketing">Marketing</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label style={{ display: 'grid', gap: 6 }}>Deadline
            <input maxLength={80} placeholder="Flexible or date" value={form.deadline} onChange={(event) => update('deadline', event.target.value)} />
          </label>
        </div>
        <label style={{ display: 'grid', gap: 6 }}>Skills or tags, separated by commas
          <input maxLength={500} value={form.tags} onChange={(event) => update('tags', event.target.value)} />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>Questions for applicants, one per line
          <textarea rows={4} maxLength={1200} value={form.questions} onChange={(event) => update('questions', event.target.value)} />
        </label>
        <button className="btn bpri" type="submit" disabled={submitting}>{submitting ? 'Posting…' : 'Post project'}</button>
      </form>
    </section>
  );
}

export default PostProjectPage;
