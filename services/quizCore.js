/**
 * Quiz scoring & normalization — used only server-side (never trust client totals).
 */

function normalizeQuizAnswer(raw) {
    return String(raw || '').trim().toLowerCase();
}

function normalizeBooleanAnswer(raw) {
    const s = normalizeQuizAnswer(raw);
    if (['true', 'vrai', 'yes', 'y', '1'].includes(s)) return 'true';
    if (['false', 'faux', 'no', 'n', '0'].includes(s)) return 'false';
    return s;
}

/**
 * @param {Array} questions - rows from quiz_questions
 * @param {Array<{questionId:number, answerText?:string}>} answers
 * @param {{ quizPenaltyPoints?: number }} opts
 * @returns {{
 *   maxPoints: number,
 *   earnedPoints: number,
 *   scorePercent: number,
 *   correctCount: number,
 *   wrongCount: number,
 *   unansweredCount: number,
 *   perQuestion: Array<{ questionId, userAnswer, correct, earnedPoints, maxPoints, markedForReview, timeSpentSeconds }>
 * }}
 */
function scoreQuizAttempt(questions, answers, opts = {}) {
    const quizPenalty = Math.max(0, parseInt(opts.quizPenaltyPoints || 0, 10) || 0);
    const answerMap = new Map();
    const metaMap = new Map();
    (answers || []).forEach((a) => {
        if (!a || a.questionId == null) return;
        const id = String(a.questionId);
        answerMap.set(id, normalizeQuizAnswer(a.answerText));
        metaMap.set(id, {
            markedForReview: !!a.markedForReview,
            timeSpentSeconds: Math.max(0, parseInt(a.timeSpentSeconds || 0, 10) || 0)
        });
    });

    const maxPoints = questions.reduce((s, q) => s + (parseInt(q.points, 10) || 0), 0);
    let earnedPoints = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    const perQuestion = [];

    for (const q of questions) {
        const qid = String(q.id);
        const userAnswerRaw = answerMap.get(qid) || '';
        const correctAnswerRaw = normalizeQuizAnswer(q.correctAnswer);
        const userAnswer = q.questionType === 'TRUE_FALSE' ? normalizeBooleanAnswer(userAnswerRaw) : userAnswerRaw;
        const correctAnswer = q.questionType === 'TRUE_FALSE' ? normalizeBooleanAnswer(correctAnswerRaw) : correctAnswerRaw;
        const qMax = parseInt(q.points, 10) || 0;
        const qPenalty = q.wrongAnswerPenaltyPoints != null
            ? Math.max(0, parseInt(q.wrongAnswerPenaltyPoints, 10) || 0)
            : quizPenalty;
        const meta = metaMap.get(qid) || { markedForReview: false, timeSpentSeconds: 0 };

        let correct = false;
        let pts = 0;
        if (!userAnswerRaw) {
            unansweredCount++;
            correct = false;
            pts = 0;
        } else if (userAnswer === correctAnswer && qMax > 0) {
            correct = true;
            pts = qMax;
            correctCount++;
        } else {
            wrongCount++;
            correct = false;
            pts = -Math.min(qMax || 0, qPenalty);
        }

        earnedPoints += pts;
        perQuestion.push({
            questionId: q.id,
            userAnswer: userAnswerRaw || '',
            correct,
            earnedPoints: pts,
            maxPoints: qMax,
            markedForReview: meta.markedForReview,
            timeSpentSeconds: meta.timeSpentSeconds
        });
    }

    earnedPoints = Math.max(0, earnedPoints);
    const scorePercent = maxPoints > 0 ? Math.round((earnedPoints * 100) / maxPoints) : 0;

    return {
        maxPoints,
        earnedPoints,
        scorePercent,
        correctCount,
        wrongCount,
        unansweredCount,
        perQuestion
    };
}

module.exports = {
    normalizeQuizAnswer,
    normalizeBooleanAnswer,
    scoreQuizAttempt
};
