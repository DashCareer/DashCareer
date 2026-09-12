import assert from 'node:assert/strict';
import { getLesson } from '../lib/lessons.ts';
const maths = getLesson('maths', 'aqa', 'differentiation');
const psych = getLesson('psychology', 'aqa', 'issues-and-debates');
for (const lesson of [maths, psych]) {
  assert.ok(lesson.sections.length >= 6);
  assert.ok(lesson.sections.every(section => section.paragraphs.every(p => p.length > 100)));
  assert.ok(lesson.checks.every(check => check.answer && check.question));
  assert.ok(lesson.source.startsWith('https://www.aqa.org.uk/'));
}
assert.equal(getLesson('maths', 'edexcel', 'differentiation'), undefined, 'Never label an AQA lesson as another board');
assert.equal(getLesson('psychology', 'aqa', 'research-methods'), undefined, 'Never substitute Issues and Debates for Research Methods');
console.log('PASS: lesson structure, answer checks, source links, exact subject-board-topic isolation');
