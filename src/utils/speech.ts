/**
 * Speech Recognition and Text-to-Speech for FORTIFY Accessibility
 */

export interface VoiceCommandResult {
  transcript: string;
  actionType: 'add-expression' | 'zoom-in' | 'zoom-out' | 'reset-zoom' | 'clear' | 'unknown';
  equation?: string;
}

export function parseVoiceMathCommand(transcript: string): VoiceCommandResult {
  const clean = transcript.toLowerCase().trim();

  if (clean.includes('zoom in')) {
    return { transcript, actionType: 'zoom-in' };
  }
  if (clean.includes('zoom out')) {
    return { transcript, actionType: 'zoom-out' };
  }
  if (clean.includes('reset') || clean.includes('home view')) {
    return { transcript, actionType: 'reset-zoom' };
  }
  if (clean.includes('clear') || clean.includes('delete all')) {
    return { transcript, actionType: 'clear' };
  }

  // Parse plot instructions: e.g. "plot x squared plus 3", "graph sine of 2 x"
  let eq = clean
    .replace(/^plot\s+/i, '')
    .replace(/^graph\s+/i, '')
    .replace(/^draw\s+/i, '')
    .replace(/^add\s+/i, '');

  // Math words to operators
  eq = eq
    .replace(/\bequals\b/g, '=')
    .replace(/\bequal to\b/g, '=')
    .replace(/\bsquared\b/g, '^2')
    .replace(/\bcubed\b/g, '^3')
    .replace(/\bto the power of\b/g, '^')
    .replace(/\bplus\b/g, '+')
    .replace(/\bminus\b/g, '-')
    .replace(/\btimes\b/g, '*')
    .replace(/\bmultiplied by\b/g, '*')
    .replace(/\bdivided by\b/g, '/')
    .replace(/\bover\b/g, '/')
    .replace(/\bsine of\b/g, 'sin(')
    .replace(/\bcosine of\b/g, 'cos(')
    .replace(/\btangent of\b/g, 'tan(')
    .replace(/\bsquare root of\b/g, 'sqrt(')
    .replace(/\bsqrt of\b/g, 'sqrt(');

  // Close unclosed parentheses if introduced
  const openCount = (eq.match(/\(/g) || []).length;
  const closeCount = (eq.match(/\)/g) || []).length;
  if (openCount > closeCount) {
    eq += ')'.repeat(openCount - closeCount);
  }

  if (eq) {
    if (!eq.includes('=')) {
      eq = 'y = ' + eq;
    }
    return {
      transcript,
      actionType: 'add-expression',
      equation: eq,
    };
  }

  return { transcript, actionType: 'unknown' };
}

export function speakEquation(raw: string) {
  if (!('speechSynthesis' in window)) return;

  let speechText = raw
    .replace(/=/g, ' equals ')
    .replace(/\^2/g, ' squared ')
    .replace(/\^3/g, ' cubed ')
    .replace(/\^(\d+)/g, ' to the power of $1 ')
    .replace(/\+/g, ' plus ')
    .replace(/-/g, ' minus ')
    .replace(/\*/g, ' times ')
    .replace(/\//g, ' divided by ')
    .replace(/sin/g, ' sine ')
    .replace(/cos/g, ' cosine ')
    .replace(/tan/g, ' tangent ')
    .replace(/sqrt/g, ' square root of ')
    .replace(/pi/g, ' pi ')
    .replace(/theta/g, ' theta ');

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}
