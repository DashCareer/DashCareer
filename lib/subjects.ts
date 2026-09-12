export type Difficulty = "Easy" | "Medium" | "Hard";
export type Topic = {
  contentStatus: "outline" | "draft";
  slug: string;
  title: string;
  summary: string;
  walkthrough: string[];
  workedExample: string;
  realWorld: string;
  keyConcept: string;
  commonMistake: string;
  memoryBooster: string;
  examTechnique: string;
  modelAnswer: string;
  question: string;
  answer: string;
  difficulty: Difficulty;
  specPoints: string[];
};
export type Subject = { slug: string; name: string; short: string; accent: string; boards: string[]; topics: Topic[] };

const slugify = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export const createTopic = (subject: string, title: string, index: number): Topic => {
  const base: Topic = {
  contentStatus: "outline",
  slug: slugify(title),
  title,
  summary: `${title} is a core part of ${subject}. Build a precise definition, connect the main ideas, then practise applying them in the style required by your exam board.`,
  walkthrough: [`Define the central idea in ${title}.`, "Identify the rule, process, evidence or method that controls the topic.", "Apply it to a clear example and explain each link.", "Check the conclusion against the wording and command word."],
  workedExample: `Start with a short ${title.toLowerCase()} question. Highlight the command word, select the relevant knowledge, show the reasoning in a logical order and finish with a conclusion that answers the exact question.`,
  realWorld: `${title} can be connected to decisions, evidence or systems outside the classroom. Look for one current example and explain which part of the topic it demonstrates.`,
  keyConcept: `The key to ${title} is being able to move from an accurate definition to a justified application, rather than listing facts without a link.`,
  commonMistake: `A common mistake is describing ${title.toLowerCase()} without applying it to the question or showing why the steps follow.`,
  memoryBooster: `Use “D-A-C”: Define it, Apply it, Check the conclusion. Attach one vivid example to ${title} so the definition has a retrieval cue.`,
  examTechnique: "Circle the command word, underline the context, plan the evidence or calculation, then leave time to check that every sentence earns credit.",
  modelAnswer: `A strong response would define ${title.toLowerCase()} accurately, apply it to the information given, develop each step with subject terminology and finish with a direct, supported judgement where required.`,
  question: index % 2 === 0 ? `Explain one key idea from ${title} and apply it to a relevant example. [4 marks]` : `Analyse two important elements of ${title}. Which matters more in this context, and why? [6 marks]`,
  answer: index % 2 === 0 ? "Award up to 2 marks for accurate knowledge, 1 for a relevant example and 1 for a clear link back to the question." : "Award up to 2 marks for each developed element and up to 2 marks for a supported comparative judgement.",
    difficulty: (["Easy", "Medium", "Hard", "Medium"] as Difficulty[])[index % 4],
    specPoints: [`Define the central terminology used in ${title}.`, `Explain the main process, argument or relationship within ${title}.`, `Apply ${title} accurately to unfamiliar information or evidence.`, `Evaluate the limits, implications or alternative explanations linked to ${title}.`],
  };
  if (subject === "Psychology" && title === "Issues and Debates") return {
    ...base,
    contentStatus: "draft",
    summary: "Issues and Debates connects the assumptions behind psychological explanations. It covers gender and cultural bias, free will and determinism, nature and nurture, holism and reductionism, idiographic and nomothetic approaches, and the ethical or socially sensitive consequences of research.",
    walkthrough: ["Name the debate and define both sides precisely.", "Apply each side to a named psychological explanation or study.", "Use evidence to compare the strength of the two positions.", "Reach a balanced conclusion about which position is more useful in the context."],
    workedExample: "For a nature–nurture question, define genetic or biological influences and environmental experience, apply both to a named behaviour, then evaluate interactionism as a reason the two influences should not always be treated separately.",
    realWorld: "Debates affect how psychological research is used in education, mental-health support, policy and the justice system. Social sensitivity matters when findings could influence how groups are viewed.",
    keyConcept: "A debate is not a list of studies. Strong answers compare assumptions, apply them to psychological material and evaluate their consequences.",
    commonMistake: "Writing about research-method validity or reliability without linking it to the named debate. Research Methods is a separate topic unless the question explicitly connects them.",
    memoryBooster: "G-C F-D N-N H-R I-N E-S: gender/culture, free will/determinism, nature/nurture, holism/reductionism, idiographic/nomothetic, ethical/social sensitivity.",
    examTechnique: "Use one paragraph per side: define, apply a named example, evaluate it, then compare. Keep every paragraph tied to the exact debate in the question.",
    modelAnswer: "A high-level answer defines both positions, uses accurate psychological examples for each, develops evidence-based evaluation and finishes with a justified conclusion rather than declaring one side correct.",
    question: "Discuss the nature–nurture debate in psychology. Refer to at least one psychological explanation in your answer. [16 marks]",
    answer: "Credit accurate knowledge of nature, nurture and interactionism; clear application to psychological explanations; developed evaluation using evidence, implications and a supported conclusion.",
    difficulty: "Hard",
    specPoints: ["Explain gender and cultural bias in psychological theory and research.", "Compare free will with determinism and nature with nurture.", "Compare holism with reductionism and idiographic with nomothetic approaches.", "Evaluate ethical implications and socially sensitive psychological research."],
  };
  return base;
};

const make = (slug: string, name: string, short: string, accent: string, titles: string[]): Subject => ({
  slug, name, short, accent, boards: ["AQA", "Pearson Edexcel", "OCR", "Eduqas", "WJEC", "CCEA"],
  topics: titles.map((title, index) => createTopic(name, title, index)),
});

export const subjects: Subject[] = [
  make("maths", "Mathematics", "MA", "#ff715b", ["Proof", "Algebra and Functions", "Coordinate Geometry", "Sequences and Series", "Trigonometry", "Exponentials and Logarithms", "Differentiation", "Integration", "Numerical Methods", "Vectors", "Statistical Sampling", "Data Presentation", "Probability", "Statistical Distributions", "Hypothesis Testing", "Kinematics", "Forces and Newton's Laws", "Moments"]),
  make("further-maths", "Further Mathematics", "FM", "#f7c948", ["Complex Numbers", "Argand Diagrams", "Matrices", "Further Algebra", "Series", "Further Calculus", "Polar Coordinates", "Hyperbolic Functions", "Differential Equations", "Vectors", "Further Statistics", "Further Mechanics", "Decision Mathematics"]),
  make("physics", "Physics", "PH", "#63d2ff", ["Measurements and Errors", "Particles and Radiation", "Waves", "Mechanics and Materials", "Electricity", "Further Mechanics", "Thermal Physics", "Fields", "Nuclear Physics", "Astrophysics", "Medical Physics", "Engineering Physics", "Turning Points"]),
  make("chemistry", "Chemistry", "CH", "#9bdb7b", ["Atomic Structure", "Amount of Substance", "Bonding", "Energetics", "Kinetics", "Chemical Equilibria", "Redox", "Thermodynamics", "Rate Equations", "Electrode Potentials", "Periodicity", "Group Chemistry", "Transition Metals", "Organic Chemistry", "Organic Analysis", "Practical Skills"]),
  make("biology", "Biology", "BI", "#5ee0b7", ["Biological Molecules", "Cells and Microscopy", "Cell Membranes and Transport", "Enzymes", "Exchange and Mass Transport", "DNA and Protein Synthesis", "Genetic Diversity", "Immunity", "Energy Transfers", "Responses and Homeostasis", "Genetics and Populations", "Evolution", "Ecosystems", "Gene Expression", "Biotechnology", "Practical and Mathematical Skills"]),
  make("english-literature", "English Literature", "EL", "#fd9ad5", ["Close Reading", "Poetry Analysis", "Drama Analysis", "Prose Analysis", "Narrative Methods", "Genre", "Context", "Critical Interpretations", "Comparative Writing", "Unseen Texts", "Coursework Planning", "Quotation and Reference", "Essay Structure"]),
  make("english-language", "English Language", "EN", "#ffb86b", ["Language Levels", "Lexis and Semantics", "Grammar and Syntax", "Phonetics and Phonology", "Pragmatics", "Discourse", "Representation", "Language Diversity", "Language Change", "Child Language Development", "Language Investigation", "Original Writing", "Methods and Data"]),
  make("history", "History", "HI", "#dd9bff", ["Historical Evidence", "Primary Sources", "Historical Interpretations", "Causation", "Change and Continuity", "Similarity and Difference", "Significance", "Breadth Study", "Depth Study", "Themes Across Time", "Essay Planning", "Source Evaluation", "Coursework Investigation"]),
  make("geography", "Geography", "GE", "#5ed0c4", ["Water and Carbon Cycles", "Coastal Systems", "Hazards", "Ecosystems Under Stress", "Glacial Systems", "Global Systems and Governance", "Changing Places", "Population and Environment", "Resource Security", "Urban Environments", "Fieldwork", "Geographical Skills", "Independent Investigation"]),
  make("economics", "Economics", "EC", "#ffd166", ["Economic Methodology", "Markets and Price Determination", "Elasticity", "Production and Costs", "Market Structures", "Labour Markets", "Market Failure", "Government Intervention", "Macroeconomic Measures", "Aggregate Demand and Supply", "Economic Growth", "Inflation and Unemployment", "Fiscal and Monetary Policy", "International Trade", "Development Economics", "Financial Markets"]),
  make("business", "Business Studies", "BU", "#ff8c69", ["Business Objectives", "Managers and Leadership", "Decision Making", "Marketing", "Operations", "Finance", "Human Resources", "Business Growth", "External Environment", "Strategic Position", "Strategic Direction", "Strategic Methods", "Managing Change", "Quantitative Skills"]),
  make("psychology", "Psychology", "PS", "#b9a2ff", ["Research Methods", "Social Influence", "Memory", "Attachment", "Psychopathology", "Approaches in Psychology", "Biopsychology", "Issues and Debates", "Relationships", "Gender", "Cognition and Development", "Schizophrenia", "Eating Behaviour", "Stress", "Aggression", "Forensic Psychology", "Addiction"]),
  make("sociology", "Sociology", "SO", "#75d5a8", ["Education", "Research Methods", "Methods in Context", "Families and Households", "Culture and Identity", "Health", "Work and Poverty", "Beliefs in Society", "Global Development", "The Media", "Crime and Deviance", "Theory and Methods", "Social Stratification"]),
  make("computer-science", "Computer Science", "CS", "#69b7ff", ["Programming Fundamentals", "Algorithms", "Data Structures", "Boolean Algebra", "Computer Architecture", "Data Representation", "Databases", "Networks", "Web Technologies", "Cyber Security", "Software Development", "Functional Programming", "Theory of Computation", "Consequences of Computing", "Project Development"]),
  make("politics", "Politics", "PO", "#ff7d93", ["Democracy and Participation", "Political Parties", "Electoral Systems", "Voting Behaviour", "The Constitution", "Parliament", "Prime Minister and Executive", "Relations Between Institutions", "Political Ideologies", "US Constitution", "US Congress", "US Presidency", "US Supreme Court", "Comparative Politics", "Global Politics"]),
  make("law", "Law", "LA", "#d6b36a", ["Nature of Law", "Law Making", "Legal System", "Judicial Precedent", "Statutory Interpretation", "Criminal Liability", "Offences Against the Person", "Property Offences", "Defences", "Tort of Negligence", "Occupiers' Liability", "Contract Formation", "Contract Terms", "Human Rights", "Concepts of Justice"]),
  make("french", "French", "FR", "#6bb6ff", ["Changing Family", "Digital World", "Volunteering", "Culture and Heritage", "Music", "Cinema", "Diversity", "Marginalisation", "Crime and Punishment", "Political Engagement", "Immigration", "Occupation and Resistance", "Grammar", "Translation", "Film Study", "Literature Study", "Independent Research"]),
  make("spanish", "Spanish", "SP", "#ff906b", ["Changing Family", "Digital World", "Gender Equality", "Regional Culture", "Cultural Heritage", "Music and Media", "Immigration", "Integration", "Youth and Politics", "Monarchies and Dictatorships", "Social Movements", "Grammar", "Translation", "Film Study", "Literature Study", "Independent Research"]),
  make("german", "German", "DE", "#f2c94c", ["Family and Relationships", "Digital World", "Youth Culture", "Festivals and Traditions", "Art and Architecture", "Berlin", "Immigration", "Integration", "Racism", "European Union", "German Reunification", "Politics and Youth", "Grammar", "Translation", "Film Study", "Literature Study", "Independent Research"]),
  make("religious-studies", "Religious Studies", "RS", "#c5a3ff", ["Ancient Philosophical Influences", "Soul Mind and Body", "Arguments for God", "Religious Experience", "Problem of Evil", "Religious Language", "Normative Ethical Theories", "Applied Ethics", "Conscience", "Sexual Ethics", "Developments in Religious Thought", "Religion and Society", "Dialogues and Debates"]),
  make("art-design", "Art & Design", "AD", "#ff7bc3", ["Visual Research", "Contextual Investigation", "Artist Analysis", "Materials and Processes", "Drawing and Recording", "Experimentation", "Idea Development", "Composition", "Refinement", "Personal Response", "Portfolio Curation", "Written Study", "Externally Set Assignment"]),
  make("media-studies", "Media Studies", "ME", "#7fc8ff", ["Media Language", "Representation", "Media Industries", "Audiences", "Contexts", "Advertising", "Film Marketing", "Newspapers", "Magazines", "Music Video", "Radio", "Television", "Online Media", "Video Games", "Long-form Television", "Non-exam Assessment"]),
  make("design-technology", "Design & Technology", "DT", "#87d69b", ["Materials and Properties", "Performance Characteristics", "Manufacturing Processes", "Digital Design and Manufacture", "Design Theory", "Designers and Movements", "Inclusive Design", "Sustainability", "Enterprise and Marketing", "Safe Working", "Quality Assurance", "Product Analysis", "Iterative Design", "Non-exam Assessment"]),
  make("music", "Music", "MU", "#cb9eff", ["Listening and Appraising", "Elements of Music", "Harmony and Tonality", "Rhythm and Metre", "Melody and Texture", "Form and Structure", "Instrumental Timbre", "Set Works", "Wider Listening", "Performance", "Composition", "Technical Study", "Score Reading", "Extended Response"]),
  make("drama-theatre", "Drama & Theatre", "DR", "#ff8aa1", ["Performance Skills", "Devising", "Text Performance", "Directing", "Set Design", "Lighting Design", "Sound Design", "Costume Design", "Practitioner Methods", "Text Analysis", "Live Theatre Evaluation", "Working Notebook", "Reflective Report"]),
  make("physical-education", "Physical Education", "PE", "#60d9c8", ["Musculoskeletal System", "Cardiovascular System", "Respiratory System", "Energy Systems", "Exercise Physiology", "Biomechanics", "Skill Acquisition", "Information Processing", "Sport Psychology", "Social Influence", "Ethics and Deviance", "Commercialisation", "Technology in Sport", "Performance Analysis", "Practical Performance"]),
];

export function getSubject(slug: string) { return subjects.find((subject) => subject.slug === slug); }
export const totalTopics = subjects.reduce((sum, subject) => sum + subject.topics.length, 0);
