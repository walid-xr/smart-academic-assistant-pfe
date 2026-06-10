import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { formatStatusLabel } from '../utils/labels';

const StudentDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/students/dashboard');
        setDashboard(response.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Impossible de charger le tableau de bord.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="panel-card">Chargement du tableau de bord...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow-text">Bon retour</p>
          <h2>{dashboard.student.name}</h2>
          <p className="mb-0 text-muted">
            Classe : {dashboard.student.class_name} - Repondez aux devoirs publies et suivez votre feedback.
          </p>
        </div>
        <div className="hero-actions">
          <Link to="/assignments" className="btn btn-primary">
            Ouvrir les devoirs
          </Link>
          <Link to="/homework" className="btn btn-outline-primary">
            Voir l'historique
          </Link>
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Soumissions totales</span>
          <strong>{dashboard.stats.total_submissions}</strong>
        </div>
        <div className="stat-card">
          <span>Devoirs corriges</span>
          <strong>{dashboard.stats.reviewed_count}</strong>
        </div>
        <div className="stat-card">
          <span>Moyenne</span>
          <strong>{dashboard.stats.average_score}/20</strong>
        </div>
        <div className="stat-card">
          <span>Devoirs signales</span>
          <strong>{dashboard.stats.flagged_count}</strong>
        </div>
        <div className="stat-card">
          <span>Devoirs disponibles</span>
          <strong>{dashboard.stats.available_assignments}</strong>
        </div>
        <div className="stat-card">
          <span>Devoirs repondus</span>
          <strong>{dashboard.stats.answered_assignments}</strong>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-card__header">
          <div>
            <h3>Soumissions recentes</h3>
            <p className="text-muted mb-0">
              Vos reponses aux devoirs publies apparaissent ici.
            </p>
          </div>
          <Link to="/assignments" className="btn btn-sm btn-outline-primary">
            Ouvrir les devoirs
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Matiere</th>
                <th>Statut</th>
                <th>Note</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.recent_submissions.map((submission) => (
                <tr key={submission.id}>
                  <td>{submission.title}</td>
                  <td>{submission.subject}</td>
                  <td>
                    <span className={`status-badge status-${submission.status}`}>
                      {formatStatusLabel(submission.status)}
                    </span>
                  </td>
                  <td>{submission.final_note ?? submission.score ?? '-'}</td>
                  <td>
                    <Link to={`/feedback/${submission.id}`} className="btn btn-sm btn-outline-secondary">
                      Ouvrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboardPage;
