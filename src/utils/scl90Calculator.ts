import { questions, factorQuestionCounts } from '../data/scl90Questions';

export interface DimensionScore {
  name: string;
  score: number;
  average: number;
  items: number;
}

export interface TestResult {
  totalScore: number;
  positiveItems: number;
  negativeItems: number;
  averageScore: number;
  dimensions: DimensionScore[];
}

export interface FactorScore {
  name: string;
  score: number;
  average: number;
}

export interface SCL90Result {
  totalScore: number;
  totalAverage: number;
  positiveItems: number;
  factorScores: FactorScore[];
}

const dimensionRanges: Record<string, [number, number]> = {
  躯体化: [1, 12],
  强迫症状: [13, 22],
  人际关系敏感: [23, 31],
  抑郁: [32, 44],
  焦虑: [45, 54],
  敌对: [55, 60],
  恐怖: [61, 67],
  偏执: [68, 73],
  精神病性: [74, 83],
  其他: [84, 90],
};

export function calculateResults(answers: number[]): TestResult {
  const totalScore = answers.reduce((sum, answer) => sum + answer, 0);
  const positiveItems = answers.filter(answer => answer >= 2).length;
  const negativeItems = answers.filter(answer => answer === 1).length;
  const averageScore = totalScore / 90;

  const dimensions: DimensionScore[] = Object.entries(dimensionRanges).map(
    ([name, [start, end]]) => {
      const items = end - start + 1;
      const score = answers
        .slice(start - 1, end)
        .reduce((sum, answer) => sum + answer, 0);
      const average = score / items;

      return {
        name,
        score,
        average,
        items,
      };
    }
  );

  return {
    totalScore,
    positiveItems,
    negativeItems,
    averageScore,
    dimensions,
  };
}

export function calculateSCL90Result(answers: { [key: number]: number }): SCL90Result {
  const factorScores: { [key: string]: number[] } = {
    "躯体化": [],
    "强迫症状": [],
    "人际关系敏感": [],
    "抑郁": [],
    "焦虑": [],
    "敌对": [],
    "恐怖": [],
    "偏执": [],
    "精神病性": []
  };

  let totalScore = 0;
  let positiveItems = 0;

  questions.forEach(question => {
    const answer = answers[question.id] || 1;
    totalScore += answer;
    if (answer > 1) {
      positiveItems++;
    }
    factorScores[question.factor].push(answer);
  });

  const totalAverage = totalScore / 90;

  const factorResults: FactorScore[] = Object.entries(factorScores).map(([name, scores]) => {
    const sum = scores.reduce((acc, val) => acc + val, 0);
    const count = factorQuestionCounts[name as keyof typeof factorQuestionCounts];
    return {
      name,
      score: sum,
      average: sum / count
    };
  });

  return {
    totalScore,
    totalAverage,
    positiveItems,
    factorScores: factorResults
  };
}

export function getInterpretation(result: SCL90Result): string {
  const { totalScore, factorScores } = result;

  let interpretation = '';

  if (totalScore < 160) {
    interpretation = '您的总体心理健康状况良好，症状表现较轻。';
  } else if (totalScore < 200) {
    interpretation = '您可能存在一定程度的心理不适，建议关注自己的情绪变化。';
  } else {
    interpretation = '您的测评结果显示可能存在较明显的心理症状，建议寻求专业心理咨询或医疗帮助。';
  }

  const highFactors = factorScores.filter(f => f.average >= 2.0);
  if (highFactors.length > 0) {
    interpretation += '\n\n需要关注的症状维度：\n';
    highFactors.forEach(factor => {
      interpretation += `• ${factor.name}（均分 ${factor.average.toFixed(2)}）\n`;
    });
  }

  return interpretation;
}

export function getFactorDescription(factorName: string): string {
  const descriptions: { [key: string]: string } = {
    "躯体化": "反映身体不适感，包括心血管、胃肠道、呼吸系统等方面的症状。",
    "强迫症状": "指明知不必要但又无法摆脱的想法、冲动和行为。",
    "人际关系敏感": "指在人际交往中的不自在感、自卑感以及消极的期待等。",
    "抑郁": "反映忧郁的情感与心境，包括生活兴趣的减退、缺乏活力、丧失信心等。",
    "焦虑": "指烦躁不安、紧张以及由此而产生的躯体症状。",
    "敌对": "主要从思维、情感和行为三方面来反映敌对的表现。",
    "恐怖": "指对特定场所、物体或情境的持续的、不合理的恐惧。",
    "偏执": "主要指猜疑和关系妄想等。",
    "精神病性": "反映各式各样的急性症状和行为，如幻觉、思维播散等。"
  };
  return descriptions[factorName] || "";
}
