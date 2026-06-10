import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/api';

const getFileUrl = (filePath) =>
  `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${filePath}`;

const AnswerAssignmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await api.get(`/homework/assignments/${id}`);
        setAssignment(response.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Impossible de charger le devoir.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  const submitPdfAssignment = async () => {
    const payload = new FormData();
    payload.append('content', submissionContent);

    if (submissionFile) {
      payload.append('file', submissionFile);
    }

    return api.post(`/homework/assignments/${assignment.id}/submit`, payload);
  };

  const submitQuestionnaireAssignment = async () => {
    const payload = {
      answers: assignment.questions.map((question) => ({
        question_id: question.id,
        answer_text: answers[question.id] || ''
      }))
    };

    return api.post(`/homework/assignments/${assignment.id}/submit`, payload);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const response =
        assignment.assignment_type === 'pdf'
          ? await submitPdfAssignment()
          : await submitQuestionnaireAssignment();

      setMessage('Soumission envoyee avec succes.');
      setTimeout(() => navigate(`/homework/${response.data.submission.id}`), 1000);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Impossible de soumettre le devoir.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="panel-card">Chargement du devoir...</div>;
  }

  if (error && !assignment) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (assignment.current_submission_id) {
    return (
      <div className="panel-card">
        <h3>{assignment.title}</h3>
        <p className="text-muted">
          Vous avez deja soumis ce devoir. Ouvrez votre soumission analysee ci-dessous.
        </p>
        <Link to={`/homework/${assignment.current_submission_id}`} className="btn btn-primary">
          Voir ma soumission
        </Link>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="panel-card">
        <div className="panel-card__header">
          <div>
            <h3>{assignment.title}</h3>
            <p className="text-muted mb-0">
              {assignment.subject} | {assignment.teacher_name}
            </p>
          </div>
          <span className="status-badge status-submitted">
            {assignment.assignment_type === 'pdf'
              ? 'Devoir PDF'
              : `${assignment.question_count} questions`}
          </span>
        </div>

        <div className="detail-section">
          <h4>Instructions</h4>
          <div className="content-box">
            {assignment.instructions || 'Lisez le devoir attentivement avant de soumettre.'}
          </div>
        </div>

        {assignment.assignment_type === 'pdf' && assignment.file_path && (
          <div className="assignment-download">
            <div>
              <h4>PDF du devoir</h4>
              <p className="text-muted mb-0">
                {assignment.file_name || 'Telechargez le fichier PDF du professeur.'}
              </p>
            </div>
            <a
              href={getFileUrl(assignment.file_path)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-primary"
            >
              Ouvrir le PDF
            </a>
          </div>
        )}

        <form className="questionnaire-form" onSubmit={handleSubmit}>
          {assignment.assignment_type === 'pdf' ? (
            <div className="questionnaire-card">
              <h4>Votre soumission</h4>
              <p className="text-muted">
                Envoyez une reponse PDF, une reponse texte, ou les deux. La soumission est envoyee a n8n pour la correction IA.
              </p>

              <div className="mb-3">
                <label className="form-label">Reponse texte</label>
                <textarea
                  rows="6"
                  className="form-control"
                  value={submissionContent}
                  onChange={(event) => setSubmissionContent(event.target.value)}
                  placeholder="Ecrivez votre reponse ici sans importer de PDF..."
                />
              </div>

              <div>
                <label className="form-label">Reponse PDF</label>
                <input
                  type="file"
                  className="form-control"
                  accept="application/pdf"
                  onChange={(event) => setSubmissionFile(event.target.files?.[0] || null)}
                />
              </div>
            </div>
          ) : (
            assignment.questions.map((question, index) => (
              <div key={question.id} className="questionnaire-card">
                <h4>Question {index + 1}</h4>
                <p>{question.question_text}</p>
                <textarea
                  rows="5"
                  className="form-control"
                  value={answers[question.id] || ''}
                  onChange={(event) => handleAnswerChange(question.id, event.target.value)}
                  placeholder="Ecrivez votre reponse ici..."
                />
              </div>
            ))
          )}

          {message && <div className="alert alert-success mb-0">{message}</div>}
          {error && <div className="alert alert-danger mb-0">{error}</div>}

          <div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Soumission...' : 'Soumettre le devoir'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default AnswerAssignmentPage;
