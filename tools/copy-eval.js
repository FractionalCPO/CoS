#!/usr/bin/env node
/**
 * copy-eval.js — FractionalCPO Cold Email Copy Checker
 *
 * Usage:
 *   node copy-eval.js --touch 1 --body "email body text here"
 *   node copy-eval.js --touch 1 --subject "subject line" --body "email body"
 *   node copy-eval.js --touch 4 --body "$(cat email.txt)"
 *   node copy-eval.js --all --input sequence.json
 *
 * Input JSON format for --all:
 *   { "touches": [ { "num": 1, "body": "..." }, ... ] }
 *
 * Exit code: 0 = all pass, 1 = violations found
 */

const args = process.argv.slice(2);

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--touch') result.touch = parseInt(argv[++i]);
    else if (argv[i] === '--body') result.body = argv[++i];
    else if (argv[i] === '--subject') result.subject = argv[++i];
    else if (argv[i] === '--all') result.all = true;
    else if (argv[i] === '--input') result.input = argv[++i];
    else if (argv[i] === '--test') result.test = true;
  }
  return result;
}

function getContext(text, index, radius = 40) {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + radius);
  return `...${text.slice(start, end)}...`;
}

// ─── RULES ──────────────────────────────────────────────────────────────────

const RULES = [
  {
    id: 'no-em-dash',
    name: 'No em dashes (—) or en dashes (–)',
    touchFilter: null,
    check(body) {
      const violations = [];
      for (const [char, name] of [['—', 'em dash'], ['–', 'en dash']]) {
        let idx = body.indexOf(char);
        while (idx !== -1) {
          violations.push(`${name} found: "${getContext(body, idx, 30)}"`);
          idx = body.indexOf(char, idx + 1);
        }
      }
      // space-hyphen-space used as punctuation
      const spaceHyphen = [...body.matchAll(/ - /g)];
      for (const m of spaceHyphen) {
        violations.push(`Dash used as punctuation: "${getContext(body, m.index, 30)}"`);
      }
      return violations;
    }
  },

  {
    id: 'no-quick-call',
    name: 'No "quick call" or variants',
    touchFilter: null,
    check(body) {
      const banned = ['quick call', 'quick chat', 'quick 15', 'quick 30'];
      return banned
        .filter(p => body.toLowerCase().includes(p))
        .map(p => `Banned phrase found: "${p}"`);
    }
  },

  {
    id: 'no-still',
    name: 'No "still" in follow-ups (implies they ignored previous emails)',
    touchFilter: (t) => t >= 2,
    check(body) {
      const matches = [...body.matchAll(/\bstill\b/gi)];
      return matches.map(m => `"still" found: "${getContext(body, m.index, 30)}"`);
    }
  },

  {
    id: 'no-yours',
    name: 'No "yours" — use {{Company}} instead',
    touchFilter: null,
    check(body) {
      // "yours" as possessive referring to a company
      const matches = [...body.matchAll(/\byours\b/gi)];
      return matches.map(m => `"yours" found: "${getContext(body, m.index, 30)}" — use {{Company}}`);
    }
  },

  {
    id: 'no-a-decade',
    name: 'No "a decade" or "over a decade" — use "for the current management team"',
    touchFilter: null,
    check(body) {
      const patterns = ['a decade', 'over a decade', 'decade of', 'decade-long'];
      return patterns
        .filter(p => body.toLowerCase().includes(p))
        .map(p => `"${p}" found — use specific timeframe or "for the current management team"`);
    }
  },

  {
    id: 'no-roadmap',
    name: 'No "roadmap" — use "product strategy" or "product plan" with ELT',
    touchFilter: null,
    check(body) {
      const matches = [...body.matchAll(/\broadmap\b/gi)];
      return matches.map(m => `"roadmap" found — use "product strategy" or "product plan" instead`);
    }
  },

  {
    id: 'no-activation',
    name: 'No "activation" — use "growth"',
    touchFilter: null,
    check(body) {
      const matches = [...body.matchAll(/\bactivation\b/gi)];
      return matches.map(m => `"activation" found — use "growth"`);
    }
  },

  {
    id: 'no-product-org',
    name: 'No "product org" — use "product leadership"',
    touchFilter: null,
    check(body) {
      const matches = [...body.matchAll(/\bproduct org\b/gi)];
      return matches.map(m => `"product org" found — use "product leadership"`);
    }
  },

  {
    id: 'no-declining-trends',
    name: 'No "declining trends" — use "declining growth"',
    touchFilter: null,
    check(body) {
      const matches = [...body.matchAll(/declining trends/gi)];
      return matches.map(m => `"declining trends" found — use "declining growth"`);
    }
  },

  {
    id: 'no-bare-url',
    name: 'No bare URLs unless plain text booking link in T4+',
    touchFilter: null,
    check(body, touch) {
      const violations = [];
      const urlPattern = /https?:\/\/[^\s\])]+/g;
      const matches = [...body.matchAll(urlPattern)];
      for (const m of matches) {
        // Allow URLs inside markdown links: [text](url)
        const preceding = body.slice(Math.max(0, m.index - 1), m.index);
        if (preceding === '(' || preceding === '[') continue;
        // Allow booking links as raw URLs in T4+ (plain text mode)
        const isBookingUrl = /cal\.com|calendly|savvycal|chili\.?piper/i.test(m[0]);
        if (touch >= 4 && isBookingUrl) continue;
        violations.push(`Bare URL found: "${m[0]}" — use hyperlinked text or raw booking URL in T4+`);
      }
      return violations;
    }
  },

  {
    id: 'no-soft-opener',
    name: 'No soft openers — first sentence must hit',
    touchFilter: null,
    check(body) {
      const softPatterns = [
        'i hope this finds you',
        'i hope you',
        'just following up',
        'just wanted to',
        'i wanted to reach out',
        'i\'m reaching out',
        'i am reaching out',
        'wanted to make sure this landed',
        'i hope my last',
      ];
      const lc = body.toLowerCase();
      return softPatterns
        .filter(p => lc.startsWith(p) || lc.includes('\n' + p))
        .map(p => `Soft opener found: "${p}"`);
    }
  },

  {
    id: 'no-breakup-tone',
    name: 'No breakup / passive-aggressive tone',
    touchFilter: null,
    check(body) {
      const breakupPatterns = [
        'last email',
        'last note',
        'last attempt',
        'stop emailing',
        'should i stop',
        'haven\'t heard back',
        'no response',
        'i\'ll stop',
        'if you\'re not interested',
        'let me know if not interested',
        'don\'t want to bother',
      ];
      const lc = body.toLowerCase();
      return breakupPatterns
        .filter(p => lc.includes(p))
        .map(p => `Breakup tone found: "${p}"`);
    }
  },

  {
    id: 'no-declarative-trigger-opener',
    name: 'No "Saw/Noticed/Been watching" declarative trigger openers',
    touchFilter: null,
    check(body) {
      // Split on sentence boundaries (period/exclamation + space, or newlines)
      // to catch "Saw X..." whether it starts a line or a new sentence
      const sentences = body.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(Boolean);
      const weakOpeners = [
        /^saw\s/i,
        /^noticed\s/i,
        /^been\s+watching\s/i,
        /^i\s+saw\s/i,
        /^i\s+noticed\s/i,
        /^i've\s+been\s+watching\s/i,
        /^i\s+have\s+been\s+watching\s/i,
      ];
      const violations = [];
      for (const sentence of sentences) {
        for (const pattern of weakOpeners) {
          if (pattern.test(sentence)) {
            violations.push(`Weak declarative opener: "${sentence.slice(0, 60)}"`);
            break; // one violation per sentence
          }
        }
      }
      return violations;
    }
  },

  {
    id: 'no-might-be-framing',
    name: 'No "might be" weak framing — be specific or ask a real question',
    touchFilter: null,
    check(body) {
      const matches = [...body.matchAll(/might be/gi)];
      return matches.map(m => `"might be" weak framing: "${getContext(body, m.index, 30)}"`);
    }
  },

  {
    id: 'no-would-you-like-to-learn',
    name: 'No "would you like to learn" — too soft, sounds like a salesperson',
    touchFilter: null,
    check(body) {
      if (body.toLowerCase().includes('would you like to learn')) {
        return ['"would you like to learn" found — use a direct question instead'];
      }
      return [];
    }
  },

  {
    id: 'no-third-person-company',
    name: 'No third-person framing for recipient\'s company — use "your" not company name/pronoun',
    touchFilter: null,
    check(body) {
      const violations = [];
      // "product (leadership) at {{company}}" — template form
      const templatePattern = /product\s+(leadership\s+)?at\s+\{\{company\}\}/gi;
      for (const m of [...body.matchAll(templatePattern)]) {
        violations.push(`Third-person company: "${getContext(body, m.index, 50)}" — use "your product" or "your product leadership"`);
      }
      // "the company committed to" — specific phrase
      if (/the company committed to/i.test(body)) {
        violations.push('"the company committed to" — use "you committed to"');
      }
      // "its [product/email/growth/team/platform/business]" — referring to recipient's company
      const itsPattern = /\bits\s+(product|email|growth|team|platform|business)\b/gi;
      for (const m of [...body.matchAll(itsPattern)]) {
        violations.push(`Third-person "its" framing: "${getContext(body, m.index, 40)}" — use "your"`);
      }
      return violations;
    }
  },

  {
    id: 'booking-link-by-touch',
    name: 'Booking link rule: T1-T3 = no link, T4+ = required',
    touchFilter: null,
    check(body, touch) {
      if (!touch) return [];
      const hasBookingLink = /\[.*?(book|grab|get|schedule|calendar).*?\]/i.test(body) ||
                             /\[.*?here\]/i.test(body) ||
                             /cal\.com|calendly|savvycal|chili\.?piper/i.test(body);
      if (touch <= 3 && hasBookingLink) {
        return [`T${touch}: Has booking link but T1-T3 should be interest-question only (no link)`];
      }
      if (touch >= 4 && !hasBookingLink) {
        return [`T${touch}: Missing booking link — T4+ must include hyperlinked booking reference`];
      }
      return [];
    }
  },

  {
    id: 'ctct-named-in-opener',
    name: 'Thread openers (T1, T4, T6) must name Constant Contact explicitly',
    touchFilter: (t) => [1, 4, 6].includes(t),
    check(body, touch) {
      if (![1, 4, 6].includes(touch)) return [];
      if (!body.toLowerCase().includes('constant contact')) {
        return [`T${touch} is a thread opener but "Constant Contact" not found — must name explicitly, never "a major email company"`];
      }
      return [];
    }
  },

  {
    id: 'ctct-outcome-in-opener',
    name: 'Thread openers (T1, T4, T6) must state the specific outcome (record year + timeframe)',
    touchFilter: (t) => [1, 4, 6].includes(t),
    check(body, touch) {
      if (![1, 4, 6].includes(touch)) return [];
      const hasOutcome = /record (financial )?year/i.test(body) ||
                         /record year/i.test(body) ||
                         /best financial year/i.test(body);
      if (!hasOutcome) {
        return [`T${touch} is a thread opener but missing specific outcome — must include "record financial year" or "record year"`];
      }
      return [];
    }
  },

  {
    id: 'word-count',
    name: 'Word count by touch (T1: 50-100w, T2-T3: 20-35w, breakup T9: 20-30w)',
    touchFilter: null,
    check(body, touch) {
      if (!touch) return [];
      const words = body.trim().split(/\s+/).filter(w => w.length > 0).length;
      const limits = {
        1: { min: 25, max: 100, label: 'T1 (25-100w)' },
        2: { min: 12, max: 40, label: 'T2 reply (12-40w)' },
        3: { min: 15, max: 45, label: 'T3 reply (15-45w)' },
        4: { min: 30, max: 80, label: 'T4 (30-80w)' },
        5: { min: 20, max: 55, label: 'T5 reply (20-55w)' },
        6: { min: 30, max: 80, label: 'T6 (30-80w)' },
        7: { min: 15, max: 45, label: 'T7 reply (15-45w)' },
        8: { min: 20, max: 55, label: 'T8 (20-55w)' },
        9: { min: 12, max: 40, label: 'T9 (12-40w)' },
      };
      const limit = limits[touch];
      if (!limit) return [];
      if (words < limit.min) {
        return [`${limit.label}: ${words} words — too short (min ${limit.min})`];
      }
      if (words > limit.max) {
        return [`${limit.label}: ${words} words — too long (max ${limit.max})`];
      }
      return [];
    }
  },

  {
    id: 'no-passive-cta',
    name: 'No passive CTAs — must be direct yes/no ask',
    touchFilter: null,
    check(body) {
      const passivePatterns = [
        'happy to share',
        'happy to walk',
        'happy to show',
        'reply and i\'ll send',
        'would this be useful',
        'worth a conversation',
        'worth comparing notes',
        'let me know if',
        'feel free to',
      ];
      const lc = body.toLowerCase();
      return passivePatterns
        .filter(p => lc.includes(p))
        .map(p => `Passive CTA found: "${p}" — use "Open to..." or "Interested in..." pattern`);
    }
  },

  {
    id: 'no-redundant-sig-url',
    name: 'Signature must not have separate URL line — use FractionalCPO.com in title',
    touchFilter: null,
    check(body) {
      // Check for standalone fractionalcpo.com on its own line (not part of email or "@ FractionalCPO.com")
      const lines = body.split('\n').map(l => l.trim());
      for (const line of lines) {
        if (/^fractionalcpo\.com$/i.test(line)) {
          return ['Redundant URL line "fractionalcpo.com" — use "@ FractionalCPO.com" in title line instead'];
        }
      }
      return [];
    }
  },

  {
    id: 'every-touch-ctct',
    name: 'Every touch must reference Constant Contact',
    touchFilter: null,
    check(body, touch) {
      if (!touch) return [];
      if (!body.toLowerCase().includes('constant contact')) {
        return [`T${touch}: No Constant Contact reference — every touch needs CTCT for authority`];
      }
      return [];
    }
  },

  {
    id: 'no-double-question',
    name: 'No two questions back to back before CTA',
    touchFilter: null,
    check(body) {
      const lines = body.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const lastFour = lines.slice(-4);
      const questionLines = lastFour.filter(l => l.endsWith('?'));
      if (questionLines.length >= 2) {
        return [`${questionLines.length} questions in last 4 lines — CTA should be the ONLY question at the end`];
      }
      return [];
    }
  },

  {
    id: 'no-insider-timeline',
    name: 'No specific timelines for PE/warm contacts',
    touchFilter: null,
    check(body) {
      const patterns = [
        /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+(month|week)s?\b/gi,
        /\b\d+\s+(month|week)s?\b/gi,
      ];
      const violations = [];
      for (const pattern of patterns) {
        for (const m of [...body.matchAll(pattern)]) {
          // Allow "15 minutes" — only flag month/week/quarter timelines
          violations.push(`Specific timeline "${m[0]}" found — use "months" instead to avoid revealing insider knowledge`);
        }
      }
      return violations;
    }
  },

  {
    id: 'no-ad-hoc-dis',
    name: 'No implied criticism of their process',
    touchFilter: null,
    check(body) {
      const patterns = ['ad hoc', 'figured out later', 'still happens', 'if at all', 'gets solved company by company'];
      const lc = body.toLowerCase();
      return patterns
        .filter(p => lc.includes(p))
        .map(p => `Implied process criticism: "${p}" — don't criticize how they do things`);
    }
  },

  {
    id: 'no-throwaway-sentence',
    name: 'No throwaway/filler sentences',
    touchFilter: null,
    check(body) {
      const patterns = ['worth comparing notes', 'part of the equation', 'compare notes if', 'if this is relevant'];
      const lc = body.toLowerCase();
      return patterns
        .filter(p => lc.includes(p))
        .map(p => `Throwaway filler: "${p}" — every sentence must earn its place`);
    }
  },

  {
    id: 'no-low-value-cta',
    name: 'No low-value CTA signals',
    touchFilter: null,
    check(body) {
      const lowValue = [
        'walk through what we saw',
        'walk you through',
        'compare notes',
        'show you what we',
      ];
      const lc = body.toLowerCase();
      return lowValue
        .filter(p => lc.includes(p))
        .map(p => `Low-value CTA signal: "${p}" — use "how we did it" or "what this looked like" instead`);
    }
  },

  {
    id: 'no-missing-data-fields',
    name: 'All custom fields defined in Reply.io must have values — empty fields block sends',
    touchFilter: null,
    check(body, touch) {
      // This is a reminder rule — can't check Reply.io from CLI
      // But flag if {{pain}} or other optional variables appear in copy without data plan
      return [];
    }
  },

  {
    id: 'no-fractional',
    name: 'No "fractional" in copy (PE audience ban)',
    touchFilter: null,
    check(body) {
      const matches = [...body.matchAll(/\bfractional\b/gi)];
      return matches.map(m => `"fractional" found: "${getContext(body, m.index, 30)}". Use "product leadership firm" or "product leadership service" instead.`);
    }
  },

  {
    id: 'no-prep-needed',
    name: 'No "no prep needed" or variants',
    touchFilter: null,
    check(body) {
      const banned = ['no prep needed', 'no preparation needed', 'no prep required', 'no preparation required'];
      return banned
        .filter(p => body.toLowerCase().includes(p))
        .map(p => `Banned phrase found: "${p}"`);
    }
  },

  {
    id: 'signature-line-break',
    name: 'Signature must have line break between name and title',
    touchFilter: (t) => t === 1 || t === 4 || t === 6 || t === 8,
    check(body) {
      const violations = [];
      if (/Cunningham[^\S\n]+(?:Partner|Operating Partner)/i.test(body)) {
        violations.push('Signature missing line break between name and title. Use line break between "Courtney Cunningham" and "Partner @ FractionalCPO.com"');
      }
      return violations;
    }
  },

  {
    id: 'sign-off-format',
    name: 'Sign-off format (T1/4/6/8 = full sig, T2/3/5/7/9 = short sig)',
    touchFilter: null,
    check(body, touch) {
      if (!touch) return [];
      const newThreadTouches = [1, 4, 6, 8];
      const replyTouches = [2, 3, 5, 7, 9];
      const hasFullSig = /FractionalCPO|fractionalcpo\.com/i.test(body);
      // Short sig = "Name" alone, or "Name @ FractionalCPO" / "Name @ FractionalCPO.com" on one line
      const hasShortSig = /^\w+ @ FractionalCPO(\.com)?\s*$/mi.test(body) || /^(Vahid|Courtney)\s*$/m.test(body);
      // Full sig = multi-line with name + title line (e.g., "Courtney Cunningham\nPartner @ FractionalCPO.com")
      const hasMultiLineSig = /^(Vahid Jozi|Courtney Cunningham)\s*\n.*FractionalCPO/mi.test(body);

      if (newThreadTouches.includes(touch)) {
        if (!hasFullSig) {
          return [`T${touch} is a new thread — needs full signature (Name / Title @ FractionalCPO.com)`];
        }
      }
      if (replyTouches.includes(touch)) {
        // Reply touches should NOT have multi-line full sig. Short sig or name-only is fine.
        if (hasMultiLineSig) {
          return [`T${touch} is a reply — use "[Name]" or "[Name] @ FractionalCPO" not full multi-line signature`];
        }
      }
      return [];
    }
  },
];

// ─── EVALUATOR ───────────────────────────────────────────────────────────────

function evalTouch(touchNum, body, subject) {
  const results = { touch: touchNum, violations: [], passed: [] };

  // Check subject line separately for em dashes and special chars
  if (subject) {
    const subjRules = RULES.filter(r => ['no-em-dash'].includes(r.id));
    for (const rule of subjRules) {
      const violations = rule.check(subject, touchNum);
      if (violations.length > 0) {
        results.violations.push({ rule: `${rule.id}-subject`, label: `${rule.name} [SUBJECT LINE]`, issues: violations.map(v => `[Subject] ${v}`) });
      }
    }
  }

  for (const rule of RULES) {
    if (rule.touchFilter && !rule.touchFilter(touchNum)) {
      results.passed.push(`${rule.id} (skipped — not applicable to T${touchNum})`);
      continue;
    }
    const violations = rule.check(body, touchNum);
    if (violations.length > 0) {
      results.violations.push({ rule: rule.id, label: rule.name, issues: violations });
    } else {
      results.passed.push(rule.id);
    }
  }
  return results;
}

function printResults(results, verbose = false) {
  const { touch, violations, passed } = results;
  const label = touch ? `T${touch}` : 'Copy';

  if (violations.length === 0) {
    console.log(`✓ ${label}: All checks passed (${passed.filter(p => !p.includes('skipped')).length} rules)`);
    return 0;
  }

  console.log(`✗ ${label}: ${violations.length} violation${violations.length > 1 ? 's' : ''} found\n`);
  for (const v of violations) {
    console.log(`  [${v.rule}] ${v.label}`);
    for (const issue of v.issues) {
      console.log(`    → ${issue}`);
    }
  }
  if (verbose) {
    console.log(`\n  Passed: ${passed.filter(p => !p.includes('skipped')).join(', ')}`);
  }
  return 1;
}

// ─── TEST FIXTURES ───────────────────────────────────────────────────────────

const FIXTURES = [
  // Should FAIL
  {
    name: 'em dash violation',
    touch: 1,
    body: 'Constant Contact had a record financial year — we helped them get there. Worth 15 minutes?',
    expectViolations: ['no-em-dash'],
  },
  {
    name: 'quick call violation',
    touch: 1,
    body: 'Are you free for a quick call this week? We helped Constant Contact have a record financial year.',
    expectViolations: ['no-quick-call'],
  },
  {
    name: 'booking link in T1 (banned)',
    touch: 1,
    body: 'Constant Contact had a record financial year. We helped them get there. Worth 15 minutes? [Grab a time here]',
    expectViolations: ['booking-link-by-touch'],
  },
  {
    name: 'missing booking link in T4',
    touch: 4,
    body: 'Hi {{firstName}}, we helped Constant Contact have a record financial year. Worth 15 minutes this week?',
    expectViolations: ['booking-link-by-touch'],
  },
  {
    name: '"still" in T2',
    touch: 2,
    body: '{{firstName}}, are you still interested in the approach we used at Constant Contact?',
    expectViolations: ['no-still'],
  },
  {
    name: '"a decade" violation',
    touch: 4,
    body: 'Hi {{firstName}}, we reversed over a decade of decline at Constant Contact. Is this worth 15 minutes? [Grab a time here]',
    expectViolations: ['no-a-decade', 'ctct-outcome-in-opener'],
  },
  {
    name: 'declarative trigger opener',
    touch: 4,
    body: 'Hi {{firstName}},\n\nSaw {{company}} just raised a Series B. We helped Constant Contact have a record financial year. Is this worth 15 minutes? [Grab a time here]\n\nVahid Jozi\nPartner, FractionalCPO\nfractionalcpo.com',
    expectViolations: ['no-declarative-trigger-opener'],
  },
  {
    name: '"product org" violation',
    touch: 1,
    body: 'Constant Contact had a record financial year because we fixed the product org. Is this worth 15 minutes?',
    expectViolations: ['no-product-org'],
  },
  {
    name: 'third-person company framing',
    touch: 4,
    body: 'Hi {{firstName}},\n\nHow is product leadership at {{company}} being set up to close the NRR gap?\n\nConstant Contact just had their best financial year for the current management team. We helped them get there.\n\nIs this worth 15 minutes? [Grab a time here]\n\nVahid Jozi\nPartner, FractionalCPO\nfractionalcpo.com',
    expectViolations: ['no-third-person-company'],
  },
  {
    name: 'passive CTA violation',
    touch: 2,
    body: '{{firstName}}, Constant Contact had a record financial year. Happy to share what we learned.\n\nCourtney',
    expectViolations: ['no-passive-cta'],
  },
  {
    name: 'redundant sig URL violation',
    touch: 1,
    body: 'Constant Contact had a record financial year. We helped them get there.\n\nIs this worth 15 minutes?\n\nCourtney Cunningham\nPartner @ FractionalCPO\nfractionalcpo.com',
    expectViolations: ['no-redundant-sig-url'],
  },
  {
    name: 'missing CTCT in reply touch',
    touch: 2,
    body: '{{firstName}}, most email platforms hit a ceiling where product stops driving revenue.\n\nOpen to 15 minutes?\n\nCourtney',
    expectViolations: ['every-touch-ctct'],
  },
  {
    name: 'double question before CTA',
    touch: 1,
    body: 'Is product leadership a deliberate lever?\n\nCan we get 15 minutes this week?\n\nCourtney',
    expectViolations: ['no-double-question'],
  },
  {
    name: 'insider timeline violation',
    touch: 1,
    body: 'Constant Contact had a record financial year. Four months. No new product builds.\n\nCourtney',
    expectViolations: ['no-insider-timeline'],
  },
  {
    name: 'ad hoc criticism violation',
    touch: 1,
    body: 'Constant Contact had a record financial year. Product leadership still happens ad hoc per company.\n\nCourtney',
    expectViolations: ['no-ad-hoc-dis'],
  },
  {
    name: 'throwaway sentence violation',
    touch: 1,
    body: 'Constant Contact had a record financial year. Worth comparing notes if product leadership is part of the equation.\n\nCourtney',
    expectViolations: ['no-throwaway-sentence'],
  },
  {
    name: 'low-value CTA violation',
    touch: 1,
    body: 'Constant Contact had a record financial year. Open to 15 minutes to walk you through what we did?\n\nCourtney Cunningham\nPartner @ FractionalCPO.com',
    expectViolations: ['no-low-value-cta'],
  },
  {
    name: 'signature line break - fail (no break)',
    touch: 1,
    body: 'Hi FirstName,\n\nBody text.\n\nCourtney Cunningham Partner @ FractionalCPO.com',
    expectViolations: ['signature-line-break'],
  },
  {
    name: 'signature line break - pass (short sig on T2)',
    touch: 2,
    body: 'FirstName, Constant Contact had a record financial year. Open to hearing how we approached it?\n\nCourtney @ FractionalCPO.com',
    expectViolations: [],
  },
  // Should PASS
  {
    name: 'T4 with raw booking URL (plain text mode)',
    touch: 4,
    body: 'Hi {{firstName}},\n\nHow is your product leadership being set up to close the NRR gap?\n\nConstant Contact just had their best financial year for the current management team. We helped them get there.\n\nOpen to 15 minutes on how we did it? https://cal.com/fractionalcpo/15min\n\nCourtney Cunningham\nPartner @ FractionalCPO.com',
    expectViolations: [],
  },
  {
    name: 'T2 reply with short sig (Name @ FractionalCPO)',
    touch: 2,
    body: '{{firstName}}, Constant Contact had a record financial year. Open to hearing how we approached it?\n\nCourtney @ FractionalCPO',
    expectViolations: [],
  },
  {
    name: 'em dash in subject line (should fail)',
    touch: 1,
    subject: 'Product leadership at {{Company}} — worth 15 min?',
    body: 'Constant Contact had a record financial year in 2025. We helped them get there.\n\nIs this worth 15 minutes this week?\n\nCourtney Cunningham\nPartner @ FractionalCPO.com',
    expectViolations: ['no-em-dash-subject'],
  },
  {
    name: 'clean subject line (should pass)',
    touch: 1,
    subject: '{{FirstName}}, product closing the NRR gap?',
    body: 'Constant Contact had a record financial year in 2025. We helped them get there.\n\nIs this worth 15 minutes this week?\n\nCourtney Cunningham\nPartner @ FractionalCPO.com',
    expectViolations: [],
  },
  {
    name: '"fractional" in body (should fail)',
    touch: 1,
    body: 'We are a fractional product leadership firm. Constant Contact had a record financial year.\n\nIs this worth 15 minutes?\n\nCourtney Cunningham\nPartner @ FractionalCPO.com',
    expectViolations: ['no-fractional'],
  },
  {
    name: 'no-prep-needed violation',
    touch: 4,
    body: 'Hi {{FirstName}},\n\nNo prep needed. Constant Contact had a record year.\n\nIs this worth 15 minutes? [Grab a time here]\n\nCourtney Cunningham\nPartner @ FractionalCPO.com',
    expectViolations: ['no-prep-needed'],
  },
  {
    name: 'clean T1',
    touch: 1,
    body: 'Constant Contact had a record financial year in 2025. We helped them get there. Best product growth month in 11 years.\n\nIs this worth 15 minutes this week?\n\nCourtney Cunningham\nPartner @ FractionalCPO.com',
    expectViolations: [],
  },
  {
    name: 'clean T4 with trigger',
    touch: 4,
    body: 'Hi {{firstName}},\n\nHow is your product leadership being set up to close the NRR gap over the last five quarters?\n\nConstant Contact just had their best financial year for the current management team. We helped them get there in a few months.\n\nIs this worth 15 minutes? [Grab a time here]\n\nCourtney Cunningham\nPartner @ FractionalCPO.com',
    expectViolations: [],
  },
];

function runTests() {
  console.log('Running copy-eval test fixtures...\n');
  let passed = 0;
  let failed = 0;

  for (const fixture of FIXTURES) {
    const results = evalTouch(fixture.touch, fixture.body, fixture.subject);
    const foundViolationIds = results.violations.map(v => v.rule);

    const expectedToFail = fixture.expectViolations.length > 0;
    const didFail = results.violations.length > 0;
    const allExpectedFound = fixture.expectViolations.every(id => foundViolationIds.includes(id));
    const noUnexpected = foundViolationIds.every(id =>
      fixture.expectViolations.includes(id) || fixture.expectViolations.length === 0
    );

    let ok = false;
    if (!expectedToFail && !didFail) ok = true;
    if (expectedToFail && allExpectedFound) ok = true;

    if (ok) {
      console.log(`  ✓ ${fixture.name}`);
      passed++;
    } else {
      console.log(`  ✗ ${fixture.name}`);
      if (expectedToFail && !allExpectedFound) {
        const missing = fixture.expectViolations.filter(id => !foundViolationIds.includes(id));
        console.log(`    Expected violations not found: ${missing.join(', ')}`);
      }
      if (!expectedToFail && didFail) {
        console.log(`    Unexpected violations: ${foundViolationIds.join(', ')}`);
      }
      failed++;
    }
  }

  console.log(`\n${passed}/${passed + failed} fixtures passed`);
  return failed === 0 ? 0 : 1;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

const opts = parseArgs(args);

if (opts.touch !== undefined && (isNaN(opts.touch) || opts.touch < 1 || opts.touch > 9)) {
  console.error('Error: --touch must be 1-9');
  process.exit(2);
}

if (opts.test) {
  process.exit(runTests());
}

if (opts.all && opts.input) {
  const fs = require('fs');
  const sequence = JSON.parse(fs.readFileSync(opts.input, 'utf8'));
  let totalViolations = 0;
  for (const touch of sequence.touches) {
    const results = evalTouch(touch.num, touch.body);
    totalViolations += results.violations.length;
    printResults(results);
    console.log('');
  }
  process.exit(totalViolations > 0 ? 1 : 0);
}

if (opts.body !== undefined && opts.touch !== undefined) {
  const results = evalTouch(opts.touch, opts.body, opts.subject);
  const code = printResults(results, true);
  process.exit(code);
}

// No args — print usage
console.log(`
copy-eval.js — FractionalCPO Cold Email Copy Checker

Usage:
  node copy-eval.js --touch N --body "email body text"
  node copy-eval.js --touch N --subject "subject line" --body "email body text"
  node copy-eval.js --all --input sequence.json
  node copy-eval.js --test

Options:
  --touch N         Touch number (1-9)
  --body "..."      Email body text
  --subject "..."   Subject line (checked for em dashes, encoding issues)
  --all           Check a full sequence from JSON file
  --input file    JSON file: { "touches": [{ "num": 1, "body": "..." }] }
  --test          Run built-in fixture tests

Exit code: 0 = pass, 1 = violations found
`);
process.exit(0);
