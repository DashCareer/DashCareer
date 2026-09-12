import type { Lesson } from "@/lib/lessons";

export function FullLesson({ lesson }: { lesson: Lesson }) {
  return <section className="full-lesson" aria-label={lesson.title}>
    <p className="eyebrow">Detailed lesson</p><h3>{lesson.title}</h3><p>{lesson.specification}</p><p>{lesson.introduction}</p>
    {lesson.sections.map(section => <article key={section.heading}><h4>{section.heading}</h4>{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</article>)}
    <h4>Glossary</h4><dl>{lesson.glossary.map(item => <div key={item.term}><dt><strong>{item.term}</strong></dt><dd>{item.definition}</dd></div>)}</dl>
    <h4>Check your understanding</h4>{lesson.checks.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
    <p><a href={lesson.source} target="_blank" rel="noreferrer">Official specification reference</a> · checked {lesson.checked}. Explanations and questions are original DashCareer material.</p>
  </section>;
}
