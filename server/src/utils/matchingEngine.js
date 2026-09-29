/**
 * SkillX Rule-Based Matching Engine
 * 
 * 100% Deterministic, Rule-Based Compatibility Engine.
 * ABSOLUTELY ZERO AI / ML.
 * Pure relational logic based on complementary skills, experience level compatibility,
 * format preferences, and shared languages.
 */

function normalizeSkill(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function skillsMatch(skillA, skillB) {
  const normA = normalizeSkill(skillA);
  const normB = normalizeSkill(skillB);
  if (!normA || !normB) return false;
  return normA === normB || normA.includes(normB) || normB.includes(normA);
}

const LEVEL_WEIGHTS = {
  'Beginner': 1,
  'Elementary': 2,
  'Intermediate': 3,
  'Advanced': 4,
  'Expert': 5
};

/**
 * Calculates rule-based match between User A (target user) and User B (candidate user)
 * @param {Object} profileA - Profile of requesting user (with skillsTeaching and skillsLearning)
 * @param {Object} userA - User A doc (languages, etc.)
 * @param {Object} profileB - Profile of candidate user
 * @param {Object} userB - User B doc
 */
function calculateSkillMatch(profileA, userA, profileB, userB) {
  const userATeaches = profileA?.skillsTeaching || [];
  const userALearns = profileA?.skillsLearning || [];
  const userBTeaches = profileB?.skillsTeaching || [];
  const userBLearns = profileB?.skillsLearning || [];

  // 1. Check if A teaches what B wants to learn
  const aTeachesWhatBWants = [];
  userATeaches.forEach(tSkill => {
    userBLearns.forEach(lSkill => {
      if (skillsMatch(tSkill.name, lSkill.name)) {
        aTeachesWhatBWants.push({
          offered: tSkill,
          wanted: lSkill
        });
      }
    });
  });

  // 2. Check if B teaches what A wants to learn
  const bTeachesWhatAWants = [];
  userBTeaches.forEach(tSkill => {
    userALearns.forEach(lSkill => {
      if (skillsMatch(tSkill.name, lSkill.name)) {
        bTeachesWhatAWants.push({
          offered: tSkill,
          wanted: lSkill
        });
      }
    });
  });

  const isMutualMatch = aTeachesWhatBWants.length > 0 && bTeachesWhatAWants.length > 0;
  const isOneWayTeach = aTeachesWhatBWants.length > 0 && bTeachesWhatAWants.length === 0;
  const isOneWayLearn = bTeachesWhatAWants.length > 0 && aTeachesWhatBWants.length === 0;

  // Calculate transparent score breakdown
  const breakdown = [];
  let score = 0;

  if (isMutualMatch) {
    score += 50;
    breakdown.push({
      item: 'Mutual Skill Complementarity',
      points: 50,
      detail: `You teach ${aTeachesWhatBWants[0].offered.name} which they want, and they teach ${bTeachesWhatAWants[0].offered.name} which you want.`
    });

    // Check level alignment: teacher level should ideally be >= learner target level
    const teachLevelA = LEVEL_WEIGHTS[aTeachesWhatBWants[0].offered.level] || 3;
    const targetLevelB = LEVEL_WEIGHTS[aTeachesWhatBWants[0].wanted.targetLevel] || 3;
    const teachLevelB = LEVEL_WEIGHTS[bTeachesWhatAWants[0].offered.level] || 3;
    const targetLevelA = LEVEL_WEIGHTS[bTeachesWhatAWants[0].wanted.targetLevel] || 3;

    if (teachLevelA >= targetLevelB && teachLevelB >= targetLevelA) {
      score += 20;
      breakdown.push({
        item: 'Skill Level Alignment',
        points: 20,
        detail: `Both teachers possess equal or higher proficiency than the respective learner's target.`
      });
    } else {
      score += 10;
      breakdown.push({
        item: 'Compatible Skill Levels',
        points: 10,
        detail: `Skill levels are close and well-suited for collaborative learning.`
      });
    }

    // Check Format overlap
    const formatsA = aTeachesWhatBWants[0].wanted.preferredFormat || [];
    const formatsB = bTeachesWhatAWants[0].wanted.preferredFormat || [];
    const sharedFormats = formatsA.filter(f => formatsB.includes(f));

    if (sharedFormats.length > 0) {
      score += 15;
      breakdown.push({
        item: 'Shared Learning Format',
        points: 15,
        detail: `Both prefer: ${sharedFormats.join(', ')}.`
      });
    } else {
      score += 5;
      breakdown.push({
        item: 'Flexible Format',
        points: 5,
        detail: `Compatible for mixed Whiteboard and Voice sessions.`
      });
    }

    // Check Language overlap
    const langsA = userA?.languages || ['English'];
    const langsB = userB?.languages || ['English'];
    const sharedLangs = langsA.filter(l => langsB.some(lb => lb.toLowerCase() === l.toLowerCase()));

    if (sharedLangs.length > 0) {
      score += 15;
      breakdown.push({
        item: 'Shared Language',
        points: 15,
        detail: `Fluent in ${sharedLangs.join(', ')}.`
      });
    }
  } else if (isOneWayTeach) {
    score = 30;
    breakdown.push({
      item: 'Single-Direction Offering',
      points: 30,
      detail: `You can teach ${aTeachesWhatBWants[0].offered.name}, which matches their learning goal.`
    });
  } else if (isOneWayLearn) {
    score = 30;
    breakdown.push({
      item: 'Single-Direction Learning Opportunity',
      points: 30,
      detail: `They can teach ${bTeachesWhatAWants[0].offered.name}, which matches your learning goal.`
    });
  }

  const whyMatch = breakdown.map(b => `✓ ${b.item}: ${b.detail}`);

  return {
    isMutualMatch,
    isOneWayTeach,
    isOneWayLearn,
    compatibilityScore: Math.min(score, 100),
    aTeachesWhatBWants,
    bTeachesWhatAWants,
    whyMatch,
    breakdown
  };
}

module.exports = {
  calculateSkillMatch,
  skillsMatch,
  normalizeSkill
};
