const messageInput = document.getElementById('messageInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const clearBtn = document.getElementById('clearBtn');
const sampleBtn = document.getElementById('sampleBtn');
const riskBadge = document.getElementById('riskBadge');
const scoreValue = document.getElementById('scoreValue');
const verdictText = document.getElementById('verdictText');
const reasonsList = document.getElementById('reasonsList');

const scamPatterns = [
  { pattern: /(?:verify|verification|update|confirm|urgent|immediately|action required)/i, weight: 12 },
  { pattern: /(?:otp|one[- ]time password|code)/i, weight: 16 },
  { pattern: /(?:bank|account|payment|invoice|suspended|restricted|locked)/i, weight: 14 },
  { pattern: /(?:prize|winner|claim|reward|lottery|free gift)/i, weight: 18 },
  { pattern: /(?:click|tap|visit|open|link|url|www\.|https?:)/i, weight: 14 },
  { pattern: /(?:secure|official|government|tax|police|fbi|courts?)/i, weight: 12 },
  { pattern: /(?:personal|pin|cvv|ssn|password|card number|routing number)/i, weight: 18 },
  { pattern: /(?:reply with|send .* to|call .* now)/i, weight: 10 },
  { pattern: /(?:\$|\d{4,}|\bbonus\b|\bwinning\b)/i, weight: 10 }
];

const sampleMessages = [
  'Your bank account has been restricted. Verify your identity immediately at https://secure-bank-update-check.com to avoid account closure. Reply with your OTP.',
  'Congratulations! You are selected as a lucky winner. Claim your reward now by clicking the secure link and providing your details.',
  'Hi, this is the delivery team. Your package is delayed and payment is due. Please send your card details to confirm delivery.'
];

function getRiskDetails(message) {
  const normalized = message.trim();
  if (!normalized) {
    return {
      score: 0,
      verdict: 'No message entered',
      reasons: ['Paste a message to begin the check.'],
      level: 'medium'
    };
  }

  let score = 0;
  const reasons = [];

  scamPatterns.forEach(({ pattern, weight }) => {
    if (pattern.test(normalized)) {
      score += weight;
      const match = pattern.source.replace(/[\^$.*+?()[\]{}|]/g, '').slice(0, 30);
      reasons.push(`Matched scam pattern: ${match}...`);
    }
  });

  const hasURL = /(https?:\/\/|www\.)/i.test(normalized);
  if (hasURL) {
    score += 10;
    reasons.push('Contains a suspicious web link or URL.');
  }

  const hasUrgency = /(urgent|immediately|today|now|asap|final warning|last chance)/i.test(normalized);
  if (hasUrgency) {
    score += 8;
    reasons.push('Uses urgency or pressure language.');
  }

  const hasRequest = /(send|reply|share|provide|verify|confirm)/i.test(normalized);
  if (hasRequest) {
    score += 6;
    reasons.push('Requests personal information or quick action.');
  }

  const weirdSender = /(?:\+\d{10,}|\b[A-Z]{5,}\b)/.test(normalized);
  if (weirdSender) {
    score += 4;
    reasons.push('Contains atypical sender or number formatting patterns.');
  }

  if (score >= 65) {
    verdictText.textContent = 'High risk — likely scam';
    riskBadge.textContent = 'High Risk';
    riskBadge.className = 'risk-badge high';
  } else if (score >= 35) {
    verdictText.textContent = 'Medium risk — verify before acting';
    riskBadge.textContent = 'Medium Risk';
    riskBadge.className = 'risk-badge medium';
  } else if (score > 0) {
    verdictText.textContent = 'Low risk — still be careful';
    riskBadge.textContent = 'Low Risk';
    riskBadge.className = 'risk-badge low';
  } else {
    verdictText.textContent = 'Looks benign';
    riskBadge.textContent = 'Low Risk';
    riskBadge.className = 'risk-badge low';
  }

  if (reasons.length === 0) {
    reasons.push('No obvious scam markers were found, but stay alert for manipulation tactics.');
  }

  score = Math.min(score, 100);

  return {
    score,
    reasons: reasons.slice(0, 5),
    verdict: verdictText.textContent
  };
}

function renderAnalysis() {
  const message = messageInput.value;
  const result = getRiskDetails(message);
  scoreValue.textContent = String(result.score);
  verdictText.textContent = result.verdict;

  const reasons = result.reasons.length ? result.reasons : ['No obvious scam markers found.'];
  reasonsList.innerHTML = reasons.map((reason) => `<li>${reason}</li>`).join('');

  const ring = document.querySelector('.score-ring');
  const hue = result.score >= 65 ? 0 : result.score >= 35 ? 38 : 142;
  ring.style.background = `conic-gradient(hsl(${hue}, 80%, 60%) ${result.score * 3.6}deg, rgba(148, 163, 184, 0.14) ${result.score * 3.6}deg 360deg)`;
}

analyzeBtn.addEventListener('click', renderAnalysis);
clearBtn.addEventListener('click', () => {
  messageInput.value = '';
  scoreValue.textContent = '0';
  verdictText.textContent = 'Waiting for analysis...';
  riskBadge.textContent = 'Checking...';
  riskBadge.className = 'risk-badge medium';
  reasonsList.innerHTML = '<li>Paste a message to begin the check.</li>';
  document.querySelector('.score-ring').style.background = 'conic-gradient(var(--warning) 0deg 220deg, rgba(148, 163, 184, 0.14) 220deg 360deg)';
});

sampleBtn.addEventListener('click', () => {
  const randomIndex = Math.floor(Math.random() * sampleMessages.length);
  messageInput.value = sampleMessages[randomIndex];
  renderAnalysis();
});

messageInput.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    renderAnalysis();
  }
});

renderAnalysis();
