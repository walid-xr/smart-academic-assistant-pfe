import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} replace />;
  }

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loggedUser = await login(formData.email, formData.password);
      const destination =
        location.state?.from?.pathname ||
        (loggedUser.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard');

      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = (event) => {
    event.preventDefault();
    setRecoveryMessage(
      `Demande de recuperation preparee pour ${recoveryEmail}. Contactez l'administrateur de la plateforme pour reinitialiser ce compte.`
    );
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <section className="login-brand-panel">
          <img
            className="app-logo app-logo--login"
            src="/smart-academic-assistant-logo.svg"
            alt="Smart Academic Assistant logo"
          />
          <p className="eyebrow-text">Projet PFE Full-Stack</p>
          <h1>Smart Academic Assistant</h1>
          <p>
            Un portail academique securise pour les devoirs, la correction IA, le feedback et la validation enseignant.
          </p>
        </section>

        <section className="login-form-panel">
          {!showRecovery ? (
            <>
              <div className="login-form-heading">
                <h2>Connexion</h2>
                <p>Utilisez votre compte academique pour continuer.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="teacher@school.com"
                    required
                  />
                </div>

                <div className="mb-2">
                  <div className="login-label-row">
                    <label className="form-label mb-0">Mot de passe</label>
                    <button
                      type="button"
                      className="login-link-button"
                      onClick={() => {
                        setShowRecovery(true);
                        setRecoveryMessage('');
                        setRecoveryEmail(formData.email);
                      }}
                    >
                      Mot de passe oublie ?
                    </button>
                  </div>
                  <input
                    type="password"
                    name="password"
                    className="form-control mt-2"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Entrez votre mot de passe"
                    required
                  />
                </div>

                {error && <div className="alert alert-danger py-2">{error}</div>}

                <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>

            </>
          ) : (
            <>
              <div className="login-form-heading">
                <h2>Reinitialiser le mot de passe</h2>
                <p>Entrez votre email pour preparer une demande de recuperation.</p>
              </div>

              <form onSubmit={handleRecoverySubmit}>
                <div className="mb-3">
                  <label className="form-label">Email du compte</label>
                  <input
                    type="email"
                    className="form-control"
                    value={recoveryEmail}
                    onChange={(event) => setRecoveryEmail(event.target.value)}
                    placeholder="name@school.com"
                    required
                  />
                </div>

                {recoveryMessage && (
                  <div className="alert alert-info py-2">
                    {recoveryMessage}
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-100">
                  Preparer la demande
                </button>
                <button
                  type="button"
                  className="btn btn-outline-primary w-100 mt-2"
                  onClick={() => setShowRecovery(false)}
                >
                  Retour a la connexion
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
