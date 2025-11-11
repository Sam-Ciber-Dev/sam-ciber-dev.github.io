// Validation and anti-spam heuristics
export const SUSPICIOUS_DOMAINS = [
  '10minutemail','tempmail','guerrillamail','mailinator','throwaway','sharklasers','guerrillamailblock','grr','jourrapide','jourrapidemail','temporarymail','tempemailaddress','tempmailaddress','temp-mail','temporary-email','disposableemailaddresses','emailondeck','deadaddress','spamgourmet','incognitomail','anonymbox','trashmail','yopmail','maildrop','mailnesia','dispostable','fakemailgenerator','guerrillamail','example','test','localhost','invalid','fake','dummy','sample'
];
export const VALID_TLDS = [
  'com','org','net','edu','gov','mil','int','info','biz','name','pro','eu','uk','de','fr','es','it','pt','nl','be','at','ch','se','no','dk','fi','br','ca','au','jp','cn','ru','in','mx','ar','cl','co','pe','us','aero','coop','museum','travel','jobs','mobi','tel','asia','cat','post','academy','agency','business','center','city','company','email','global','group','international','management','network','online','site','tech','website','world','app','cloud','dev','digital','host','live','store','ac','school','university','io','xyz'
];
export const SPAM_LOCALPART_PATTERNS = [
  /^(noreply|no-reply)$/i,
  /^.*(spam|trash|junk|delete).*$/i,
  /^.*\d{15,}.*$/,
  /^[._-]+$/,
  /^.{1,2}$/
];

export function validateName(name) {
  name = name.trim();
  const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
  return name.length >= 2 && nameRegex.test(name);
}

export function validateEmail(email) {
  email = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(email)) return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [localPart, domain] = parts;
  if (localPart.length === 0 || localPart.length > 64) return false;
  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) return false;
  if (domain.length === 0 || domain.length > 253) return false;
  if (!domain.includes('.')) return false;
  if (domain.startsWith('-') || domain.endsWith('-') || domain.startsWith('.') || domain.endsWith('.')) return false;
  const domainParts = domain.split('.');
  for (let part of domainParts) {
    if (part.length === 0 || part.length > 63) return false;
    if (part.startsWith('-') || part.endsWith('-')) return false;
    if (!/^[a-zA-Z0-9-]+$/.test(part)) return false;
  }
  const tld = domainParts[domainParts.length - 1];
  if (!VALID_TLDS.includes(tld)) {
    if (!/^[a-zA-Z]{2,24}$/.test(tld)) return false; // fallback
  }
  if (/\d{11,}/.test(localPart)) return false;
  if (/[._-]{4,}/.test(localPart)) return false;
  for (let suspicious of SUSPICIOUS_DOMAINS) {
    if (domain.includes(suspicious)) return false;
  }
  for (let pattern of SPAM_LOCALPART_PATTERNS) {
    if (pattern.test(localPart)) return false;
  }
  return true;
}

export function validateMessageContent(raw) {
  const msg = String(raw || '');
  const trimmed = msg.trim();
  if (trimmed.length < 15) return { valid: false, reason: 'Mensagem demasiado curta.' };
  const urlRegex = /(https?:\/\/|www\.)\S+/gi;
  const links = trimmed.match(urlRegex) || [];
  if (links.length > 2) return { valid: false, reason: 'Mensagem contém demasiados links.' };
  const letters = trimmed.replace(/[^a-zA-ZÀ-ÿ]/g, '');
  const uppers = letters.replace(/[^A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ]/g, '');
  if (letters.length >= 20) {
    const ratio = uppers.length / letters.length;
    const manyExcl = /!{3,}/.test(trimmed);
    if (ratio > 0.7 && manyExcl) return { valid: false, reason: 'Mensagem parece muito “gritada”.' };
  }
  const spamPhrases = [
    'ganhe dinheiro','oferta exclusiva','clique aqui','promoção imperdível','bónus gratuito','prêmio garantido','garantia total','oportunidade única','renda extra','lucro diário'
  ];
  const lower = trimmed.toLowerCase();
  if (spamPhrases.some(p => lower.includes(p))) return { valid: false, reason: 'Mensagem contém termos típicos de spam.' };
  const words = lower.split(/\s+/).filter(Boolean);
  if (words.length > 10) {
    const counts = Object.create(null);
    for (const w of words) counts[w] = (counts[w] || 0) + 1;
    const maxRepeat = Math.max(...Object.values(counts));
    if (maxRepeat > Math.ceil(words.length * 0.6)) return { valid: false, reason: 'Mensagem demasiado repetitiva.' };
  }
  return { valid: true };
}
