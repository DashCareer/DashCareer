export type FaqItem = {
  id: string;
  category: "Getting started" | "Study tools" | "Accounts & privacy" | "Membership";
  question: string;
  answer: string;
  keywords: string[];
};

export const faqItems: FaqItem[] = [
  { id: "what-is-dashcareer", category: "Getting started", question: "What is DashCareer?", answer: "DashCareer is an A-Level study workspace that brings subjects, notes, practice, revision planning and progress tracking together in one place.", keywords: ["about", "platform", "website", "dashcareer"] },
  { id: "subjects", category: "Getting started", question: "Which subjects are available?", answer: "There are 26 subject hubs covering STEM, humanities, languages and creative subjects. Use search, filters, grid or list view, and pin the subjects you use most.", keywords: ["courses", "library", "26", "available"] },
  { id: "official-content", category: "Getting started", question: "Is the learning content official exam-board material?", answer: "DashCareer provides original study starters and practice prompts. Past papers stay on official exam-board websites. Always check learning content against your current specification and teacher guidance.", keywords: ["aqa", "edexcel", "ocr", "exam board", "past papers", "official"] },
  { id: "dashai", category: "Study tools", question: "What can DashAI help me with?", answer: "DashAI can help you break down a topic, create a short study plan, suggest retrieval questions and direct you to the most relevant DashCareer tools. It is a study coach, so verify important facts against your specification.", keywords: ["ai", "tutor", "explain", "study coach", "assistant"] },
  { id: "progress", category: "Study tools", question: "How does progress tracking work?", answer: "Mark topics as mastered inside each subject. Your dashboard then shows completed topics, study time, quiz averages, points and upcoming revision tasks.", keywords: ["dashboard", "mastered", "completion", "points", "tracking"] },
  { id: "uploads", category: "Study tools", question: "What files can I upload?", answer: "You can add PDFs, text files, Word documents, PowerPoint files and common images up to 8 MB. Uploaded resources are attached to your account and are not placed in the public community area.", keywords: ["pdf", "document", "file", "slides", "upload", "8 mb"] },
  { id: "pomodoro", category: "Study tools", question: "How do the timer and Focus Mode work?", answer: "Choose a 15, 25 or 45 minute session, select a subject and start the timer. Completed sessions add to your study time. Focus Mode hides navigation, and a reminder appears after two sessions.", keywords: ["pomodoro", "focus", "timer", "break", "wellbeing"] },
  { id: "save-progress", category: "Accounts & privacy", question: "Do I need to sign in?", answer: "You can browse subjects without signing in. An account is needed to save progress, notes, tasks, vocabulary, study time, uploads, reviews and community contributions.", keywords: ["account", "login", "sign in", "save"] },
  { id: "privacy", category: "Accounts & privacy", question: "Who can see my notes and uploads?", answer: "Notes are private by default, and personal uploads can only be downloaded by their owner. A note appears in the peer-notes area only when you deliberately choose shared visibility and it passes moderation.", keywords: ["private", "security", "notes", "documents", "sharing"] },
  { id: "community-safety", category: "Accounts & privacy", question: "How is the community kept safe?", answer: "Community posts are reviewed before publication. DashCareer does not provide private messaging, and students are reminded not to share contact, location, school or payment information.", keywords: ["moderation", "discussion", "rooms", "safe", "message"] },
  { id: "payments", category: "Membership", question: "How are membership payments handled?", answer: "Monthly and annual membership checkouts are handled by Gumroad. Payment details are entered on Gumroad rather than stored by DashCareer.", keywords: ["gumroad", "card", "monthly", "annual", "pro", "payment"] },
  { id: "cancel", category: "Membership", question: "How do I cancel or manage a membership?", answer: "Use the receipt or membership-management link supplied by Gumroad. Questions about refunds should be checked against the refund page and the terms shown at purchase.", keywords: ["refund", "cancel", "subscription", "receipt"] },
];

function words(value: string) {
  return new Set(value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((word) => word.length > 2));
}

export function findFaqAnswer(query: string) {
  const queryWords = words(query);
  let best: { item: FaqItem; score: number } | null = null;
  for (const item of faqItems) {
    const target = words(`${item.question} ${item.keywords.join(" ")}`);
    const score = [...queryWords].filter((word) => target.has(word)).length;
    if (!best || score > best.score) best = { item, score };
  }
  return best && best.score > 0 ? best.item : null;
}
