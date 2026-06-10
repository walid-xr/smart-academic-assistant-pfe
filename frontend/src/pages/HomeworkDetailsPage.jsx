import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { formatStatusLabel } from '../utils/labels';

const HomeworkDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submission, setSubmission] = useState(null);
  const [finalNote, setFinalNote] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await api.get(`/homework/${id}`);
        setSubmission(response.data);
        setFinalNote(response.data.final_note ?? response.data.score ?? '');
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Impossible de charger le devoir.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id]);

  const handleSaveReview = async () => {
    try {
      setSaving(true);
      setMessage('');
      setError('');

      if (submission.status === 'reviewed') {
        await api.put(`/analysis/${id}/final-note`, { final_note: finalNote });
      } else {
        await api.put(`/homework/${id}/review`, { final_note: finalNote });
      }

      const refreshed = await api.get(`/homework/${id}`);
      setSubmission(refreshed.data);
      setFinalNote(refreshed.data.final_note ?? refreshed.data.score ?? '');
      setMessage('Correction mise a jour avec succes.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Enregistrement de la correction impossible.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Voulez-vous supprimer ce devoir ?');

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/homework/${id}`);
      navigate('/homework');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Impossible de supprimer le devoir.');
    }
  };

  if (loading) {
    return <div className="panel-card">Chargement des details du devoir...</div>;
  }

  if (error && !submission) {
    return <div className="alert alert-danger">{error}</div>;
  }

  const missingQuestions = submission.missing_questions
    ? String(submission.missing_questions)
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="page-stack">
      <section className="detail-grid">
        <div className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>{submission.title}</h3>
              <p className="text-muted mb-0">
                {submission.subject} | {submission.student_name} |{' '}
                {new Date(submission.submission_date).toLocaleString()}
              </p>
            </div>
            <span className={`status-badge status-${submission.status}`}>
              {formatStatusLabel(submission.status)}
            </span>
          </div>

          {submission.submission_mode === 'questionnaire' && (
            <div className="detail-section">
              <h4>Contexte du devoir</h4>
              <div className="content-box">
                {submission.assignment_instructions ||
                  'Cet etudiant a repondu a un devoir structure directement dans la plateforme.'}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h4>
              {submission.submission_mode === 'questionnaire'
                ? 'Questions et reponses'
                : 'Contenu de la soumission'}
            </h4>

            {submission.submission_mode === 'questionnaire' &&
            Array.isArray(submission.structured_answers) &&
            submission.structured_answers.length > 0 ? (
              <div className="question-answer-list">
                {submission.structured_answers.map((answer, index) => (
                  <article
                    key={`${answer.question_id}-${index}`}
                    className="question-answer-card"
                  >
                    <h5>Question {answer.question_order || index + 1}</h5>
                    <p className="question-answer-card__question">{answer.question_text}</p>
                    <div className="content-box">
                      {answer.answer_text || 'Aucune reponse fournie pour cette question.'}
                    </div>
                  </article>
                ))}
              </div>
            ) : submission.content ? (
              <div className="content-box">{submission.content}</div>
            ) : (
              <p className="mb-0">Ce devoir a ete soumis sous forme de fichier PDF.</p>
            )}

            {submission.file_path && (
              <a
                href={`${
                  import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
                }${submission.file_path}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-secondary mt-3"
              >
                Ouvrir le PDF
              </a>
            )}
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-card__header">
            <h3>Resultat de l'analyse</h3>
            {user.role === 'student' && (
              <Link to={`/feedback/${submission.id}`} className="btn btn-sm btn-outline-primary">
                Voir le feedback
              </Link>
            )}
          </div>

          <div className="analysis-grid">
            <div className="mini-card">
              <span>Note</span>
              <strong>{submission.score ?? '-'}</strong>
            </div>
            <div className="mini-card">
              <span>Grammaire</span>
              <strong>{submission.grammar_score ?? '-'}</strong>
            </div>
            <div className="mini-card">
              <span>Structure</span>
              <strong>{submission.structure_score ?? '-'}</strong>
            </div>
            <div className="mini-card">
              <span>Contenu</span>
              <strong>{submission.content_score ?? '-'}</strong>
            </div>
          </div>

          <div className="detail-section">
            <h4>Feedback enseignant / IA</h4>
            <div className="content-box">{submission.feedback || 'Aucun feedback pour le moment.'}</div>
          </div>

          {submission.submission_mode === 'questionnaire' && (
            <div className="coverage-box">
              <div className="mini-card">
                <span>Questions repondues</span>
                <strong>
                  {submission.answered_questions_count ?? 0} /{' '}
                  {submission.total_questions_count ?? submission.structured_answers?.length ?? 0}
                </strong>
              </div>

              <div className="coverage-box__details">
                <h4>Verification de couverture</h4>
                {missingQuestions.length > 0 ? (
                  <ul className="mb-0">
                    {missingQuestions.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mb-0">
                    Toutes les questions semblent repondues selon la verification IA.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="cheating-box">
            <div className="mini-card">
              <span>Probabilite IA</span>
              <strong>{submission.ai_probability ?? 0}%</strong>
            </div>
            <div className="mini-card">
              <span>Plagiat</span>
              <strong>{submission.plagiarism_percentage ?? 0}%</strong>
            </div>
            <div className="mini-card">
              <span>Alerte</span>
              <strong>{Number(submission.cheating_flag) === 1 ? 'Oui' : 'Non'}</strong>
            </div>
          </div>

          {user.role === 'teacher' && (
            <div className="review-form mt-4">
              <h4>Correction enseignant</h4>
              <label className="form-label">Note finale /20</label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.5"
                className="form-control"
                value={finalNote}
                onChange={(event) => setFinalNote(event.target.value)}
              />

              {message && <div className="alert alert-success mt-3 mb-0">{message}</div>}
              {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}

              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-primary" onClick={handleSaveReview} disabled={saving}>
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button className="btn btn-outline-danger" onClick={handleDelete}>
                  Supprimer le devoir
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomeworkDetailsPage;
