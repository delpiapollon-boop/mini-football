const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateSkillLevel = (level) => {
  return ['1', '2', '3', '4', '5'].includes(String(level));
};

const validateStatus = (status, validStatuses) => {
  return validStatuses.includes(status);
};

const calculateDateRange = (daysAhead = 7) => {
  const today = new Date();
  const maxDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  return { today, maxDate };
};

module.exports = {
  validateEmail,
  validateSkillLevel,
  validateStatus,
  calculateDateRange
};
