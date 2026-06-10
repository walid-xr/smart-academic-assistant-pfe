import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import { useAuth } from './context/AuthContext';
import CreateAssignmentPage from './pages/CreateAssignmentPage';
import AnswerAssignmentPage from './pages/AnswerAssignmentPage';
import FeedbackPage from './pages/FeedbackPage';
import HomeworkDetailsPage from './pages/HomeworkDetailsPage';
import HomeworkListPage from './pages/HomeworkListPage';
import LoginPage from './pages/LoginPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import StructuredAssignmentsPage from './pages/StructuredAssignmentsPage';
import TeacherDashboardPage from './pages/TeacherDashboardPage';

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-loader">Chargement de l'application...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'}
      replace
    />
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute roles={['teacher']}>
            <DashboardLayout title="Tableau de bord enseignant">
              <TeacherDashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute roles={['student']}>
            <DashboardLayout title="Tableau de bord etudiant">
              <StudentDashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/submit-homework"
        element={
          <ProtectedRoute roles={['student']}>
            <Navigate to="/assignments" replace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assignments"
        element={
          <ProtectedRoute roles={['teacher', 'student']}>
            <DashboardLayout title="Devoirs">
              <StructuredAssignmentsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/assignments/create"
        element={
          <ProtectedRoute roles={['teacher']}>
            <DashboardLayout title="Creer un devoir">
              <CreateAssignmentPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/assignments/:id/answer"
        element={
          <ProtectedRoute roles={['student']}>
            <DashboardLayout title="Repondre au devoir">
              <AnswerAssignmentPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/homework"
        element={
          <ProtectedRoute roles={['teacher', 'student']}>
            <DashboardLayout title="Liste des devoirs">
              <HomeworkListPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/homework/:id"
        element={
          <ProtectedRoute roles={['teacher', 'student']}>
            <DashboardLayout title="Details du devoir">
              <HomeworkDetailsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/feedback/:id"
        element={
          <ProtectedRoute roles={['teacher', 'student']}>
            <DashboardLayout title="Feedback du devoir">
              <FeedbackPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
