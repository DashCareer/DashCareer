export type ExamBoardId = "aqa" | "edexcel" | "ocr" | "eduqas" | "wjec" | "ccea";
export type ExamBoard = { id: ExamBoardId; name: string; region: string; specificationUrl: string; papersUrl: string; colour: string };

export const examBoards: ExamBoard[] = [
  { id: "aqa", name: "AQA", region: "England", specificationUrl: "https://www.aqa.org.uk/subjects", papersUrl: "https://www.aqa.org.uk/find-past-papers-and-mark-schemes", colour: "#6d49d8" },
  { id: "edexcel", name: "Pearson Edexcel", region: "England", specificationUrl: "https://qualifications.pearson.com/en/qualifications/edexcel-a-levels.html", papersUrl: "https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html", colour: "#007f86" },
  { id: "ocr", name: "OCR", region: "England", specificationUrl: "https://www.ocr.org.uk/qualifications/as-and-a-level/", papersUrl: "https://www.ocr.org.uk/qualifications/past-paper-finder/", colour: "#ef4b42" },
  { id: "eduqas", name: "Eduqas", region: "England", specificationUrl: "https://www.eduqas.co.uk/qualifications/", papersUrl: "https://www.eduqas.co.uk/home/past-papers/", colour: "#186a97" },
  { id: "wjec", name: "WJEC", region: "Wales", specificationUrl: "https://www.wjec.co.uk/qualifications/", papersUrl: "https://www.wjec.co.uk/home/past-papers/", colour: "#cf2945" },
  { id: "ccea", name: "CCEA", region: "Northern Ireland", specificationUrl: "https://ccea.org.uk/post-16/gce", papersUrl: "https://ccea.org.uk/post-16/gce/past-papers-mark-schemes", colour: "#24529b" },
];

export function getExamBoard(id: string) { return examBoards.find((board) => board.id === id) ?? examBoards[0]; }

const formulaSheets: Record<string, string[]> = {
  maths: ["Quadratic formula: x = (−b ± √(b² − 4ac)) / 2a", "Arithmetic sequence: uₙ = a + (n − 1)d", "Geometric sum: Sₙ = a(1 − rⁿ) / (1 − r)", "Differentiation: d(xⁿ)/dx = nxⁿ⁻¹", "Integration: ∫xⁿ dx = xⁿ⁺¹/(n + 1) + C"],
  "further-maths": ["Euler form: eⁱᶿ = cos θ + i sin θ", "Matrix inverse: A⁻¹ = adj(A)/det(A)", "Maclaurin: f(x) = f(0) + xf′(0) + x²f″(0)/2! + …"],
  physics: ["F = ma", "Eₖ = ½mv²", "V = IR", "P = IV", "v = fλ", "E = hf", "F = Gm₁m₂/r²"],
  chemistry: ["n = m/M", "c = n/V", "pV = nRT", "ΔG = ΔH − TΔS", "k = Ae⁻ᴱᵃ/ᴿᵀ"],
  biology: ["Magnification = image size / actual size", "Percentage change = change / original × 100", "Simpson diversity index: D = 1 − Σ(n/N)²"],
  economics: ["PED = % change in quantity demanded / % change in price", "GDP deflator = nominal GDP / real GDP × 100", "Multiplier = 1 / (1 − MPC)"],
  business: ["Profit = revenue − total costs", "Break-even output = fixed costs / contribution per unit", "ROCE = operating profit / capital employed × 100"],
  "computer-science": ["Big-O common orders: O(1), O(log n), O(n), O(n log n), O(n²)", "Boolean: A AND (B OR C) = (A AND B) OR (A AND C)"],
  "physical-education": ["Cardiac output = heart rate × stroke volume", "Mechanical advantage = effort arm / resistance arm"],
};

export function getFormulaSheet(subjectSlug: string) { return formulaSheets[subjectSlug] ?? []; }
