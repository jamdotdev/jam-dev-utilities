import {
  JudgeEvaluation,
  JudgeEvaluationSchema,
  CriteriaWeights,
  calculateWeightedScore,
  ChatMessage,
} from "./ai-eval-schemas";
import { chat } from "./ai-eval-providers";

// ============================================================================
// Judge System Prompts
// ============================================================================

const SINGLE_RESPONSE_JUDGE_PROMPT = `You are an expert AI output evaluator. Your task is to analyze an AI response and score it objectively.

Evaluate the response on these criteria (1-10 scale):

1. ACCURACY (1-10): Is the information factually correct and reliable?
   - 1-3: Contains significant errors or misinformation
   - 4-6: Mostly accurate with minor issues
   - 7-10: Highly accurate and reliable

2. RELEVANCE (1-10): Does it directly address what was asked?
   - 1-3: Off-topic or misses the point
   - 4-6: Partially addresses the question
   - 7-10: Directly and fully addresses the query

3. CLARITY (1-10): Is it well-organized and easy to understand?
   - 1-3: Confusing or poorly structured
   - 4-6: Understandable but could be clearer
   - 7-10: Crystal clear and well-organized

4. COMPLETENESS (1-10): Does it cover all important aspects?
   - 1-3: Missing critical information
   - 4-6: Covers basics but lacks depth
   - 7-10: Comprehensive and thorough

5. CONCISENESS (1-10): Is it appropriately detailed without being verbose?
   - 1-3: Extremely verbose or too brief
   - 4-6: Could be more concise or needs more detail
   - 7-10: Perfectly balanced length

You MUST respond with valid JSON matching this exact schema:
{
  "scores": {
    "accuracy": <number 1-10>,
    "relevance": <number 1-10>,
    "clarity": <number 1-10>,
    "completeness": <number 1-10>,
    "conciseness": <number 1-10>
  },
  "overallScore": <number 1-10>,
  "reasoning": "<brief explanation of your evaluation, max 500 chars>"
}

Be fair, objective, and consistent in your scoring.`;

const COMPARISON_JUDGE_PROMPT = `You are an expert AI output evaluator. Your task is to compare two AI responses (A and B) to the same prompt and determine which is better.

Evaluate BOTH responses on these criteria (1-10 scale):

1. ACCURACY: Is the information factually correct?
2. RELEVANCE: Does it directly address what was asked?
3. CLARITY: Is it well-organized and easy to understand?
4. COMPLETENESS: Does it cover all important aspects?
5. CONCISENESS: Is it appropriately detailed without being verbose?

You MUST respond with valid JSON matching this exact schema:
{
  "responseA": {
    "scores": {
      "accuracy": <number 1-10>,
      "relevance": <number 1-10>,
      "clarity": <number 1-10>,
      "completeness": <number 1-10>,
      "conciseness": <number 1-10>
    },
    "overallScore": <number 1-10>,
    "reasoning": "<brief explanation, max 300 chars>"
  },
  "responseB": {
    "scores": {
      "accuracy": <number 1-10>,
      "relevance": <number 1-10>,
      "clarity": <number 1-10>,
      "completeness": <number 1-10>,
      "conciseness": <number 1-10>
    },
    "overallScore": <number 1-10>,
    "reasoning": "<brief explanation, max 300 chars>"
  },
  "winner": "<'A', 'B', or 'tie'>",
  "comparisonReasoning": "<why one is better or why they're equal, max 300 chars>"
}

Be fair, objective, and explain your reasoning clearly.`;

// ============================================================================
// Judge Evaluation Functions
// ============================================================================

interface JudgeSingleParams {
  apiKey: string;
  judgeModel: string;
  originalPrompt: string;
  response: string;
  weights: CriteriaWeights;
}

interface JudgeCompareParams {
  apiKey: string;
  judgeModel: string;
  originalPrompt: string;
  responseA: string;
  responseB: string;
  weights: CriteriaWeights;
}

interface ComparisonResult {
  evaluationA: JudgeEvaluation;
  evaluationB: JudgeEvaluation;
  winner: "A" | "B" | "tie";
  comparisonReasoning: string;
}

/**
 * Evaluate a single response using LLM-as-judge
 */
export async function judgeSingleResponse(
  params: JudgeSingleParams
): Promise<JudgeEvaluation> {
  const { apiKey, judgeModel, originalPrompt, response, weights } = params;

  const userMessage = `## Original Prompt
${originalPrompt}

## AI Response to Evaluate
${response}

Evaluate this response now.`;

  const messages: ChatMessage[] = [
    { role: "system", content: SINGLE_RESPONSE_JUDGE_PROMPT },
    { role: "user", content: userMessage },
  ];

  const result = await chat(apiKey, {
    model: judgeModel,
    messages,
    jsonMode: true,
    temperature: 0.3, // Lower temperature for more consistent scoring
  });

  // Parse and validate the response
  const parsed = parseJudgeResponse(result.content);

  // Recalculate overall score with user's weights
  parsed.overallScore = calculateWeightedScore(parsed.scores, weights);

  return parsed;
}

/**
 * Compare two responses using LLM-as-judge (pairwise comparison)
 */
export async function judgeCompareResponses(
  params: JudgeCompareParams
): Promise<ComparisonResult> {
  const { apiKey, judgeModel, originalPrompt, responseA, responseB, weights } =
    params;

  const userMessage = `## Original Prompt
${originalPrompt}

## Response A
${responseA}

## Response B
${responseB}

Compare these responses and provide your evaluation.`;

  const messages: ChatMessage[] = [
    { role: "system", content: COMPARISON_JUDGE_PROMPT },
    { role: "user", content: userMessage },
  ];

  const result = await chat(apiKey, {
    model: judgeModel,
    messages,
    jsonMode: true,
    temperature: 0.3,
  });

  // Parse the comparison response
  const parsed = parseComparisonResponse(result.content);

  // Recalculate overall scores with user's weights
  parsed.evaluationA.overallScore = calculateWeightedScore(
    parsed.evaluationA.scores,
    weights
  );
  parsed.evaluationB.overallScore = calculateWeightedScore(
    parsed.evaluationB.scores,
    weights
  );

  // Re-determine winner based on weighted scores
  if (parsed.evaluationA.overallScore > parsed.evaluationB.overallScore + 0.5) {
    parsed.winner = "A";
  } else if (
    parsed.evaluationB.overallScore >
    parsed.evaluationA.overallScore + 0.5
  ) {
    parsed.winner = "B";
  } else {
    parsed.winner = "tie";
  }

  return parsed;
}

// ============================================================================
// Response Parsing
// ============================================================================

function parseJudgeResponse(content: string): JudgeEvaluation {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = JudgeEvaluationSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.error("Failed to parse judge response:", content, error);

    // Return a default evaluation on parse failure
    return {
      scores: {
        accuracy: 5,
        relevance: 5,
        clarity: 5,
        completeness: 5,
        conciseness: 5,
      },
      overallScore: 5,
      reasoning: "Failed to parse evaluation. Using default scores.",
    };
  }
}

function parseComparisonResponse(content: string): ComparisonResult {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate both evaluations
    const evalA = JudgeEvaluationSchema.parse({
      scores: parsed.responseA.scores,
      overallScore: parsed.responseA.overallScore,
      reasoning: parsed.responseA.reasoning,
    });

    const evalB = JudgeEvaluationSchema.parse({
      scores: parsed.responseB.scores,
      overallScore: parsed.responseB.overallScore,
      reasoning: parsed.responseB.reasoning,
    });

    return {
      evaluationA: evalA,
      evaluationB: evalB,
      winner: parsed.winner as "A" | "B" | "tie",
      comparisonReasoning: parsed.comparisonReasoning || "",
    };
  } catch (error) {
    console.error("Failed to parse comparison response:", content, error);

    // Return default evaluations on parse failure
    const defaultEval: JudgeEvaluation = {
      scores: {
        accuracy: 5,
        relevance: 5,
        clarity: 5,
        completeness: 5,
        conciseness: 5,
      },
      overallScore: 5,
      reasoning: "Failed to parse evaluation.",
    };

    return {
      evaluationA: { ...defaultEval },
      evaluationB: { ...defaultEval },
      winner: "tie",
      comparisonReasoning: "Failed to parse comparison. Using default scores.",
    };
  }
}

// ============================================================================
// Batch Evaluation
// ============================================================================

interface BatchEvalParams {
  apiKey: string;
  judgeModel: string;
  evaluations: Array<{
    id: string;
    originalPrompt: string;
    response: string;
  }>;
  weights: CriteriaWeights;
}

/**
 * Evaluate multiple responses in batch (sequential to respect rate limits)
 */
export async function judgeBatchResponses(
  params: BatchEvalParams
): Promise<Map<string, JudgeEvaluation>> {
  const results = new Map<string, JudgeEvaluation>();

  for (const item of params.evaluations) {
    try {
      const evaluation = await judgeSingleResponse({
        apiKey: params.apiKey,
        judgeModel: params.judgeModel,
        originalPrompt: item.originalPrompt,
        response: item.response,
        weights: params.weights,
      });
      results.set(item.id, evaluation);
    } catch (error) {
      console.error(`Failed to evaluate ${item.id}:`, error);
      results.set(item.id, {
        scores: {
          accuracy: 0,
          relevance: 0,
          clarity: 0,
          completeness: 0,
          conciseness: 0,
        },
        overallScore: 0,
        reasoning:
          error instanceof Error
            ? error.message
            : "Evaluation failed",
      });
    }
  }

  return results;
}
