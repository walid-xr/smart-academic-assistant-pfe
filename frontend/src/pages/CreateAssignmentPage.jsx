import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const CreateAssignmentPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    assignment_type: 'questionnaire',
    title: '',
    subject: '',
    instructions: '',
    due_date: '',
    questions: ['', '']
  });
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isPdfAssignment = formData.assignment_type === 'pdf';

  const handleFieldChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleQuestionChange = (index, value) => {
    const nextQuestions = [...formData.questions];
    nextQuestions[index] = value;

    setFormData({
      ...formData,
      questions: nextQuestions
    });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, '']
    });
  };

  const removeQuestion = (index) => {
    if (formData.questions.length <= 1) {
      return;
    }

    setFormData({
      ...formData,
      questions: formData.questions.filter((_, questionIndex) => questionIndex !== index)
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const payload = new FormData();
      payload.append('assignment_type', formData.assignment_type);
      payload.append('title', formData.title);
      payload.append('subject', formData.subject);
      payload.append('instructions', formData.instructions);
      payload.append('due_date', formData.due_date);

      if (isPdfAssignment) {
        payload.append('assignment_file', assignmentFile);
      } else {
        payload.append('questions', JSON.stringify(formData.questions));
      }

      await api.post('/homework/assignments', payload);

      setMessage('Devoir cree avec succes.');
      setTimeout(() => navigate('/assignments'), 1000);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Impossible de creer le devoir.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="panel-card">
        <div className="panel-card__header">
          <div>
            <h3>Creer un devoir</h3>
            <p className="text-muted mb-0">
              Choisissez un questionnaire ou importez un fichier PDF pour les etudiants.
            </p>
          </div>
        </div>

        <form className="row g-3 mt-1" onSubmit={handleSubmit}>
          <div className="col-12">
            <label className="form-label">Type de devoir</label>
            <div className="assignment-type-selector">
              <label
                className={
                  formData.assignment_type === 'questionnaire'
                    ? 'assignment-type-option assignment-type-option--active'
                    : 'assignment-type-option'
                }
              >
                <input
                  type="radio"
                  name="assignment_type"
                  value="questionnaire"
                  checked={formData.assignment_type === 'questionnaire'}
                  onChange={handleFieldChange}
                />
                <span>Questions dans l'application</span>
                <small>Les etudiants repondent directement dans la plateforme.</small>
              </label>

              <label
                className={
                  isPdfAssignment
                    ? 'assignment-type-option assignment-type-option--active'
                    : 'assignment-type-option'
                }
              >
                <input
                  type="radio"
                  name="assignment_type"
                  value="pdf"
                  checked={isPdfAssignment}
                  onChange={handleFieldChange}
                />
                <span>Devoir PDF</span>
                <small>Importez le devoir en PDF et collectez les soumissions des etudiants.</small>
              </label>
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Titre</label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleFieldChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Matiere</label>
            <input
              type="text"
              name="subject"
              className="form-control"
              value={formData.subject}
              onChange={handleFieldChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Date limite</label>
            <input
              type="date"
              name="due_date"
              className="form-control"
              value={formData.due_date}
              onChange={handleFieldChange}
            />
          </div>

          {isPdfAssignment && (
            <div className="col-md-6">
              <label className="form-label">PDF du devoir</label>
              <input
                type="file"
                className="form-control"
                accept="application/pdf"
                onChange={(event) => setAssignmentFile(event.target.files?.[0] || null)}
                required
              />
            </div>
          )}

          <div className="col-12">
            <label className="form-label">Instructions</label>
            <textarea
              name="instructions"
              rows="4"
              className="form-control"
              value={formData.instructions}
              onChange={handleFieldChange}
              placeholder={
                isPdfAssignment
                  ? 'Ajoutez les regles de soumission, le format attendu ou les notes de correction.'
                  : 'Expliquez le but du devoir.'
              }
            />
          </div>

          {!isPdfAssignment && (
            <div className="col-12">
              <div className="question-builder__header">
                <label className="form-label mb-0">Questions</label>
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={addQuestion}>
                  Ajouter une question
                </button>
              </div>

              <div className="question-builder">
                {formData.questions.map((question, index) => (
                  <div key={`question-${index}`} className="question-builder__item">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>Question {index + 1}</strong>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => removeQuestion(index)}
                      >
                        Supprimer
                      </button>
                    </div>

                    <textarea
                      rows="3"
                      className="form-control"
                      value={question}
                      onChange={(event) => handleQuestionChange(index, event.target.value)}
                      placeholder="Ecrivez la question ici..."
                      required={!isPdfAssignment}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {message && <div className="col-12 alert alert-success mb-0">{message}</div>}
          {error && <div className="col-12 alert alert-danger mb-0">{error}</div>}

          <div className="col-12">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Creer le devoir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssignmentPage;
