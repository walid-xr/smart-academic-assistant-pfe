export const statusLabels = {
  submitted: 'Soumis',
  processing: 'En cours',
  analyzed: 'Analyse',
  reviewed: 'Revise',
  active: 'Actif',
  closed: 'Ferme'
};

export const roleLabels = {
  admin: 'Administrateur',
  teacher: 'Enseignant',
  student: 'Etudiant'
};

export const notificationTypeLabels = {
  assignment: 'Devoir',
  submission: 'Soumission',
  analysis: 'Analyse',
  alert: 'Alerte',
  review: 'Correction'
};

export const formatStatusLabel = (status) => statusLabels[status] || status || '-';

export const formatRoleLabel = (role) => roleLabels[role] || role || '';

export const formatNotificationTypeLabel = (type) => notificationTypeLabels[type] || type || '';
