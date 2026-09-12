import { createTopic, type Subject, type Topic } from "./subjects.ts";
import type { ExamBoardId } from "./exam-boards.ts";

export type CoverageStatus = "board-mapped" | "cross-board";
export type CurriculumPathway = { boardId: ExamBoardId; code: string; status: CoverageStatus; topics: Topic[] };
export type TopicMatchStatus = "exact" | "confident" | "ambiguous" | "none";
export type CurriculumTopicMatch = {
  topic: Topic | null;
  pathway: CurriculumPathway;
  status: TopicMatchStatus;
  confidence: number;
  matchedBy: string | null;
  suggestions: Topic[];
};

type BoardTitles = Partial<Record<ExamBoardId, string[]>>;

const pathways: Partial<Record<string, BoardTitles>> = {
  psychology: {
    aqa: ["Social Influence", "Memory", "Attachment", "Psychopathology", "Approaches in Psychology", "Biopsychology", "Research Methods", "Issues and Debates", "Relationships", "Gender", "Cognition and Development", "Schizophrenia", "Eating Behaviour", "Stress", "Aggression", "Forensic Psychology", "Addiction"],
    edexcel: ["Social Psychology", "Cognitive Psychology", "Biological Psychology", "Learning Theories", "Issues and Debates", "Clinical Psychology", "Criminological Psychology", "Child Psychology", "Health Psychology", "Psychological Skills", "Research Methods"],
    ocr: ["Research Methods", "Core Studies", "Areas and Perspectives", "Issues and Debates", "Mental Health", "Child Psychology", "Criminal Psychology", "Environmental Psychology", "Sport and Exercise Psychology"],
    eduqas: ["Biological Approach", "Psychodynamic Approach", "Behaviourist Approach", "Cognitive Approach", "Positive Approach", "Research Methods", "Contemporary Debates", "Applications of Psychology", "Personal Investigation"],
    wjec: ["Biological Approach", "Psychodynamic Approach", "Behaviourist Approach", "Cognitive Approach", "Positive Approach", "Research Methods", "Controversies in Psychology", "Applications of Psychology", "Personal Investigation"],
    ccea: ["Social Psychology", "Cognitive Psychology", "Developmental Psychology", "Biological Psychology", "Individual Differences", "Research Methods", "Clinical Psychology", "Health Psychology", "Applied Psychology", "Issues and Debates"],
  },
  biology: {
    aqa: ["Biological Molecules", "Cells", "Organisms Exchange Substances with Their Environment", "Genetic Information Variation and Relationships", "Energy Transfers in and Between Organisms", "Organisms Respond to Changes", "Genetics Populations Evolution and Ecosystems", "Control of Gene Expression", "Practical and Mathematical Skills"],
    edexcel: ["Lifestyle Health and Risk", "Genes and Health", "Voice of the Genome", "Biodiversity and Natural Resources", "On the Wild Side", "Immunity Infection and Forensics", "Run for Your Life", "Grey Matter", "Core Practical Skills"],
    ocr: ["Development of Practical Skills", "Foundations in Biology", "Exchange and Transport", "Biodiversity Evolution and Disease", "Communication Homeostasis and Energy", "Genetics Evolution and Ecosystems"],
    eduqas: ["Cell Structure and Organisation", "Biological Compounds", "Cell Membranes and Transport", "Enzymes and Metabolism", "Genetic Information", "Biodiversity and Evolution", "Physiology and Homeostasis", "Energy for Life", "Microbiology and Disease", "Practical Skills"],
  },
  chemistry: {
    aqa: ["Atomic Structure", "Amount of Substance", "Bonding", "Energetics", "Kinetics", "Chemical Equilibria and Le Chatelier's Principle", "Oxidation Reduction and Redox Equations", "Thermodynamics", "Rate Equations", "Equilibrium Constant Kp", "Electrode Potentials and Electrochemical Cells", "Acids and Bases", "Periodicity", "Group 2", "Group 7", "Properties of Period 3 Elements and Oxides", "Transition Metals", "Reactions of Ions in Aqueous Solution", "Introduction to Organic Chemistry", "Alkanes", "Halogenoalkanes", "Alkenes", "Alcohols", "Organic Analysis", "Optical Isomerism", "Aldehydes and Ketones", "Carboxylic Acids and Derivatives", "Aromatic Chemistry", "Amines", "Polymers", "Amino Acids Proteins and DNA", "Organic Synthesis", "NMR Spectroscopy", "Chromatography"],
    edexcel: ["Atomic Structure and the Periodic Table", "Bonding and Structure", "Redox I", "Inorganic Chemistry and the Periodic Table", "Formulae Equations and Amounts", "Organic Chemistry I", "Modern Analytical Techniques I", "Energetics I", "Kinetics I", "Equilibrium I", "Equilibrium II", "Acid-base Equilibria", "Energetics II", "Redox II", "Transition Metals", "Kinetics II", "Organic Chemistry II", "Organic Chemistry III", "Modern Analytical Techniques II", "Core Practical Skills"],
    ocr: ["Development of Practical Skills", "Foundations in Chemistry", "Periodic Table and Energy", "Core Organic Chemistry", "Physical Chemistry and Transition Elements", "Organic Chemistry and Analysis"],
    eduqas: ["Formulae and Equations", "Atomic Structure", "Chemical Calculations", "Bonding and Structure", "Solid Structures", "Periodicity", "Energetics", "Kinetics", "Equilibria", "Redox and Electrochemistry", "Organic Chemistry", "Analytical Chemistry", "Practical Skills"],
  },
  physics: {
    aqa: ["Measurements and Their Errors", "Particles and Radiation", "Waves", "Mechanics and Materials", "Electricity", "Further Mechanics and Thermal Physics", "Fields and Their Consequences", "Nuclear Physics", "Astrophysics", "Medical Physics", "Engineering Physics", "Turning Points in Physics", "Electronics"],
    edexcel: ["Working as a Physicist", "Mechanics", "Electric Circuits", "Materials", "Waves and Particle Nature of Light", "Further Mechanics", "Electric and Magnetic Fields", "Nuclear and Particle Physics", "Thermodynamics", "Space", "Nuclear Radiation", "Gravitational Fields", "Oscillations", "Practical Skills"],
    ocr: ["Development of Practical Skills", "Foundations of Physics", "Forces and Motion", "Electrons Waves and Photons", "Newtonian World and Astrophysics", "Particles and Medical Physics"],
    eduqas: ["Basic Physics", "Kinematics", "Dynamics", "Energy Concepts", "Solids Under Stress", "Waves", "Electricity", "Circular Motion", "Thermal Physics", "Electric and Magnetic Fields", "Nuclear Physics", "Oscillations", "Practical Skills"],
  },
  maths: {
    aqa: ["Proof", "Algebra and Functions", "Coordinate Geometry", "Sequences and Series", "Trigonometry", "Exponentials and Logarithms", "Differentiation", "Integration", "Numerical Methods", "Vectors", "Statistical Sampling", "Data Presentation and Interpretation", "Probability", "Statistical Distributions", "Statistical Hypothesis Testing", "Quantities and Units in Mechanics", "Kinematics", "Forces and Newton's Laws", "Moments"],
    edexcel: ["Proof", "Algebra and Functions", "Coordinate Geometry", "Sequences and Series", "Trigonometry", "Exponentials and Logarithms", "Differentiation", "Integration", "Numerical Methods", "Vectors", "Statistical Sampling", "Data Presentation and Interpretation", "Probability", "Statistical Distributions", "Statistical Hypothesis Testing", "Kinematics", "Forces and Newton's Laws", "Moments"],
    ocr: ["Proof", "Algebra", "Graphs and Functions", "Sequences and Series", "Trigonometry", "Exponentials and Logarithms", "Differentiation", "Integration", "Numerical Methods", "Vectors", "Probability and Statistics", "Statistical Distributions", "Hypothesis Testing", "Kinematics", "Forces", "Moments"],
  },
  business: {
    aqa: ["What is Business", "Managers Leadership and Decision Making", "Decision Making to Improve Marketing Performance", "Decision Making to Improve Operational Performance", "Decision Making to Improve Financial Performance", "Decision Making to Improve Human Resource Performance", "Analysing the Strategic Position of a Business", "Choosing Strategic Direction", "Strategic Methods", "Managing Strategic Change"],
    edexcel: ["Marketing and People", "Managing Business Activities", "Business Decisions and Strategy", "Global Business"],
    ocr: ["The Business Environment", "Working in Business", "Business Decisions", "Change Management", "Marketing", "Finance", "Human Resources", "Operations Management", "Strategic Positioning"],
    eduqas: ["Business Opportunities", "Business Functions", "Business Analysis and Strategy", "Business in a Changing World"],
  },
};

const boardCodes: Record<ExamBoardId, string> = { aqa: "AQA", edexcel: "Pearson Edexcel", ocr: "OCR", eduqas: "Eduqas", wjec: "WJEC", ccea: "CCEA" };

export function getBoardCurriculum(subject: Subject, boardId: ExamBoardId): CurriculumPathway {
  const titles = pathways[subject.slug]?.[boardId];
  if (!titles) return { boardId, code: `${boardCodes[boardId]} cross-board overview`, status: "cross-board", topics: subject.topics };
  const existing = new Map(subject.topics.map((topic) => [normalise(topic.title), topic]));
  const topics = titles.map((title, index) => existing.get(normalise(title)) ?? createTopic(subject.name, title, index));
  return { boardId, code: `${boardCodes[boardId]} mapped pathway`, status: "board-mapped", topics };
}

const topicAliases: Partial<Record<string, Record<string, string[]>>> = {
  psychology: {
    "issues-and-debates": ["issues debates", "psychology debates", "nature nurture", "free will determinism", "holism reductionism", "idiographic nomothetic", "gender bias", "cultural bias", "social sensitivity"],
    "research-methods": ["research methods", "experimental design", "sampling methods", "reliability validity", "inferential testing"],
    psychopathology: ["abnormality", "phobias depression ocd"],
    biopsychology: ["biological rhythms", "nervous system endocrine system", "localisation lateralisation"],
  },
};

const ignoredTokens = new Set(["about", "and", "answer", "board", "could", "course", "define", "exam", "explain", "for", "help", "level", "please", "question", "revision", "revise", "show", "study", "subject", "teach", "the", "topic", "understand", "what", "with"]);

export function findCurriculumTopic(subject: Subject, boardId: ExamBoardId, question: string): CurriculumTopicMatch {
  const pathway = getBoardCurriculum(subject, boardId);
  const query = normalise(question);
  if (!query) return { topic: null, pathway, status: "none", confidence: 0, matchedBy: null, suggestions: pathway.topics.slice(0, 5) };

  const phrasesFor = (topic: Topic) => [normalise(topic.title), ...(topicAliases[subject.slug]?.[topic.slug] ?? []).map(normalise)]
    .filter((phrase, index, values) => phrase.length >= 3 && values.indexOf(phrase) === index);
  const exactCandidates = pathway.topics
    .flatMap((topic) => phrasesFor(topic).filter((phrase) => containsPhrase(query, phrase)).map((phrase) => ({ topic, phrase })))
    .sort((a, b) => b.phrase.length - a.phrase.length);
  if (exactCandidates.length) {
    const distinctTopics = [...new Map(exactCandidates.map((candidate) => [candidate.topic.slug, candidate.topic])).values()];
    const winner = exactCandidates[0];
    const nestedMatches = exactCandidates.every((candidate) => candidate.topic.slug === winner.topic.slug || containsPhrase(winner.phrase, candidate.phrase));
    if (distinctTopics.length > 1 && !nestedMatches) return { topic: null, pathway, status: "ambiguous", confidence: 1, matchedBy: null, suggestions: distinctTopics.slice(0, 4) };
    return { topic: winner.topic, pathway, status: "exact", confidence: 1, matchedBy: winner.phrase, suggestions: [winner.topic] };
  }

  const queryTokens = new Set(tokenise(query));
  const ranked = pathway.topics.map((topic) => {
    const variants = phrasesFor(topic).map((phrase) => {
      const topicTokens = tokenise(phrase);
      const matched = topicTokens.filter((token) => queryTokens.has(token));
      const coverage = topicTokens.length ? matched.length / topicTokens.length : 0;
      const precision = queryTokens.size ? matched.length / Math.min(queryTokens.size, Math.max(topicTokens.length, 1)) : 0;
      return { phrase, score: (coverage * .72) + (precision * .28), matched: matched.length };
    }).sort((a, b) => b.score - a.score)[0] ?? { phrase: "", score: 0, matched: 0 };
    return { topic, ...variants };
  }).sort((a, b) => b.score - a.score || b.matched - a.matched);
  const first = ranked[0];
  const second = ranked[1];
  const suggestions = ranked.filter((item) => item.score > 0).slice(0, 4).map((item) => item.topic);
  if (!first || first.matched === 0 || first.score < .56) return { topic: null, pathway, status: "none", confidence: first?.score ?? 0, matchedBy: null, suggestions: suggestions.length ? suggestions : pathway.topics.slice(0, 5) };
  if (second && second.score >= first.score - .14) return { topic: null, pathway, status: "ambiguous", confidence: first.score, matchedBy: null, suggestions };
  return { topic: first.topic, pathway, status: "confident", confidence: first.score, matchedBy: first.phrase, suggestions: [first.topic, ...suggestions.filter((topic) => topic.slug !== first.topic.slug)].slice(0, 4) };
}

function normalise(value: string) { return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim(); }
function containsPhrase(query: string, phrase: string) { return (` ${query} `).includes(` ${phrase} `); }
function tokenise(value: string) { return normalise(value).split(" ").filter((token) => token.length > 2 && !ignoredTokens.has(token)); }
