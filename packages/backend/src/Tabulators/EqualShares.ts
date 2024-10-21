// EqualShares.ts

import {
  ballot,
  candidate,
  equalSharesResults,
  equalSharesSummaryData,
} from "@equal-vote/star-vote-shared/domain_model/ITabulators";

import { IparsedData } from "./ParseData";
import { sortByTieBreakOrder } from "./Star";

const ParseData = require("./ParseData");
const Fraction = require("fraction.js");

export function EqualShares(
  candidates: string[],
  votes: ballot[],
  nWinners = 3,
  randomTiebreakOrder: number[] = [],
  breakTiesRandomly = true,
  completionMethod: 'seqphragmen' | 'av' | null = 'av'
): equalSharesResults {
  // Parse the votes
  const parsedData: IparsedData = ParseData(votes);

  // Initialize summary data
  const summaryData: equalSharesSummaryData = {
    candidates: candidates.map((name, index) => ({
      index,
      name,
      tieBreakOrder: randomTiebreakOrder[index] || index,
    })),
    totalScores: [], // Populate as needed
    nValidVotes: parsedData.validVotes.length,
    nInvalidVotes: parsedData.invalidVotes.length,
    nUnderVotes: parsedData.underVotes,
    nBulletVotes: 0, // Calculate as needed
    budgetByRound: [],
    spentAboves: [],
    splitPoints: [],
    weight_on_splits: [],
    weightedScoresByRound: [],
    scoreHist: [], // Initialize as needed
    preferenceMatrix: [], // Initialize as needed
    pairwiseMatrix: [], // Initialize as needed
    noPreferenceStars: [], // Initialize as needed
  };

  // Initialize variables
  const V = parsedData.scores.length;
  const candidateIndices = summaryData.candidates.map((c) => c.index);
  let remainingCandidates = [...candidateIndices];
  let elected: candidate[] = [];
  let tied: candidate[][] = [];
  let budget = Array(V).fill(new Fraction(1));

  // Main loop
  while (elected.length < nWinners && remainingCandidates.length > 0) {
    const affordableCandidates: { [key: number]: typeof Fraction } = {};

    // Find affordable candidates
    for (const cand of remainingCandidates) {
      const q = getMinQ(parsedData, budget, cand);
      if (q !== null) {
        affordableCandidates[cand] = q;
      }
    }

    if (Object.keys(affordableCandidates).length > 0) {
      // Select candidate(s) with minimal cost q
      const minQ = Object.values(affordableCandidates).reduce((a, b) =>
        a.compare(b) < 0 ? a : b
      );
      const tiedCandidates = Object.keys(affordableCandidates)
        .filter((c) => affordableCandidates[parseInt(c)].equals(minQ))
        .map((c) => summaryData.candidates[parseInt(c)]);

      // Break ties if necessary
      let selectedCandidate: candidate;
      if (tiedCandidates.length > 1 && breakTiesRandomly) {
        selectedCandidate = sortByTieBreakOrder(tiedCandidates)[0];
      } else {
        selectedCandidate = tiedCandidates[0];
      }
      elected.push(selectedCandidate);
      tied.push(tiedCandidates);

      // Update budgets
      budget = updateBudgets(parsedData, budget, selectedCandidate.index, minQ);

      // Remove elected candidate from the list
      remainingCandidates = remainingCandidates.filter(
        (c) => c !== selectedCandidate.index
      );

      // Record budget by round
      summaryData.budgetByRound.push(budget.map((b) => b.valueOf()));
    } else {
      // No affordable candidates
      break;
    }
  }

  // If not enough candidates have been elected, apply the completion method
  if (elected.length < nWinners && completionMethod) {
    const remainingSeats = nWinners - elected.length;
    const additionalElected = applyCompletionMethod(
      parsedData,
      summaryData,
      remainingCandidates,
      remainingSeats,
      completionMethod,
      breakTiesRandomly
    );
    elected.push(...additionalElected);
  }

  // Remaining candidates
  const otherCandidates = remainingCandidates
    .filter((i) => !elected.some((c) => c.index === i))
    .map((i) => summaryData.candidates[i]);

  const results: equalSharesResults = {
    elected: elected,
    tied: tied,
    other: otherCandidates,
    roundResults: [], // If applicable
    summaryData: summaryData,
    tieBreakType: "none", // Adjust if you have tie-break logic
  };

  return results;
}

// Helper function to find the minimum of two Fractions
function fractionMin(a: typeof Fraction, b: typeof Fraction): typeof Fraction {
  return a.compare(b) < 0 ? a : b;
}

// Helper functions
function getMinQ(
  parsedData: IparsedData,
  budget: typeof Fraction[],
  cand: number
): typeof Fraction | null {
  const votersApproving = parsedData.scores
    .map((vote, index) => (vote[cand] > 0 ? index : -1))
    .filter((index) => index !== -1);
  let richVoters = new Set(votersApproving);
  let poorVoters = new Set<number>();

  while (richVoters.size > 0) {
    const poorBudget = Array.from(poorVoters).reduce(
      (sum, v) => sum.add(budget[v]),
      new Fraction(0)
    );
    const totalWeight = richVoters.size;
    const q = new Fraction(1).sub(poorBudget).div(totalWeight);

    const newPoor = Array.from(richVoters).filter((v) =>
      budget[v].compare(q) < 0
    );
    if (newPoor.length === 0) {
      return q;
    }
    newPoor.forEach((v) => {
      richVoters.delete(v);
      poorVoters.add(v);
    });
  }
  return null;
}

function updateBudgets(
  parsedData: IparsedData,
  budget: typeof Fraction[],
  candIndex: number,
  q: typeof Fraction
): typeof Fraction[] {
  return budget.map((b, v) => {
    if (parsedData.scores[v][candIndex] > 0) {
      return b.sub(fractionMin(b, q));
    }
    return b;
  });
}

function applyCompletionMethod(
  parsedData: IparsedData,
  summaryData: equalSharesSummaryData,
  remainingCandidates: number[],
  remainingSeats: number,
  method: 'seqphragmen' | 'av',
  breakTiesRandomly: boolean
): candidate[] {
  if (method === 'av') {
    return approvalCompletion(parsedData, summaryData, remainingCandidates, remainingSeats, breakTiesRandomly);
  } else if (method === 'seqphragmen') {
    // Implement Sequential Phragmén completion here
    return [];
  } else {
    return [];
  }
}

function approvalCompletion(
  parsedData: IparsedData,
  summaryData: equalSharesSummaryData,
  remainingCandidates: number[],
  remainingSeats: number,
  breakTiesRandomly: boolean
): candidate[] {
  // Calculate total approvals for remaining candidates
  const totalApprovals = remainingCandidates.map((candIndex) => {
    const totalApproval = parsedData.scores.reduce((sum, ballot) => sum + (ballot[candIndex] > 0 ? 1 : 0), 0);
    return { index: candIndex, totalApproval };
  });

  // Sort candidates by total approvals
  totalApprovals.sort((a, b) => b.totalApproval - a.totalApproval);

  // Select candidates
  let selectedCandidates: candidate[] = [];
  for (const { index } of totalApprovals) {
    selectedCandidates.push(summaryData.candidates[index]);
    if (selectedCandidates.length === remainingSeats) {
      break;
    }
  }

  // Handle ties if necessary
  const approvalsAtCutoff = totalApprovals[remainingSeats - 1]?.totalApproval;
  const tiedCandidatesIndices = totalApprovals
    .filter(cand => cand.totalApproval === approvalsAtCutoff)
    .map(cand => cand.index);

  if (tiedCandidatesIndices.length > remainingSeats - selectedCandidates.length) {
    // Apply tie-breaker
    const tiedCandidates = tiedCandidatesIndices.map(index => summaryData.candidates[index]);
    if (breakTiesRandomly) {
      const sortedTiedCandidates = sortByTieBreakOrder(tiedCandidates);
      selectedCandidates = selectedCandidates.concat(sortedTiedCandidates.slice(0, remainingSeats - selectedCandidates.length));
    } else {
      selectedCandidates = selectedCandidates.concat(tiedCandidates.slice(0, remainingSeats - selectedCandidates.length));
    }
  }

  return selectedCandidates;
}
