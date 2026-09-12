export type Lesson = {
  title: string;
  specification: string;
  source: string;
  checked: string;
  introduction: string;
  sections: { heading: string; paragraphs: string[] }[];
  glossary: { term: string; definition: string }[];
  checks: { question: string; answer: string }[];
};

const differentiation: Lesson = {
  title: "Differentiation: rates, rules and applications",
  specification: "AQA 7357 · G1–G6 · original lesson; teacher review pending",
  source: "https://www.aqa.org.uk/subjects/mathematics/a-level/mathematics-7357/specification/subject-content/g-differentiation",
  checked: "2026-09-12",
  introduction: "A derivative measures instantaneous change. If position depends on time, its derivative is velocity. If y depends on x, dy/dx gives the gradient of the tangent at a point. This lesson builds the idea from a limit, develops the main rules and applies them to graphs and models. You need algebra, functions and radians first.",
  sections: [
    { heading: "1. From a secant to a tangent", paragraphs: [
      "Between x and x+h, the average gradient is [f(x+h)−f(x)]/h. The derivative is the limit of this expression as h approaches zero, provided the limit exists. We simplify for nonzero h before taking the limit; substituting h=0 at the beginning gives an undefined expression.",
      "For f(x)=x², expand (x+h)² to get x²+2xh+h². Subtract x² and divide by h: the gradient becomes 2x+h. As h tends to zero, this approaches 2x. Thus f′(x)=2x. At x=3 the tangent gradient is 6, although the curve is not a straight line.",
      "First principles also explains the trigonometric results. Expand sin(x+h) using the addition formula. The difference quotient becomes sin(x)(cos(h)−1)/h + cos(x)sin(h)/h. In radians, the two limiting ratios are 0 and 1, giving cos(x). Applying the same method to cos(x) gives −sin(x). Degree measures require a conversion factor."
    ] },
    { heading: "2. Build a derivative toolkit", paragraphs: [
      "The power rule is d(xⁿ)/dx=nxⁿ⁻¹, wherever the function and derivative are defined. A constant differentiates to zero. Differentiate sums term by term and keep constant multipliers. Rewrite roots and reciprocals first: √x=x^(1/2), and 1/x²=x^(−2). For y=3x⁴−2√x+5/x, y′=12x³−x^(−1/2)−5x^(−2), for x>0.",
      "Useful rules are d(e^(kx))/dx=ke^(kx), d(a^(kx))/dx=k ln(a)a^(kx) for a>0, and d(ln x)/dx=1/x for x>0. In radians, sin(kx) differentiates to k cos(kx), cos(kx) to −k sin(kx), and tan(kx) to k sec²(kx), on their domains. Do not confuse eˣ with a power xⁿ: the variable occupies a different position."
    ] },
    { heading: "3. Choose the correct rule", paragraphs: [
      "For a product uv, the derivative is u′v+uv′. For a quotient u/v, it is (u′v−uv′)/v², where v≠0. For a composite f(g(x)), use f′(g(x))g′(x). The chain rule multiplies by the derivative of the inside function; it does not replace the inside expression with its derivative.",
      "Worked example: y=x²e^(3x). Let u=x² and v=e^(3x), so u′=2x and v′=3e^(3x). Therefore y′=2xe^(3x)+3x²e^(3x)=e^(3x)(2x+3x²). Both terms are needed because both factors change.",
      "For y=(x²+1)/(x−1), the quotient rule gives [2x(x−1)−(x²+1)]/(x−1)²=(x²−2x−1)/(x−1)², with x≠1. For y=(2x+1)⁵, the chain rule gives 10(2x+1)⁴. For an inverse relationship, dx/dy=1/(dy/dx) where the inverse is differentiable and the denominator is nonzero."
    ] },
    { heading: "4. Read and investigate a graph", paragraphs: [
      "Where f′(x)>0 a function increases; where f′(x)<0 it decreases. Zeros of f′ locate stationary points, but not all are maxima or minima. The second derivative describes change in gradient. A positive second derivative indicates convex-up curvature; a negative one indicates concave-down curvature. An inflection requires a change in concavity, not merely f″(x)=0.",
      "Worked example: f(x)=x³−3x. Then f′=3x²−3, giving stationary x-values −1 and 1. Since f″=6x, x=−1 gives a local maximum, with y=2; x=1 gives a local minimum, with y=−2. The curve increases for x<−1 and x>1, and decreases between. At x=0 the second derivative changes sign, so (0,0) is an inflection, although it is not stationary.",
      "At x=2 on this curve, the point is (2,2) and the tangent gradient is 9. The tangent is y−2=9(x−2). The normal is perpendicular, so its gradient is −1/9 and its equation is y−2=−(x−2)/9. At a horizontal tangent the normal is vertical; do not divide by zero. If f″=0 at a stationary point, examine sign changes instead of declaring a minimum."
    ] },
    { heading: "5. Implicit and parametric curves", paragraphs: [
      "When x and y are mixed in one equation, treat y as a function of x. For x²+y²=25, differentiation gives 2x+2y(dy/dx)=0, so dy/dx=−x/y for y≠0. At (3,4) the gradient is −3/4. Differentiating a term xy requires the product rule: its derivative is y+x(dy/dx).",
      "For x=t²+1 and y=t³−t, divide dy/dt=3t²−1 by dx/dt=2t. Thus dy/dx=(3t²−1)/(2t), provided t≠0. At t=1, the point is (2,0) and its gradient is 1. Substituting the parameter into the derivative does not itself give the point coordinates: calculate x and y separately."
    ] },
    { heading: "6. Connected rates and differential models", paragraphs: [
      "The chain rule links changing quantities. A circle has A=πr², so dA/dt=(dA/dr)(dr/dt)=2πr(dr/dt). If r=5 cm and dr/dt=0.2 cm/s, area increases at 2π cm²/s. State the instant and units; a numerical radius does not mean the radius is constant throughout the process.",
      "A statement that a population grows at a rate proportional to its current size becomes dP/dt=kP, with positive k for growth. A quantity approaching ambient temperature can be modelled by dT/dt=−k(T−Tₐ), with k>0. Identify the dependent variable, time variable, sign and units before solving. Such models assume the proportionality remains valid; limited resources or changing conditions can invalidate them.",
      "Revision route: derive x² from first principles, practise basic derivatives, choose rules for products and compositions, investigate one cubic completely, then attempt an implicit curve and a rates problem. For each error, record the rule you chose and why it did not fit."
    ] },
  ],
  glossary: [
    { term: "Derivative", definition: "The limiting rate of change of one variable with respect to another." },
    { term: "Stationary point", definition: "A point on a differentiable curve where the first derivative is zero." },
    { term: "Inflection", definition: "A point where the curve changes concavity; it need not have a horizontal tangent." },
  ],
  checks: [
    { question: "Differentiate y=ln(2x+1), stating its real domain.", answer: "y′=2/(2x+1), with x>−1/2. Use the chain rule and require the logarithm's argument to be positive." },
    { question: "Find the stationary points of y=x⁴−2x² and classify them.", answer: "y′=4x(x²−1), so x=−1,0,1. y″=12x²−4 gives minima at (−1,−1) and (1,−1), and a maximum at (0,0)." },
    { question: "For x=t² and y=t³, find the gradient when t=2.", answer: "dy/dx=3t²/(2t)=3t/2 for t≠0, hence the gradient is 3. The point is (4,8)." },
  ],
};

const issues: Lesson = {
  title: "Issues and Debates: comparing psychological explanations",
  specification: "AQA 7182 · 3.3.1 · specification for first A-level assessment in 2027 · teacher review pending",
  source: "https://www.aqa.org.uk/subjects/psychology/a-level/psychology-7182/specification/subject-content/issues-and-options-in-psychology",
  checked: "2026-09-12",
  introduction: "This topic asks what psychological explanations assume, what they can explain and what consequences they have. A study can be scientifically useful while being culturally limited, reductionist or socially sensitive. Learn each debate as a comparison, then apply it to material you already know. The examples below are original illustrations, not claims that a named experiment produced a particular result.",
  sections: [
    { heading: "1. Gender and cultural bias", paragraphs: [
      "A theory is biased when its assumptions or procedures systematically favour a perspective and distort conclusions. Androcentrism treats men's experience as the default. Alpha bias exaggerates differences between genders; beta bias overlooks potentially relevant differences. Neither label establishes that a real difference does or does not exist: evidence must support the conclusion.",
      "Imagine a memory task standardised on men and then described as a universal measure. This may involve beta bias because the researchers assume the findings generalise without checking. Conversely, describing a small average difference as proof that two groups learn in fundamentally different ways may illustrate alpha bias. Explain the inference that is problematic rather than merely naming the sample.",
      "Ethnocentrism judges behaviour through one culture's standards. Cultural relativism considers meaning within its cultural setting. A questionnaire equating independence with maturity could misinterpret practices that value family interdependence. Translating its words is not enough: researchers must check whether the construct and questions mean the same thing. Universal claims need evidence across relevant populations, while recognising variation within each culture."
    ] },
    { heading: "2. Free will and determinism", paragraphs: [
      "Free will concerns people's capacity to choose; determinism concerns the causes of behaviour. Biological explanations can emphasise genes or neural processes, environmental explanations learning histories, and psychic explanations unconscious processes. Hard determinism leaves no genuine choice. Soft determinism allows meaningful choice while recognising causal influences and constraints.",
      "Causal explanations help researchers formulate predictions and test interventions. However, explaining a cause does not show that behaviour is perfectly predictable or that one cause is sufficient. A student may choose a revision strategy while their available options and past reinforcement influence that choice. This illustrates why soft determinism can be more useful than claiming behaviour is either wholly free or completely externally controlled."
    ] },
    { heading: "3. Nature, nurture and interaction", paragraphs: [
      "Nature refers to inherited biological influences; nurture concerns environmental experience. These are not mutually exclusive sources that can always be separated. An interaction occurs when the effect of one influence depends on another. Genetic differences may affect sensitivity to an environment, and people's characteristics can influence the environments they experience.",
      "For an original example, imagine that repeated rehearsal improves recall more for one group than another because of a measured biological difference. That would be a possible interaction, not evidence that one group is destined to perform better. Establishing such a claim would require appropriate research. Similarity among relatives alone cannot separate heredity from shared environments.",
      "Model paragraph: An exclusively environmental explanation may overlook differences in how people respond to the same experience. An interactionist account predicts that the impact of an environment varies with characteristics of the individual. This provides a more flexible explanation, but it must specify which influences interact and how they can be measured; simply saying that both matter is not yet a testable explanation."
    ] },
    { heading: "4. Holism, reductionism and levels", paragraphs: [
      "Reductionism explains a complex phenomenon through simpler components or a lower level. Biological reductionism may explain behaviour through neural activity; environmental reductionism through learned stimulus–response relationships. Holism considers the whole person or system, including relationships between components. A holistic explanation is not simply a longer list of factors.",
      "Consider remembering a classroom discussion. A neural explanation concerns the biological processes involved; a cognitive explanation concerns attention and retrieval; a social explanation considers the shared meaning of the discussion. These can answer different questions rather than competing for one exclusive explanation. Reduction can make mechanisms measurable, while losing context. Holistic accounts preserve context but can be difficult to test if their predictions are vague."
    ] },
    { heading: "5. Idiographic and nomothetic approaches", paragraphs: [
      "An idiographic approach seeks detailed understanding of a particular person or case. A nomothetic approach looks for general patterns or laws. An intensive account of one student's learning experiences may generate an explanation that a larger study then tests. These approaches can complement each other.",
      "Do not equate idiographic with qualitative in every case, or nomothetic with quantitative in every case. The crucial distinction is the aim of the investigation. Repeated numerical measurements of one individual can still serve an idiographic aim. General patterns can be useful for prediction but may hide individual variation; a rich case account may capture that variation but provide limited grounds for wider generalisation."
    ] },
    { heading: "6. Social sensitivity and responsible conclusions", paragraphs: [
      "Research is socially sensitive when its questions, findings or use may have consequences for individuals or groups beyond the immediate study. Consent and confidentiality concern participant treatment, but do not exhaust this issue. An ethically conducted project could still be misrepresented as showing that a group is inherently less capable.",
      "Responsible research explains sampling limits, uncertainty and alternative explanations. Researchers should consider how findings could be applied, who might benefit or be harmed, and how to communicate results without turning group averages into assumptions about individuals. Sensitivity is a reason for care and scrutiny, not an automatic reason to avoid a valuable question."
    ] },
    { heading: "7. Turn knowledge into an exam response", paragraphs: [
      "Read the command and identify the exact debate. Define the competing positions, apply them to an appropriate theory or study from your course, then explain a strength or limitation and its implication. For a discussion, compare alternatives and reach a justified conclusion. Use the mark scheme for the particular question rather than assuming every essay has one fixed paragraph formula.",
      "Worked approach: for a question about reductionism, begin by defining levels of explanation. Use a specific biological or learning explanation, show what its simplification allows researchers to test, then identify a factor it leaves out. Finish by judging whether combining levels addresses that limitation. A paragraph about sample size earns relevance only if you explain how it affects the argument about reductionism.",
      "Study plan: make paired definition cards, apply each debate to two familiar course topics, write one developed comparison without notes, and revisit the weakest distinction after a delay. Before marking this area mastered, distinguish alpha from beta bias, explain an interaction rather than just naming two influences, and discuss social consequences separately from participant consent."
    ] },
  ],
  glossary: [
    { term: "Universality", definition: "A claim that a finding or explanation applies across the relevant human population." },
    { term: "Interactionism", definition: "An account in which influences operate together and the effect of one can depend on another." },
    { term: "Reductionism", definition: "Explaining a complex phenomenon through simpler components or a lower explanatory level." },
    { term: "Idiographic", definition: "Aiming to understand the distinctive details of an individual case." },
  ],
  checks: [
    { question: "A researcher assumes a result from one gender applies to everyone. Which bias may be involved, and why?", answer: "Beta bias: potentially relevant differences are ignored. Explain why generalisation needs evidence; the sample alone does not prove that a difference exists." },
    { question: "Why is ‘both genes and environment matter’ weaker than an interactionist prediction?", answer: "It names two influences without explaining their relationship. An interactionist prediction specifies how the effect of one changes according to the other." },
    { question: "Can research with informed consent still be socially sensitive?", answer: "Yes. Consent addresses participant treatment; findings may still affect wider groups or be misused. Discuss those consequences and responsible communication separately." },
  ],
};

export function getLesson(subject: string, board: string, topic: string): Lesson | undefined {
  if (board !== "aqa") return undefined;
  if (subject === "maths" && topic === "differentiation") return differentiation;
  if (subject === "psychology" && topic === "issues-and-debates") return issues;
  return undefined;
}
