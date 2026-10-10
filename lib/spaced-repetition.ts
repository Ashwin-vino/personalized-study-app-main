/**
 * Implements a spaced repetition algorithm (based on SuperMemo-2 / SM-2).
 * 
 * @param quality User's recall quality (0-5)
 *  5: perfect response
 *  4: correct response after a hesitation
 *  3: correct response recalled with serious difficulty
 *  2: incorrect response; where the correct one seemed easy to recall
 *  1: incorrect response; the correct one remembered
 *  0: complete blackout
 * @param repetitions Number of times the item has been successfully reviewed in a row
 * @param easeFactor E-factor (starts at 2.5)
 * @param interval Current interval in days
 * @returns Updated scheduling parameters
 */
export function calculateSM2(
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number
) {
  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3; // minimum limit

  let newInterval = 0;
  let newRepetitions = repetitions;

  if (quality < 3) {
    // If recall is poor, reset repetitions
    newRepetitions = 0;
    newInterval = 1;
  } else {
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
    newRepetitions += 1;
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewDate
  };
}
