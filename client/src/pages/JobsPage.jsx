import React, { useEffect, useState } from 'react';
import API from '../api/client';

const jobIdOf = (job) => String(job.id || job._id || '');

export function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [answers, setAnswers] = useState({});
  const [expandedId, setExpandedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadJobs() {
    setLoading(true);
    setError('');
    try {
      const [jobsResponse, statsResponse] = await Promise.all([
        API.get('/api/jobs'),
        API.get('/api/student/stats'),
      ]);
      setJobs(jobsResponse.data.jobs || []);
      const applications = statsResponse.data.applications || [];
      setAppliedIds(new Set(applications.map((application) => String(application.jobId))));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load open projects. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadJobs(); }, []);

  async function apply(job) {
    const id = jobIdOf(job);
    const questions = Array.isArray(job.applicationQuestions) ? job.applicationQuestions : [];
    const applicationAnswers = questions.map((question, index) => ({ question, answer: answers[id]?.[index] || '' }));
    if (applicationAnswers.some((answer) => !answer.answer.trim())) {
      setError('Answer each project question before you apply.');
      return;
    }

    setSubmittingId(id);
    setError('');
    setNotice('');
    try {
      const response = await API.post('/api/apply', { jobId: id, applicationAnswers });
      setAppliedIds((current) => new Set([...current, id]));
      setExpandedId('');
      setNotice(response.data.message || 'Application submitted.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit your application.');
    } finally {
      setSubmittingId('');
    }
  }

  return (
    <section style={{ padding: 24 }}>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="st">Open student projects</div>
        <p style={{ color: 'var(--ts)', marginTop: 6 }}>Review real briefs and apply with your profile and proof of work.</p>
      </div>
      {error && <div role="alert" className="card" style={{ marginBottom: 14, color: '#b91c1c' }}>{error}</div>}
      {notice && <div role="status" className="card" style={{ marginBottom: 14, color: '#047857' }}>{notice}</div>}
      {loading ? <div className="card">Loading open projects…</div> : jobs.length === 0 ? (
        <div className="card">There are no open projects right now. Check again soon.</div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {jobs.map((job) => {
            const id = jobIdOf(job);
            const questions = Array.isArray(job.applicationQuestions) ? job.applicationQuestions : [];
            const isApplied = appliedIds.has(id);
            const isExpanded = expandedId === id;
            return (
              <article className="card" key={id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div className="st">{job.title}</div>
                    <div style={{ color: 'var(--ts)', marginTop: 5 }}>{job.brand || 'Brand'} · {job.cat || 'Project'}</div>
                  </div>
                  <strong>{job.compensation || job.pay || 'Budget shared in brief'}</strong>
                </div>
                <p style={{ marginTop: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{job.description}</p>
                {job.tags?.length > 0 && <p style={{ color: 'var(--ts)', marginTop: 8 }}>Skills: {job.tags.join(', ')}</p>}
                <p style={{ color: 'var(--ts)', marginTop: 8 }}>Deadline: {job.days || 'Flexible'} · {job.applicantCount || 0} applications</p>

                {questions.length > 0 && isExpanded && (
                  <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                    {questions.map((question, index) => (
                      <label key={`${id}-${index}`} style={{ display: 'grid', gap: 6 }}>
                        <span>{question}</span>
                        <textarea required rows={3} value={answers[id]?.[index] || ''} onChange={(event) => setAnswers((current) => ({
                          ...current, [id]: { ...current[id], [index]: event.target.value },
                        }))} />
                      </label>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  {isApplied ? <span className="btn">Application submitted</span> : questions.length > 0 && !isExpanded ? (
                    <button className="btn bpri" onClick={() => { setError(''); setExpandedId(id); }}>Review application questions</button>
                  ) : (
                    <button className="btn bpri" disabled={submittingId === id} onClick={() => apply(job)}>
                      {submittingId === id ? 'Submitting…' : 'Submit application'}
                    </button>
                  )}
                  {isExpanded && <button className="btn" onClick={() => setExpandedId('')}>Cancel</button>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default JobsPage;
