import { subjects } from "../lib/subjects.ts";
import { examBoards } from "../lib/exam-boards.ts";
import { findCurriculumTopic, getBoardCurriculum } from "../lib/board-curricula.ts";
import { readFileSync } from "node:fs";

const failures = [];
let renderedTopics = 0;
let boardMappedPairs = 0;
let crossBoardPairs = 0;
let exactTopicTests = 0;
const required = ["title", "summary", "workedExample", "realWorld", "keyConcept", "commonMistake", "memoryBooster", "examTechnique", "modelAnswer", "question", "answer"];

for (const subject of subjects) {
  for (const board of examBoards) {
    const pathway = getBoardCurriculum(subject, board.id);
    if (pathway.status === "board-mapped") boardMappedPairs += 1; else crossBoardPairs += 1;
    if (!pathway.topics.length) failures.push(`${subject.slug}/${board.id}: no topics`);
    const slugs = new Set();
    for (const topic of pathway.topics) {
      renderedTopics += 1;
      if (slugs.has(topic.slug)) failures.push(`${subject.slug}/${board.id}: duplicate ${topic.slug}`);
      slugs.add(topic.slug);
      for (const field of required) if (!String(topic[field] ?? "").trim()) failures.push(`${subject.slug}/${board.id}/${topic.slug}: empty ${field}`);
      if (!Array.isArray(topic.walkthrough) || topic.walkthrough.length < 3) failures.push(`${subject.slug}/${board.id}/${topic.slug}: incomplete walkthrough`);
      if (!Array.isArray(topic.specPoints) || topic.specPoints.length < 4) failures.push(`${subject.slug}/${board.id}/${topic.slug}: incomplete specification focus`);
      const match = findCurriculumTopic(subject, board.id, `Explain ${topic.title}`);
      exactTopicTests += 1;
      if (match.topic?.slug !== topic.slug) failures.push(`${subject.slug}/${board.id}/${topic.slug}: matcher returned ${match.topic?.slug ?? "nothing"}`);
    }
  }
}

const psychology = subjects.find((subject) => subject.slug === "psychology");
if (!psychology) failures.push("Psychology missing");
else {
  for (const board of ["aqa", "edexcel"]) {
    const result = findCurriculumTopic(psychology, board, "Explain Issues and Debates in Psychology");
    if (result.topic?.title !== "Issues and Debates") failures.push(`Psychology/${board}: Issues and Debates matched ${result.topic?.title ?? "nothing"}`);
  }
  const methods = findCurriculumTopic(psychology, "aqa", "Help me revise Research Methods");
  if (methods.topic?.title !== "Research Methods") failures.push(`Psychology/aqa: Research Methods matched ${methods.topic?.title ?? "nothing"}`);
  const debateAlias = findCurriculumTopic(psychology, "aqa", "Can you walk me through nature versus nurture?");
  if (debateAlias.topic?.title !== "Issues and Debates") failures.push(`Psychology/aqa: nature-nurture alias matched ${debateAlias.topic?.title ?? "nothing"}`);
  const ambiguous = findCurriculumTopic(psychology, "aqa", "Compare Research Methods and Issues and Debates");
  if (ambiguous.topic || ambiguous.status !== "ambiguous") failures.push(`Psychology/aqa: ambiguous query should stop, got ${ambiguous.topic?.title ?? ambiguous.status}`);
  const unknown = findCurriculumTopic(psychology, "aqa", "Please explain this to me");
  if (unknown.topic || unknown.status !== "none") failures.push(`Psychology/aqa: unknown query should stop, got ${unknown.topic?.title ?? unknown.status}`);
const aqa = getBoardCurriculum(psychology, "aqa").topics.map((topic) => topic.title).join("|");
  const edexcel = getBoardCurriculum(psychology, "edexcel").topics.map((topic) => topic.title).join("|");
  if (aqa === edexcel) failures.push("Psychology board selection does not change the topic structure");
}

const workspace = readFileSync(new URL("../components/subject-workspace.tsx", import.meta.url), "utf8");
const tutor = readFileSync(new URL("../components/tutor-launcher.tsx", import.meta.url), "utf8");
const pricing = readFileSync(new URL("../app/pricing/page.tsx", import.meta.url), "utf8");
const founder = readFileSync(new URL("../components/founder-card.tsx", import.meta.url), "utf8");
const actions = readFileSync(new URL("../app/actions.ts", import.meta.url), "utf8");
const queries = readFileSync(new URL("../db/queries.ts", import.meta.url), "utf8");
const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
const community = readFileSync(new URL("../components/community-hub.tsx", import.meta.url), "utf8");
const dashboard = readFileSync(new URL("../components/dashboard-momentum.tsx", import.meta.url), "utf8");
const curriculum = readFileSync(new URL("../components/curriculum-explorer.tsx", import.meta.url), "utf8");
const uiContracts = [
  ["controlled subject tabs", workspace.includes('value={activeTab}') && workspace.includes("onValueChange={setActiveTab}")],
  ["working quick links", workspace.includes('goToTab("notes")') && workspace.includes('goToTab("practice")') && workspace.includes('goToTab("assignments")')],
  ["smart notes action", workspace.includes("action={createNoteAction}")],
  ["revision planner action", workspace.includes("action={createTaskAction}")],
  ["flashcard controls", workspace.includes("Shuffle flashcards") && workspace.includes("Mark confident")],
  ["test creator", workspace.includes("Test Creator") && workspace.includes("Generate new test") && workspace.includes("mark guidance")],
  ["DashAI board selector", tutor.includes("Select an exam board") && tutor.includes("JSON.stringify({ question, subject, board, mode })")],
  ["DashAI visible context lock", tutor.includes("dashai-context") && tutor.includes("No guess made")],
  ["account-linked Gumroad checkout", pricing.includes("startGumroadCheckoutAction") && pricing.includes("no licence key or activation form") && actions.includes("dc_checkout")],
  ["client cannot write memberships", queries.includes("Membership writes are handled by the secured payment function")],
  ["persistent community workspace", layout.includes("CommunityPresenceProvider") && community.includes("useCommunityPresence")],
  ["dashboard streak and XP", dashboard.includes("Revision streak") && dashboard.includes("Level") && dashboard.includes("daily-goal")],
  ["draggable revision planner", dashboard.includes("draggable") && dashboard.includes("onDrop")],
  ["specification focus cards", curriculum.includes("Specification focus") && curriculum.includes("topic.specPoints")],
  ["confirmed founder LinkedIn", founder.includes("https://www.linkedin.com/in/cagdas-ozturk-3b9095372/")],
];
for (const [name, passed] of uiContracts) if (!passed) failures.push(`UI contract failed: ${name}`);

if (subjects.length !== 26) failures.push(`Expected 26 subjects, found ${subjects.length}`);
if (examBoards.length !== 6) failures.push(`Expected 6 boards, found ${examBoards.length}`);

console.log(JSON.stringify({ subjects: subjects.length, boards: examBoards.length, subjectBoardPairs: subjects.length * examBoards.length, renderedTopics, boardMappedPairs, crossBoardPairs, exactTopicTests, uiContracts: uiContracts.length, failures }, null, 2));
if (failures.length) process.exit(1);
