import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/api';
import { formatStatusLabel } from '../utils/labels';

const FeedbackPage = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const response = await api.get(`/homework/${id}`);
        setSubmission(response.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Impossible de charger le feedback.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id]);

  if (loading) {
    return <div className="panel-card">Chargement du feedback...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="page-stack">
      <section className="feedback-layout">
        <div className="panel-card">
          <p className="eyebrow-text">Feedback du devoir</p>
          <h3>{submission.title}</h3>
          <p className="text-muted">
            Matiere : {submission.subject} - Statut : {formatStatusLabel(submission.status)}
          </p>

          <div className="analysis-grid">
            <div className="mini-card">
              <span>Note IA</span>
              <strong>{submission.score ?? '-'}/20</strong>
            </div>
            <div className="mini-card">
              <span>Note finale</span>
              <strong>{submission.final_note ?? '-'}/20</strong>
            </div>
            <div className="mini-card">
              <span>Corrige</span>
              <strong>{Number(submission.reviewed_by_teacher) === 1 ? 'Oui' : 'Non'}</strong>
            </div>
          </div>

          <div className="detail-section mt-4">
            <h4>Feedback principal</h4>
            <div className="content-box">{submission.feedback || 'Le feedback est encore indisponible.'}</div>
          </div>
        </div>

        <div className="panel-card">
          <h3>Evaluation detaillee</h3>
          <div className="status-grid mt-3">
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

          <div className="detail-section mt-4">
            <h4>Indicateurs de triche</h4>
            <p className="mb-2">Probabilite IA : {submission.ai_probability ?? 0}%</p>
            <p className="mb-2">
              Pourcentage de plagiat : {submission.plagiarism_percentage ?? 0}%
            </p>
            <p className="mb-0">
              Statut : {Number(submission.cheating_flag) === 1 ? 'Signale pour verification' : 'Aucun probleme serieux detecte'}
            </p>
          </div>

          <Link to={`/homework/${submission.id}`} className="btn btn-outline-primary mt-4">
            Retour aux details
          </Link>
        </div>
      </section>
    </div>
  );
};

export default FeedbackPage;

