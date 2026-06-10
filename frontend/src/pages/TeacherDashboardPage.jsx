import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { formatStatusLabel } from '../utils/labels';

const TeacherDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/homework/dashboard/teacher');
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
      <section className="stats-grid">
        <div className="stat-card">
          <span>Soumissions totales</span>
          <strong>{dashboard.overview.total_submissions}</strong>
        </div>
        <div className="stat-card">
          <span>Etudiants</span>
          <strong>{dashboard.overview.total_students}</strong>
        </div>
        <div className="stat-card">
          <span>Moyenne</span>
          <strong>{dashboard.overview.average_score}/20</strong>
        </div>
        <div className="stat-card">
          <span>Devoirs signales</span>
          <strong>{dashboard.overview.flagged_count}</strong>
        </div>
        <div className="stat-card">
          <span>Devoirs structures</span>
          <strong>{dashboard.overview.structured_assignments}</strong>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel-card">
          <div className="panel-card__header">
            <h3>Soumissions recentes</h3>
            <Link to="/homework" className="btn btn-sm btn-outline-primary">
              Voir tout
            </Link>
          </div>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Etudiant</th>
                  <th>Statut</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recent_submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>
                      <Link to={`/homework/${submission.id}`}>{submission.title}</Link>
                    </td>
                    <td>{submission.student_name}</td>
                    <td>
                      <span className={`status-badge status-${submission.status}`}>
                        {formatStatusLabel(submission.status)}
                      </span>
                    </td>
                    <td>{submission.score ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-card__header">
            <h3>Meilleurs etudiants</h3>
          </div>

          <div className="list-stack">
            {dashboard.top_students.map((student, index) => (
              <div key={`${student.student_name}-${index}`} className="info-row">
                <div>
                  <strong>{student.student_name}</strong>
                  <p className="text-muted mb-0">
                    {student.class_name} - {student.total_submissions} soumissions
                  </p>
                </div>
                <span className="score-pill">{student.average_score}/20</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-card__header">
            <h3>Etat des corrections</h3>
            <Link to="/assignments/create" className="btn btn-sm btn-outline-primary">
              Creer un devoir
            </Link>
          </div>

          <div className="status-grid">
            {dashboard.review_status.map((item) => (
              <div key={item.status} className="mini-card">
                <span>{formatStatusLabel(item.status)}</span>
                <strong>{item.total}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TeacherDashboardPage;

