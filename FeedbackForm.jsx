import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageSquareText, Save, Send, ShieldCheck, Star } from 'lucide-react';
import api, { getErrorMessage } from '../api.js';

// courseDuration is intentionally omitted from the form (not a required user-entered field).
// The backend defaults to 'Not specified' when it is absent.
const initialForm = { courseName: '', comments: '', rating: 0 };

export default function FeedbackForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  // Keep the original courseDuration when editing so we don't overwrite it.
  const [existingDuration, setExistingDuration] = useState('Not specified');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    api.get(`/feedback/${id}`)
      .then(({ data }) => {
        if (!active) return;
        setForm({
          courseName: data.courseName || '',
          comments: data.comments || '',
          rating: Number(data.rating) || 0,
        });
        setExistingDuration(data.courseDuration || 'Not specified');
      })
      .catch(err => { if (active) setError(getErrorMessage(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, isEdit]);

  function update(field, value) {
    setForm(current => ({ ...current, [field]: value }));
  }

  const errors = {
    courseName:
      form.courseName.trim().length < 2
        ? 'Enter a course name with at least 2 characters.'
        : form.courseName.trim().length > 100
        ? 'Course name must be 100 characters or fewer.'
        : '',
    comments:
      form.comments.trim().length < 5
        ? 'Comments must be at least 5 characters.'
        : form.comments.trim().length > 1000
        ? 'Comments must be 1000 characters or fewer.'
        : '',
    rating:
      form.rating < 1 || form.rating > 5
        ? 'Please select a rating from 1 to 5.'
        : '',
  };
  const valid = Object.values(errors).every(v => !v);

  async function handleSubmit(event) {
    event.preventDefault();
    setTouched(true);
    setError('');
    if (!valid) return;
    setSaving(true);
    try {
      const payload = {
        courseName: form.courseName.trim(),
        // Preserve the original duration when editing; use the default when creating.
        courseDuration: isEdit ? existingDuration : 'Not specified',
        comments: form.comments.trim(),
        rating: Number(form.rating),
      };
      if (isEdit) await api.put(`/feedback/${id}`, payload);
      else await api.post('/feedback', payload);
      navigate('/', { state: { saved: true } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="form-loading">
        <span className="spinner" />
        <span>Loading feedback details…</span>
      </div>
    );

  return (
    <div className="form-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>
      <div className="page-heading form-page-heading">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" />
            {isEdit ? 'EDIT RESPONSE' : 'NEW RESPONSE'}
          </div>
          <h1>
            {isEdit ? 'Update feedback' : 'Add feedback'}
            <span className="heading-period">.</span>
          </h1>
          <p className="page-subtitle">
            {isEdit
              ? 'Make changes to the submitted course feedback.'
              : "Capture a learner's experience and help every course get better."}
          </p>
        </div>
        <div className="form-heading-icon">
          <MessageSquareText size={25} />
        </div>
      </div>

      {error && <div className="notice error-notice">{error}</div>}

      <div className="form-layout">
        <form className="feedback-form-card" onSubmit={handleSubmit} noValidate>
          <div className="form-card-heading">
            <div className="form-card-icon">
              <MessageSquareText size={18} />
            </div>
            <div>
              <h2>Feedback details</h2>
              <p>
                Fields marked with <span className="required-star">*</span> are required.
              </p>
            </div>
          </div>
          <div className="form-divider" />

          {/* Course Name */}
          <div className="field-group">
            <label htmlFor="courseName">
              Course name <span className="required-star">*</span>
            </label>
            <input
              id="courseName"
              type="text"
              maxLength="100"
              placeholder="e.g. Full Stack Development"
              value={form.courseName}
              onChange={e => update('courseName', e.target.value)}
              onBlur={() => setTouched(true)}
              aria-invalid={Boolean(touched && errors.courseName)}
              aria-describedby={
                touched && errors.courseName ? 'courseName-error' : 'courseName-help'
              }
            />
            <div className="field-foot">
              <span
                id={touched && errors.courseName ? 'courseName-error' : 'courseName-help'}
                className={touched && errors.courseName ? 'field-error' : 'field-help'}
              >
                {touched && errors.courseName
                  ? errors.courseName
                  : 'Use the official course title.'}
              </span>
              <span>{form.courseName.length}/100</span>
            </div>
          </div>

          {/* Feedback Rating */}
          <div className="field-group">
            <label>
              Overall feedback rating <span className="required-star">*</span>
            </label>
            <div className="rating-picker" role="radiogroup" aria-label="Feedback rating">
              {[1, 2, 3, 4, 5].map(value => (
                <button
                  type="button"
                  key={value}
                  role="radio"
                  aria-checked={form.rating === value}
                  aria-label={`${value} ${value === 1 ? 'star' : 'stars'}`}
                  className={`rating-choice ${form.rating >= value ? 'selected' : ''}`}
                  onClick={() => update('rating', value)}
                >
                  <Star size={27} fill={form.rating >= value ? 'currentColor' : 'none'} />
                </button>
              ))}
              <span className={`rating-description ${form.rating ? 'has-rating' : ''}`}>
                {['', 'Needs improvement', 'Fair', 'Good', 'Very good', 'Excellent'][
                  form.rating
                ] || 'Select a rating'}
              </span>
            </div>
            {touched && errors.rating && (
              <span className="field-error">{errors.rating}</span>
            )}
          </div>

          {/* Feedback Comments */}
          <div className="field-group">
            <div className="label-with-count">
              <label htmlFor="comments">
                Feedback comments <span className="required-star">*</span>
              </label>
              <span>{form.comments.length}/1000</span>
            </div>
            <textarea
              id="comments"
              rows="5"
              maxLength="1000"
              placeholder="What worked well? What could be improved? Share specific, constructive feedback…"
              value={form.comments}
              onChange={e => update('comments', e.target.value)}
              onBlur={() => setTouched(true)}
              aria-invalid={Boolean(touched && errors.comments)}
            />
            <div className="field-foot">
              <span className={touched && errors.comments ? 'field-error' : 'field-help'}>
                {touched && errors.comments
                  ? errors.comments
                  : 'At least 5 characters. Thoughtful feedback makes a difference.'}
              </span>
            </div>
          </div>

          <div className="form-divider" />
          <div className="form-actions">
            <Link className="secondary-button" to="/">
              Cancel
            </Link>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? (
                <>
                  <span className="button-spinner" /> Saving…
                </>
              ) : isEdit ? (
                <>
                  <Save size={16} /> Save changes
                </>
              ) : (
                <>
                  <Send size={16} /> Submit feedback
                </>
              )}
            </button>
          </div>
        </form>

        <aside className="form-aside">
          <div className="aside-tip-card">
            <div className="tip-top">
              <div className="tip-icon">
                <Star size={18} />
              </div>
              <span className="tip-tag">WHY IT MATTERS</span>
            </div>
            <h3>Every voice shapes a better course.</h3>
            <p>
              Honest, constructive feedback helps educators understand what's working and
              where learners need more support.
            </p>
            <div className="tip-stars">
              {[1, 2, 3, 4, 5].map(n => (
                <Star key={n} size={15} fill="currentColor" />
              ))}
            </div>
            <span className="tip-caption">A little insight goes a long way.</span>
          </div>

          <div className="privacy-note">
            <div className="privacy-icon">
              <ShieldCheck size={18} />
            </div>
            <div>
              <strong>Thoughtful by design</strong>
              <p>
                Your feedback is stored securely in the connected database and helps track
                course experience over time.
              </p>
            </div>
          </div>

          <div className="rating-guide">
            <h4>RATING GUIDE</h4>
            {[
              ['5', 'Excellent', 'Exceptional experience'],
              ['4', 'Very good', 'Exceeded expectations'],
              ['3', 'Good', 'Met expectations'],
              ['2', 'Fair', 'Room to improve'],
              ['1', 'Needs improvement', 'Significant changes needed'],
            ].map(([n, title, desc]) => (
              <div className="guide-row" key={n}>
                <span className="guide-number">{n}</span>
                <span className="guide-copy">
                  <strong>{title}</strong>
                  <small>{desc}</small>
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
