import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { formatStatusLabel } from '../utils/labels';

const formatDate = (value) => {
  if (!value) {
    return 'Aucune date limite';
  }

  return new Date(value).toLocaleDateString();
};

const getAssignmentTypeLabel = (assignment) =>
  assignment.assignment_type === 'pdf' ? 'Devoir PDF' : `${assignment.question_count} questions`;

const getFileUrl = (filePath) =>
  `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${filePath}`;

const StructuredAssignmentsPage = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(user?.role === 'teacher' ? 'all' : 'active');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/homework/assignments');
      setAssignments(response.data);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Impossible de charger les devoirs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleStatusChange = async (assignmentId, nextStatus) => {
    try {
      setActionLoadingId(assignmentId);
      setMessage('');
      setError('');

      await api.put(`/homework/assignments/${assignmentId}/status`, {
        status: nextStatus
      });

      setMessage(
        nextStatus === 'closed'
          ? 'Devoir ferme avec succes.'
          : 'Devoir rouvert avec succes.'
      );
      await fetchAssignments();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Impossible de modifier le statut du devoir.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (assignmentId, title) => {
    const confirmed = window.confirm(
      `Voulez-vous supprimer definitivement "${title}" et ses soumissions ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(assignmentId);
      setMessage('');
      setError('');

      await api.delete(`/homework/assignments/${assignmentId}`);
      setMessage('Devoir supprime avec succes.');
      await fetchAssignments();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Impossible de supprimer le devoir.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      !normalizedSearch ||
      assignment.title.toLowerCase().includes(normalizedSearch) ||
      assignment.subject.toLowerCase().includes(normalizedSearch) ||
      String(assignment.instructions || '')
        .toLowerCase()
        .includes(normalizedSearch);

    const matchesStatus =
      statusFilter === 'all' ? true : String(assignment.status || 'active') === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeAssignments = assignments.filter((assignment) => assignment.status === 'active').length;
  const closedAssignments = assignments.filter((assignment) => assignment.status === 'closed').length;

  return (
    <div className="page-stack">
      <section className="panel-card">
        <div className="panel-card__header">
          <div>
            <h3>{user.role === 'teacher' ? 'Devoirs' : 'Devoirs disponibles'}</h3>
            <p className="text-muted mb-0">
              {user.role === 'teacher'
                ? 'Creez, gerez, fermez et supprimez les devoirs avec questions ou PDF.'
                : 'Ouvrez les devoirs publies, soumettez votre travail et recevez une evaluation IA.'}
            </p>
          </div>

          {user.role === 'teacher' && (
            <Link to="/assignments/create" className="btn btn-primary">
              Creer un devoir
            </Link>
          )}
        </div>

        <div className="assignment-toolbar">
          <div className="assignment-toolbar__search">
            <label className="form-label">Recherche</label>
            <input
              type="text"
              className="form-control"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher par titre, matiere ou instruction"
            />
          </div>

          <div className="assignment-toolbar__filter">
            <label className="form-label">Statut</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {user.role === 'teacher' && <option value="all">Tous</option>}
              <option value="active">Actif</option>
              {user.role === 'teacher' && <option value="closed">Ferme</option>}
            </select>
          </div>
        </div>

        {user.role === 'teacher' && (
          <div className="assignment-summary">
            <span>{assignments.length} devoirs au total</span>
            <span>{activeAssignments} actifs</span>
            <span>{closedAssignments} fermes</span>
          </div>
        )}

        {message && <div className="alert alert-success mb-0">{message}</div>}
        {error && <div className="alert alert-danger mb-0">{error}</div>}

        {loading ? (
          <div>Chargement des devoirs...</div>
        ) : filteredAssignments.length === 0 ? (
          <div className="empty-state">
            <h4>Aucun devoir trouve</h4>
            <p className="mb-0">
              {assignments.length === 0
                ? user.role === 'teacher'
                  ? 'Creez votre premier devoir.'
                  : 'Aucun devoir disponible pour le moment.'
                : 'Essayez de modifier la recherche ou le filtre.'}
            </p>
          </div>
        ) : (
          <div className="assignment-card-grid">
            {filteredAssignments.map((assignment) => {
              const isBusy = actionLoadingId === assignment.id;
              const isClosed = assignment.status === 'closed';
              const submissionLabel =
                Number(assignment.submission_count) === 1
                  ? '1 soumission'
                  : `${assignment.submission_count} soumissions`;

              return (
                <article key={assignment.id} className="assignment-card">
                  <div className="assignment-card__header">
                    <div>
                      <h4>{assignment.title}</h4>
                      <p className="text-muted mb-0">
                        {assignment.subject}
                        {assignment.teacher_name ? ` | ${assignment.teacher_name}` : ''}
                      </p>
                    </div>
                    <span className={`status-badge status-${assignment.status || 'active'}`}>
                      {formatStatusLabel(assignment.status || 'active')}
                    </span>
                  </div>

                  <p className="assignment-card__body">
                    {assignment.instructions || 'Aucune instruction supplementaire.'}
                  </p>

                  {assignment.assignment_type === 'pdf' && assignment.file_path && (
                    <a
                      href={getFileUrl(assignment.file_path)}
                      target="_blank"
                      rel="noreferrer"
                      className="assignment-file-link"
                    >
                      Ouvrir le PDF du devoir
                    </a>
                  )}

                  <div className="assignment-card__meta">
                    <span>{getAssignmentTypeLabel(assignment)}</span>
                    {user.role === 'teacher' ? (
                      <span>{submissionLabel}</span>
                    ) : assignment.submission_id ? (
                      <span>
                        Soumis
                        {assignment.score !== null && assignment.score !== undefined
                          ? ` | Note ${assignment.score}/20`
                          : ''}
                      </span>
                    ) : (
                      <span>{isClosed ? 'Ferme' : 'Pas encore repondu'}</span>
                    )}
                    <span>{`Date limite ${formatDate(assignment.due_date)}`}</span>
                  </div>

                  <div className="assignment-card__footer">
                    <span className="text-muted">
                      Cree le {new Date(assignment.created_at).toLocaleDateString()}
                    </span>
                    {user.role === 'teacher' ? (
                      <div className="assignment-card__actions">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() =>
                            handleStatusChange(assignment.id, isClosed ? 'active' : 'closed')
                          }
                          disabled={isBusy}
                        >
                          {isBusy ? 'Enregistrement...' : isClosed ? 'Rouvrir' : 'Fermer'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(assignment.id, assignment.title)}
                          disabled={isBusy}
                        >
                          Supprimer
                        </button>
                      </div>
                    ) : assignment.submission_id ? (
                      <Link to={`/homework/${assignment.submission_id}`} className="btn btn-outline-primary">
                        Voir la soumission
                      </Link>
                    ) : (
                      <Link
                        to={`/assignments/${assignment.id}/answer`}
                        className={`btn ${isClosed ? 'btn-outline-secondary disabled' : 'btn-primary'}`}
                        aria-disabled={isClosed}
                        onClick={(event) => {
                          if (isClosed) {
                            event.preventDefault();
                          }
                        }}
                      >
                        {isClosed ? 'Ferme' : assignment.assignment_type === 'pdf' ? 'Soumettre le travail' : 'Repondre aux questions'}
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default StructuredAssignmentsPage;
