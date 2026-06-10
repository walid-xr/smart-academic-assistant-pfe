import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { formatStatusLabel } from '../utils/labels';

const HomeworkListPage = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);

        const response = await api.get('/homework', {
          params: {
            search: filters.search,
            status: filters.status
          }
        });

        setSubmissions(response.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Impossible de charger les devoirs.');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [filters.search, filters.status]);

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value
    });
  };

  return (
    <div className="page-stack">
      <section className="panel-card">
        <div className="panel-card__header">
          <div>
            <h3>{user.role === 'teacher' ? 'Toutes les soumissions' : 'Mon historique'}</h3>
            <p className="text-muted mb-0">
              Recherchez les soumissions et suivez les analyses, les notes et la correction.
            </p>
          </div>
          {user.role === 'student' && (
            <Link to="/assignments" className="btn btn-primary">
              Ouvrir les devoirs
            </Link>
          )}
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-8">
            <input
              type="text"
              name="search"
              className="form-control"
              placeholder="Rechercher par titre, matiere ou etudiant"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-md-4">
            <select
              name="status"
              className="form-select"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">Tous les statuts</option>
              <option value="submitted">Soumis</option>
              <option value="processing">En cours</option>
              <option value="analyzed">Analyse</option>
              <option value="reviewed">Revise</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div>Chargement des soumissions...</div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Matiere</th>
                  <th>Type</th>
                  {user.role === 'teacher' && <th>Etudiant</th>}
                  <th>Statut</th>
                  <th>Note</th>
                  <th>Triche</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>{submission.title}</td>
                    <td>{submission.subject}</td>
                    <td>
                      {submission.assignment_type === 'pdf' ? (
                        <span className="badge text-bg-info">Devoir PDF</span>
                      ) : submission.submission_mode === 'questionnaire' ? (
                        <span className="badge text-bg-primary">Questionnaire</span>
                      ) : (
                        <span className="badge text-bg-secondary">Classique</span>
                      )}
                    </td>
                    {user.role === 'teacher' && <td>{submission.student_name}</td>}
                    <td>
                      <span className={`status-badge status-${submission.status}`}>
                        {formatStatusLabel(submission.status)}
                      </span>
                    </td>
                    <td>{submission.final_note ?? submission.score ?? '-'}</td>
                    <td>
                      {Number(submission.cheating_flag) === 1 ? (
                        <span className="badge text-bg-danger">Signale</span>
                      ) : (
                        <span className="badge text-bg-success">Normal</span>
                      )}
                    </td>
                    <td>
                      <Link to={`/homework/${submission.id}`} className="btn btn-sm btn-outline-primary">
                        Ouvrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomeworkListPage;
