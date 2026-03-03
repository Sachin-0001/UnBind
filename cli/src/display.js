import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';

// ─── Banner ───────────────────────────────────────────────────────────────────

export function printBanner() {
  const I = chalk.hex('#6366f1'); // indigo — matches the SVG logo stroke colour

  // ASCII globe — reproduces the SVG's outer circle, vertical meridian,
  // horizontal equator, and the two offset elliptical longitude curves (╮╭/╯╰)
  const globe = [
    I('  ╭─────╮  '),
    I(' ╱ ╮   ╭ ╲ '),
    I('│  │   │  │'),
    I('├──┼───┼──┤'),
    I('│  │   │  │'),
    I(' ╲ ╯   ╰ ╱ '),
    I('  ╰─────╯  '),
  ];

  // "UNBIND" in bold-cyan block letters (6 rows)
  const word = [
    chalk.bold.cyan(' ██╗   ██╗███╗   ██╗██████╗ ██╗███╗   ██╗██████╗ '),
    chalk.bold.cyan(' ██║   ██║████╗  ██║██╔══██╗██║████╗  ██║██╔══██╗'),
    chalk.bold.cyan(' ██║   ██║██╔██╗ ██║██████╔╝██║██╔██╗ ██║██║  ██║'),
    chalk.bold.cyan(' ██║   ██║██║╚██╗██║██╔══██╗██║██║╚██╗██║██║  ██║'),
    chalk.bold.cyan(' ╚██████╔╝██║ ╚████║██████╔╝██║██║ ╚████║██████╔╝'),
    chalk.bold.cyan('  ╚═════╝ ╚═╝  ╚═══╝╚═════╝ ╚═╝╚═╝  ╚═══╝╚═════╝ '),
  ];

  // Globe has 7 rows; globe[0] is the top-cap that floats above the word block,
  // then globe[1-6] are zipped side-by-side with word[0-5].
  const lines = [
    globe[0],
    globe[1] + word[0],
    globe[2] + word[1],
    globe[3] + word[2],
    globe[4] + word[3],
    globe[5] + word[4],
    globe[6] + word[5],
  ];

  const divider = chalk.dim('━'.repeat(62));
  const tagline =
    chalk.white('     AI-powered legal contract analysis  ') +
    chalk.cyan.bold('CLI');

  console.log('\n' + lines.join('\n') + '\n' + divider + '\n' + tagline + '\n' + divider + '\n');
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function createSpinner(text) {
  return ora({ text, color: 'cyan', spinner: 'dots2' });
}

// ─── Risk helpers ─────────────────────────────────────────────────────────────

const RISK_STYLES = {
  High: { badge: chalk.bgRed.white.bold, text: chalk.red },
  Medium: { badge: chalk.bgYellow.black.bold, text: chalk.yellow },
  Low: { badge: chalk.bgGreen.black.bold, text: chalk.green },
  Negligible: { badge: chalk.bgGray.white, text: chalk.gray },
  'No Risk': { badge: chalk.bgBlue.white, text: chalk.blue },
};

function getRiskStyle(level) {
  return RISK_STYLES[level] || RISK_STYLES['Negligible'];
}

export function riskBadge(level) {
  return getRiskStyle(level).badge(` ${level} `);
}

export function riskColor(level) {
  return getRiskStyle(level).text;
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

/** Truncates and normalises whitespace in a string. */
function truncate(text, max = 100) {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max) + '…' : clean;
}

/** Wraps long text at `width` characters (simple word-wrap). */
function wordWrap(text, width = 80, indent = '  ') {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    if ((line + word).length > width) {
      if (line) lines.push(indent + line.trimEnd());
      line = word + ' ';
    } else {
      line += word + ' ';
    }
  }
  if (line.trim()) lines.push(indent + line.trimEnd());
  return lines.join('\n');
}

function sectionHeader(icon, title) {
  const line = '─'.repeat(Math.min(title.length + 4, 58));
  console.log('\n' + chalk.bold.cyan(`  ${icon}  ${title}`));
  console.log(chalk.dim(`  ${line}`));
}

// ─── View renderers ───────────────────────────────────────────────────────────

/**
 * 1. Summarize
 */
export function printSummary(analysisResult) {
  sectionHeader('📄', 'Summary');
  const summary = analysisResult?.summary || 'No summary available.';
  console.log('\n' + wordWrap(summary, 80, '  ') + '\n');
}

/**
 * 2. Translate to plain English
 *    Shows every clause's simplified explanation, colour-coded by risk.
 */
export function printPlainEnglish(analysisResult) {
  sectionHeader('📖', 'Plain English Translation');
  const clauses = analysisResult?.clauses || [];

  if (clauses.length === 0) {
    console.log(chalk.gray('\n  No clauses found.\n'));
    return;
  }

  clauses.forEach((clause, i) => {
    const num = chalk.dim(`  ${String(i + 1).padStart(2)}.`);
    const badge = riskBadge(clause.riskLevel);
    const preview = chalk.dim(truncate(clause.clauseText, 70));
    const explanation = riskColor(clause.riskLevel)(clause.simplifiedExplanation || '');

    console.log(`\n${num} ${badge}  ${preview}`);
    console.log(wordWrap('→ ' + explanation, 80, '       '));
  });
  console.log();
}

/**
 * 4. Extract clauses
 *    Full clause detail with risk reasoning and negotiation tip.
 */
export function printClauses(analysisResult) {
  sectionHeader('📋', 'Contract Clauses');
  const clauses = analysisResult?.clauses || [];

  if (clauses.length === 0) {
    console.log(chalk.gray('\n  No clauses found.\n'));
    return;
  }

  clauses.forEach((clause, i) => {
    const badge = riskBadge(clause.riskLevel);
    const colorFn = riskColor(clause.riskLevel);

    console.log(`\n  ${chalk.bold(`Clause ${i + 1}`)}  ${badge}`);

    // Original clause text (truncated)
    if (clause.clauseText) {
      console.log(chalk.dim(wordWrap(truncate(clause.clauseText, 160), 80, '  │  ')));
    }

    // Plain-English explanation
    if (clause.simplifiedExplanation) {
      console.log(colorFn(wordWrap(clause.simplifiedExplanation, 80, '  ✦  ')));
    }

    // Risk / negotiation — skip for no-risk clauses
    if (clause.riskLevel !== 'No Risk' && clause.riskLevel !== 'Negligible') {
      if (clause.riskReason) {
        console.log(chalk.yellow(wordWrap('⚠  ' + clause.riskReason, 80, '     ')));
      }
      if (
        clause.negotiationSuggestion &&
        clause.negotiationSuggestion !== 'No changes needed'
      ) {
        console.log(chalk.green(wordWrap('💡 ' + clause.negotiationSuggestion, 80, '     ')));
      }
    }
  });

  // Summary bar
  const counts = { High: 0, Medium: 0, Low: 0, Negligible: 0, 'No Risk': 0 };
  clauses.forEach((c) => {
    const k = c.riskLevel in counts ? c.riskLevel : 'Negligible';
    counts[k]++;
  });

  const bar = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .map(([level, n]) => riskColor(level)(`${n} ${level}`))
    .join(chalk.dim('  ·  '));

  console.log('\n' + chalk.dim('  ─────────────────'));
  console.log(`  ${bar}\n`);
}

/**
 * AI Q&A response (used by "Ask a question").
 */
export function printAIResponse(result) {
  sectionHeader('🤖', 'AI Answer');
  const text =
    typeof result === 'string'
      ? result
      : result?.result || result?.answer || JSON.stringify(result, null, 2);

  console.log('\n' + wordWrap(text, 80, '  ') + '\n');
}
