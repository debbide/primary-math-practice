/**
 * 在线练习模块
 * 根据主页设置生成题目
 */

let practiceQuestions = [];
let practiceAnswers = [];
let timerInterval = null;
let startTime = null;
let elapsedSeconds = 0;

// 生成随机整数
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成加法题目
function generateAddQuestion(min, max) {
    const num1 = randomInt(min, max);
    const num2 = randomInt(min, max);
    return { question: num1 + ' + ' + num2 + ' = ', answer: num1 + num2 };
}

// 生成减法题目
function generateSubQuestion(min, max, noNegative) {
    let num1 = randomInt(min, max);
    let num2 = randomInt(min, max);
    while (num1 === num2) num2 = randomInt(min, max);
    if (noNegative && num1 < num2) [num1, num2] = [num2, num1];
    return { question: num1 + ' − ' + num2 + ' = ', answer: num1 - num2 };
}

// 生成乘法题目
function generateMulQuestion(min, max) {
    const mulMax = Math.min(max, 12);
    const num1 = randomInt(Math.max(min, 2), mulMax);
    const num2 = randomInt(Math.max(min, 2), mulMax);
    return { question: num1 + ' × ' + num2 + ' = ', answer: num1 * num2 };
}

// 生成除法题目
function generateDivQuestion(min, max, noRemainder) {
    if (noRemainder) {
        const divMax = Math.min(max, 12);
        const answer = randomInt(2, divMax);
        const num2 = randomInt(2, Math.min(max, 12));
        const num1 = answer * num2;
        return { question: num1 + ' ÷ ' + num2 + ' = ', answer: answer };
    } else {
        const num1 = randomInt(min, max);
        const num2 = randomInt(Math.max(1, min), max);
        return { question: num1 + ' ÷ ' + num2 + ' = ', answer: Math.floor(num1 / num2) };
    }
}

// 生成混合运算题目
function generateMixedQuestion(min, max, noNegative) {
    const ops = ['+', '−'];
    const op1 = ops[randomInt(0, 1)];
    const op2 = ops[randomInt(0, 1)];
    let num1 = randomInt(min, max);
    let num2 = randomInt(min, Math.min(max, 15));
    let num3 = randomInt(min, Math.min(max, 15));
    let temp = op1 === '+' ? num1 + num2 : num1 - num2;
    let answer = op2 === '+' ? temp + num3 : temp - num3;
    if (noNegative && answer < 0) return generateMixedQuestion(min, max, noNegative);
    return { question: num1 + ' ' + op1 + ' ' + num2 + ' ' + op2 + ' ' + num3 + ' = ', answer: answer };
}

// 生成括号运算题目
function generateBracketQuestion(min, max) {
    const innerOps = ['+', '−'];
    const innerOp = innerOps[randomInt(0, 1)];
    let num1 = randomInt(min, Math.min(max, 10));
    let num2 = randomInt(min, Math.min(max, 10));
    let num3 = randomInt(2, Math.min(max, 5));
    if (innerOp === '−' && num1 < num2) [num1, num2] = [num2, num1];
    const innerResult = innerOp === '+' ? num1 + num2 : num1 - num2;
    return { question: '(' + num1 + ' ' + innerOp + ' ' + num2 + ') × ' + num3 + ' = ', answer: innerResult * num3 };
}

// 开始练习
function startPractice() {
    practiceQuestions = [];
    practiceAnswers = [];

    // 读取主页设置
    const settingsStr = localStorage.getItem('practiceSettings');
    let settings = {
        countAdd: 3, countSub: 3, countMul: 2, countDiv: 2,
        countMixed: 0, countBracket: 0, countFillBlank: 0,
        minNum: 1, maxNum: 20, noNegative: true, noRemainder: true
    };

    if (settingsStr) {
        try {
            settings = JSON.parse(settingsStr);
        } catch (e) { }
    }

    const min = settings.minNum || 1;
    const max = settings.maxNum || 20;
    const noNegative = settings.noNegative !== false;
    const noRemainder = settings.noRemainder !== false;

    // 生成各类型题目
    for (let i = 0; i < (settings.countAdd || 0); i++) {
        const q = generateAddQuestion(min, max);
        practiceQuestions.push(q.question);
        practiceAnswers.push(q.answer);
    }

    for (let i = 0; i < (settings.countSub || 0); i++) {
        const q = generateSubQuestion(min, max, noNegative);
        practiceQuestions.push(q.question);
        practiceAnswers.push(q.answer);
    }

    for (let i = 0; i < (settings.countMul || 0); i++) {
        const q = generateMulQuestion(min, max);
        practiceQuestions.push(q.question);
        practiceAnswers.push(q.answer);
    }

    for (let i = 0; i < (settings.countDiv || 0); i++) {
        const q = generateDivQuestion(min, max, noRemainder);
        practiceQuestions.push(q.question);
        practiceAnswers.push(q.answer);
    }

    for (let i = 0; i < (settings.countMixed || 0); i++) {
        const q = generateMixedQuestion(min, max, noNegative);
        practiceQuestions.push(q.question);
        practiceAnswers.push(q.answer);
    }

    for (let i = 0; i < (settings.countBracket || 0); i++) {
        const q = generateBracketQuestion(min, max);
        practiceQuestions.push(q.question);
        practiceAnswers.push(q.answer);
    }

    // 如果没有设置题目数量，默认生成10道题
    if (practiceQuestions.length === 0) {
        for (let i = 0; i < 5; i++) practiceQuestions.push(generateAddQuestion(1, 20).question), practiceAnswers.push(generateAddQuestion(1, 20).answer);
        for (let i = 0; i < 5; i++) practiceQuestions.push(generateSubQuestion(1, 20, true).question), practiceAnswers.push(generateSubQuestion(1, 20, true).answer);
    }

    // 打乱顺序
    for (let i = practiceQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [practiceQuestions[i], practiceQuestions[j]] = [practiceQuestions[j], practiceQuestions[i]];
        [practiceAnswers[i], practiceAnswers[j]] = [practiceAnswers[j], practiceAnswers[i]];
    }

    // 渲染题目
    const container = document.getElementById('practice-questions');
    container.innerHTML = practiceQuestions.map((q, i) =>
        '<div class="practice-question"><span class="question-number">' + (i + 1) + '.</span><span class="question-text">' + q + '</span><input type="number" class="answer-input" id="answer-' + i + '" oninput="updateAnsweredCount()" placeholder="?"></div>'
    ).join('');

    document.getElementById('total-count').textContent = practiceQuestions.length;
    document.getElementById('answered-count').textContent = 0;

    if (timerInterval) clearInterval(timerInterval);
    elapsedSeconds = 0;
    startTime = Date.now();
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

// 更新计时器
function updateTimer() {
    elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
    const secs = (elapsedSeconds % 60).toString().padStart(2, '0');
    document.getElementById('timer').textContent = mins + ':' + secs;
}

// 更新已答题数
function updateAnsweredCount() {
    let answered = 0;
    for (let i = 0; i < practiceQuestions.length; i++) {
        const input = document.getElementById('answer-' + i);
        if (input && input.value.trim() !== '') answered++;
    }
    document.getElementById('answered-count').textContent = answered;
}

// 提交答案
function submitAnswers() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    let correct = 0;
    const wrongQuestions = [];

    for (let i = 0; i < practiceQuestions.length; i++) {
        const input = document.getElementById('answer-' + i);
        const userAnswer = parseInt(input.value) || 0;
        const correctAnswer = practiceAnswers[i];

        if (userAnswer === correctAnswer) {
            correct++;
            input.classList.add('correct');
            input.classList.remove('wrong');
        } else {
            input.classList.add('wrong');
            input.classList.remove('correct');

            const parent = input.parentElement;
            let correctSpan = parent.querySelector('.correct-answer');
            if (!correctSpan) {
                correctSpan = document.createElement('span');
                correctSpan.className = 'correct-answer';
                parent.appendChild(correctSpan);
            }
            correctSpan.textContent = '正确答案: ' + correctAnswer;

            wrongQuestions.push({
                question: practiceQuestions[i],
                userAnswer: userAnswer,
                correctAnswer: correctAnswer,
                time: new Date().toISOString()
            });
        }
    }

    if (wrongQuestions.length > 0) {
        const saved = JSON.parse(localStorage.getItem('wrongQuestions') || '[]');
        saved.push(...wrongQuestions);
        localStorage.setItem('wrongQuestions', JSON.stringify(saved.slice(-100)));
    }

    const score = Math.round((correct / practiceQuestions.length) * 100);
    document.getElementById('result-score').textContent = score;
    document.getElementById('result-detail').textContent =
        '正确 ' + correct + ' 题，错误 ' + (practiceQuestions.length - correct) + ' 题，用时 ' + formatTime(elapsedSeconds);
    document.getElementById('result-modal').style.display = 'flex';

    const history = JSON.parse(localStorage.getItem('practiceHistory') || '[]');
    history.push({
        date: new Date().toISOString(),
        total: practiceQuestions.length,
        correct: correct,
        time: elapsedSeconds,
        score: score
    });
    localStorage.setItem('practiceHistory', JSON.stringify(history.slice(-50)));
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins + '分' + secs + '秒';
}

function closeResult() {
    document.getElementById('result-modal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
    startPractice();
});
