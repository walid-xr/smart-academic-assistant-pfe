const axios = require('axios');

const postToWebhook = async (url, payload) => {
  if (!url) {
    return {
      skipped: true,
      success: false
    };
  }

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.N8N_SHARED_SECRET ? { 'x-n8n-secret': process.env.N8N_SHARED_SECRET } : {})
      },
      timeout: 10000
    });

    return {
      skipped: false,
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error(`n8n webhook call failed for ${url}:`, error.message);

    return {
      skipped: false,
      success: false,
      error: error.message
    };
  }
};

const sendSubmissionForAnalysis = (payload) => {
  return postToWebhook(process.env.N8N_SUBMISSION_WEBHOOK_URL, payload);
};

const sendResultEmail = (payload) => {
  return postToWebhook(process.env.N8N_RESULT_EMAIL_WEBHOOK_URL, payload);
};

const sendCheatingAlert = (payload) => {
  return postToWebhook(process.env.N8N_CHEATING_ALERT_WEBHOOK_URL, payload);
};

module.exports = {
  sendSubmissionForAnalysis,
  sendResultEmail,
  sendCheatingAlert
};
