const normalizeText = (text = '') => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const calculateJaccardSimilarity = (textA = '', textB = '') => {
  const wordsA = new Set(normalizeText(textA).split(' ').filter(Boolean));
  const wordsB = new Set(normalizeText(textB).split(' ').filter(Boolean));

  if (!wordsA.size || !wordsB.size) {
    return 0;
  }

  const intersection = [...wordsA].filter((word) => wordsB.has(word));
  const union = new Set([...wordsA, ...wordsB]);

  return Number(((intersection.length / union.size) * 100).toFixed(2));
};

const getHighestSimilarity = (currentText, submissions = []) => {
  let highestPercentage = 0;
  let matchedSubmissionId = null;

  submissions.forEach((submission) => {
    const percentage = calculateJaccardSimilarity(currentText, submission.content || '');

    if (percentage > highestPercentage) {
      highestPercentage = percentage;
      matchedSubmissionId = submission.id;
    }
  });

  return {
    percentage: highestPercentage,
    matchedSubmissionId
  };
};

module.exports = {
  normalizeText,
  calculateJaccardSimilarity,
  getHighestSimilarity
};

