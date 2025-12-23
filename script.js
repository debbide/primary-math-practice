/**
 * 小学生算术练习题生成器
 * 支持加减乘除四则运算，可自定义数字范围，A4纸打印输出
 */

// 存储生成的题目和答案
let questions = [];
let answers = [];

/**
 * 生成指定范围内的随机整数
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 生成指定范围内的随机小数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @param {number} decimalPlaces - 小数位数 (1 或 2)
 */
function randomDecimal(min, max, decimalPlaces) {
    const multiplier = Math.pow(10, decimalPlaces);
    const minInt = Math.ceil(min * multiplier);
    const maxInt = Math.floor(max * multiplier);
    const randomValue = Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
    return randomValue / multiplier;
}

/**
 * 格式化数字显示（小数去除末尾0）
 */
function formatNumber(num, decimalPlaces) {
    if (Number.isInteger(num)) return num.toString();
    return parseFloat(num.toFixed(decimalPlaces)).toString();
}

/**
 * 生成单道题目
 * @param {boolean} enableDecimal - 是否启用小数
 * @param {number} decimalPlaces - 小数位数
 */
function generateSingleQuestion(min, max, operators, noNegative, noRemainder, enableDecimal = false, decimalPlaces = 1) {
    const maxAttempts = 100;
    let attempts = 0;

    // 生成随机数的辅助函数
    const getRandomNum = () => {
        if (enableDecimal) {
            return randomDecimal(min, max, decimalPlaces);
        }
        return randomInt(min, max);
    };

    while (attempts < maxAttempts) {
        attempts++;
        const operator = operators[randomInt(0, operators.length - 1)];
        let num1, num2, answer;

        switch (operator) {
            case '+':
                num1 = getRandomNum();
                num2 = getRandomNum();
                // 确保两个数字不相等
                while (num1 === num2 && max > min) {
                    num2 = getRandomNum();
                }
                answer = num1 + num2;
                // 处理浮点数精度问题
                if (enableDecimal) {
                    answer = parseFloat(answer.toFixed(decimalPlaces));
                }
                break;

            case '−':
                num1 = getRandomNum();
                num2 = getRandomNum();
                // 确保两个数字不相等，避免 x - x = 0 的情况
                while (num1 === num2 && max > min) {
                    num2 = getRandomNum();
                }
                // 确保减法结果不为负数
                if (noNegative && num1 < num2) {
                    [num1, num2] = [num2, num1];
                }
                answer = num1 - num2;
                // 处理浮点数精度问题
                if (enableDecimal) {
                    answer = parseFloat(answer.toFixed(decimalPlaces));
                }
                break;

            case '×':
                // 乘法
                if (enableDecimal) {
                    // 小数乘法：两个操作数都是小数
                    num1 = randomDecimal(min, max, decimalPlaces);
                    num2 = randomDecimal(1, 5, decimalPlaces); // 第二个数用较小范围避免结果过大
                    answer = parseFloat((num1 * num2).toFixed(decimalPlaces));
                } else {
                    const mulMax = Math.min(max, 12);
                    num1 = randomInt(min, mulMax);
                    num2 = randomInt(min, mulMax);
                    answer = num1 * num2;
                }
                break;

            case '÷':
                // 除法
                if (enableDecimal) {
                    // 小数除法：两个操作数都是小数
                    num1 = randomDecimal(min, max, decimalPlaces);
                    num2 = randomDecimal(1, 5, decimalPlaces); // 除数用较小范围避免结果过小
                    // 确保除数不为0
                    while (num2 === 0) {
                        num2 = randomDecimal(1, 5, decimalPlaces);
                    }
                    answer = parseFloat((num1 / num2).toFixed(decimalPlaces));
                } else if (noRemainder) {
                    const divMax = Math.min(max, 12);
                    answer = randomInt(1, divMax);
                    num2 = randomInt(1, Math.min(max, 12));
                    num1 = answer * num2;
                    if (num1 > max * 12) {
                        continue;
                    }
                } else {
                    num1 = randomInt(min, max);
                    num2 = randomInt(Math.max(1, min), max);
                    answer = Math.floor(num1 / num2);
                }
                break;
        }

        const displayNum1 = enableDecimal ? formatNumber(num1, decimalPlaces) : num1;
        const displayNum2 = enableDecimal ? formatNumber(num2, decimalPlaces) : num2;

        return {
            question: `${displayNum1} ${operator} ${displayNum2} = `,
            answer: answer
        };
    }

    // 默认返回加法
    const num1 = getRandomNum();
    const num2 = getRandomNum();
    const answer = enableDecimal ? parseFloat((num1 + num2).toFixed(decimalPlaces)) : num1 + num2;
    return {
        question: `${formatNumber(num1, decimalPlaces)} + ${formatNumber(num2, decimalPlaces)} = `,
        answer: answer
    };
}

/**
 * 生成混合运算题目（如 3 + 5 - 2）
 */
function generateMixedQuestion(min, max, noNegative) {
    const ops = ['+', '−'];
    const op1 = ops[randomInt(0, 1)];
    const op2 = ops[randomInt(0, 1)];

    let num1 = randomInt(min, max);
    let num2 = randomInt(min, Math.min(max, 15));
    let num3 = randomInt(min, Math.min(max, 15));

    // 计算中间结果和最终结果
    let temp = op1 === '+' ? num1 + num2 : num1 - num2;
    let answer = op2 === '+' ? temp + num3 : temp - num3;

    // 如果需要避免负数，调整数字
    if (noNegative && answer < 0) {
        // 重新生成
        return generateMixedQuestion(min, max, noNegative);
    }

    return {
        question: `${num1} ${op1} ${num2} ${op2} ${num3} = `,
        answer: answer
    };
}

/**
 * 生成括号运算题目（如 (3 + 5) × 2）
 */
function generateBracketQuestion(min, max) {
    const innerOps = ['+', '−'];
    const outerOps = ['×', '÷'];
    const innerOp = innerOps[randomInt(0, 1)];
    const outerOp = outerOps[randomInt(0, 1)];

    let num1 = randomInt(min, Math.min(max, 10));
    let num2 = randomInt(min, Math.min(max, 10));
    let num3 = randomInt(2, Math.min(max, 5));

    // 确保减法不产生负数
    if (innerOp === '−' && num1 < num2) {
        [num1, num2] = [num2, num1];
    }

    const innerResult = innerOp === '+' ? num1 + num2 : num1 - num2;
    let answer;

    if (outerOp === '×') {
        answer = innerResult * num3;
    } else {
        // 除法需要确保整除
        num3 = randomInt(2, 5);
        const product = innerResult * num3;
        // 调整为可整除的形式
        return {
            question: `(${num1} ${innerOp} ${num2}) × ${num3} = `,
            answer: innerResult * num3
        };
    }

    return {
        question: `(${num1} ${innerOp} ${num2}) ${outerOp} ${num3} = `,
        answer: answer
    };
}

/**
 * 生成填空题（如 3 + __ = 8）
 */
function generateFillBlankQuestion(min, max, noNegative) {
    const ops = ['+', '−'];
    const op = ops[randomInt(0, 1)];
    const blankPosition = randomInt(0, 1); // 0: 第一个数空缺, 1: 第二个数空缺

    let num1 = randomInt(min, max);
    let num2 = randomInt(min, max);

    // 确保减法不产生负数
    if (noNegative && op === '−' && num1 < num2) {
        [num1, num2] = [num2, num1];
    }

    const result = op === '+' ? num1 + num2 : num1 - num2;
    let question, answer;

    if (blankPosition === 0) {
        // 第一个数空缺: __ + 5 = 8
        question = `<span class="fill-blank"></span> ${op} ${num2} = ${result}`;
        answer = num1;
    } else {
        // 第二个数空缺: 3 + __ = 8
        question = `${num1} ${op} <span class="fill-blank"></span> = ${result}`;
        answer = num2;
    }

    return { question, answer };
}

/**
 * 生成竖式运算题目
 */
function generateVerticalQuestion(min, max, noNegative) {
    const ops = ['+', '−'];
    const op = ops[randomInt(0, 1)];

    let num1 = randomInt(min, max);
    let num2 = randomInt(min, max);

    // 确保减法不产生负数
    if (noNegative && op === '−' && num1 < num2) {
        [num1, num2] = [num2, num1];
    }

    const answer = op === '+' ? num1 + num2 : num1 - num2;

    // 生成竖式 HTML
    const question = `<div class="vertical-calc">
        <div class="v-row">${num1}</div>
        <div class="v-row"><span class="v-op">${op}</span>${num2}</div>
        <div class="v-line"></div>
        <div class="v-row v-answer"></div>
    </div>`;

    return { question, answer, isVertical: true };
}

/**
 * 生成所有题目
 */
function generateQuestions() {
    // 获取每种运算的题目数量
    const countAdd = parseInt(document.getElementById('count-add').value) || 0;
    const countSub = parseInt(document.getElementById('count-sub').value) || 0;
    const countMul = parseInt(document.getElementById('count-mul').value) || 0;
    const countDiv = parseInt(document.getElementById('count-div').value) || 0;
    const countMixed = parseInt(document.getElementById('count-mixed')?.value) || 0;
    const countBracket = parseInt(document.getElementById('count-bracket')?.value) || 0;
    const countFillBlank = parseInt(document.getElementById('count-fillblank')?.value) || 0;
    const countVertical = parseInt(document.getElementById('count-vertical')?.value) || 0;

    const minNum = parseInt(document.getElementById('min-num').value) || 1;
    const maxNum = parseInt(document.getElementById('max-num').value) || 20;
    const columns = document.getElementById('columns').value;
    const questionOrder = document.getElementById('question-order').value;

    const noNegative = document.getElementById('no-negative').checked;
    const noRemainder = document.getElementById('no-remainder').checked;
    const showAnswers = document.getElementById('show-answers').checked;

    // 小数设置
    const enableDecimal = document.getElementById('enable-decimal')?.checked || false;
    const decimalPlaces = parseInt(document.getElementById('decimal-places')?.value) || 1;

    const sheetTitle = document.getElementById('sheet-title').value || '小学算术练习题';

    // 验证是否有题目需要生成
    const totalCount = countAdd + countSub + countMul + countDiv + countMixed + countBracket + countFillBlank + countVertical;
    if (totalCount === 0) {
        alert('请至少设置一种运算的题目数量！');
        return;
    }

    // 验证数字范围
    if (minNum >= maxNum) {
        alert('最小值必须小于最大值！');
        return;
    }

    // 生成题目
    questions = [];
    answers = [];
    const usedQuestions = new Set();

    // 按运算类型生成题目
    const operationConfigs = [
        { operator: '+', count: countAdd },
        { operator: '−', count: countSub },
        { operator: '×', count: countMul },
        { operator: '÷', count: countDiv }
    ];

    operationConfigs.forEach(config => {
        for (let i = 0; i < config.count; i++) {
            let questionData;
            let attempts = 0;

            // 尝试生成不重复的题目
            do {
                questionData = generateSingleQuestion(minNum, maxNum, [config.operator], noNegative, noRemainder, enableDecimal, decimalPlaces);
                attempts++;
            } while (usedQuestions.has(questionData.question) && attempts < 50);

            usedQuestions.add(questionData.question);
            questions.push(questionData.question);
            answers.push(questionData.answer);
        }
    });

    // 生成混合运算题目
    for (let i = 0; i < countMixed; i++) {
        const questionData = generateMixedQuestion(minNum, maxNum, noNegative);
        questions.push(questionData.question);
        answers.push(questionData.answer);
    }

    // 生成括号运算题目
    for (let i = 0; i < countBracket; i++) {
        const questionData = generateBracketQuestion(minNum, maxNum);
        questions.push(questionData.question);
        answers.push(questionData.answer);
    }

    // 生成填空题
    for (let i = 0; i < countFillBlank; i++) {
        const questionData = generateFillBlankQuestion(minNum, maxNum, noNegative);
        questions.push(questionData.question);
        answers.push(questionData.answer);
    }

    // 生成竖式运算题目
    for (let i = 0; i < countVertical; i++) {
        const questionData = generateVerticalQuestion(minNum, maxNum, noNegative);
        questions.push(questionData.question);
        answers.push(questionData.answer);
    }

    // 根据设置决定是否打乱顺序
    if (questionOrder === 'random') {
        // Fisher-Yates 洗牌算法
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
            [answers[i], answers[j]] = [answers[j], answers[i]];
        }
    }

    // 渲染题目
    renderQuestions(columns, sheetTitle, showAnswers);

    // 添加生成成功的动画效果
    const container = document.getElementById('questions-container');
    container.classList.add('fade-in');
    setTimeout(() => container.classList.remove('fade-in'), 500);
}

/**
 * 渲染题目到页面
 */
function renderQuestions(columns, title, showAnswers) {
    // 更新标题
    document.getElementById('display-title').textContent = title;

    // 渲染题目
    const questionsContainer = document.getElementById('questions-container');
    questionsContainer.innerHTML = '';
    questionsContainer.className = `questions-grid cols-${columns}`;


    questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        // 填空题和竖式题已包含完整格式，不需要加下划线
        const suffix = question.includes('fill-blank') || question.includes('vertical-calc') || (question.includes('= ') && !question.endsWith('= ')) ? '' : '______';
        questionDiv.innerHTML = `
            <span class="question-number">${index + 1}.</span>
            <span class="question-content">${question}${suffix}</span>
        `;
        questionsContainer.appendChild(questionDiv);
    });

    // 渲染答案页
    const answerSheet = document.getElementById('answer-sheet');
    const answersContainer = document.getElementById('answers-container');

    if (showAnswers) {
        answerSheet.style.display = 'block';
        answersContainer.innerHTML = '';

        answers.forEach((answer, index) => {
            const answerDiv = document.createElement('div');
            answerDiv.className = 'answer-item';
            answerDiv.innerHTML = `
                <span class="question-number">${index + 1}.</span>
                <span class="answer-value">${answer}</span>
            `;
            answersContainer.appendChild(answerDiv);
        });
    } else {
        answerSheet.style.display = 'none';
    }
}

/**
 * 打印练习卷
 */
function printSheet() {
    if (questions.length === 0) {
        alert('请先生成题目！');
        return;
    }
    window.print();
}

// 添加淡入动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .fade-in {
        animation: fadeIn 0.5s ease-out;
    }
`;
document.head.appendChild(style);

// 更新总题数显示
function updateTotalCount() {
    const countAdd = parseInt(document.getElementById('count-add').value) || 0;
    const countSub = parseInt(document.getElementById('count-sub').value) || 0;
    const countMul = parseInt(document.getElementById('count-mul').value) || 0;
    const countDiv = parseInt(document.getElementById('count-div').value) || 0;
    const countMixed = parseInt(document.getElementById('count-mixed')?.value) || 0;
    const countBracket = parseInt(document.getElementById('count-bracket')?.value) || 0;
    const countFillBlank = parseInt(document.getElementById('count-fillblank')?.value) || 0;
    const countVertical = parseInt(document.getElementById('count-vertical')?.value) || 0;
    const total = countAdd + countSub + countMul + countDiv + countMixed + countBracket + countFillBlank + countVertical;
    document.getElementById('total-questions').textContent = total;
}

// 保存设置到 localStorage
function saveSettings() {
    const settings = {
        countAdd: document.getElementById('count-add').value,
        countSub: document.getElementById('count-sub').value,
        countMul: document.getElementById('count-mul').value,
        countDiv: document.getElementById('count-div').value,
        countMixed: document.getElementById('count-mixed')?.value || 0,
        countBracket: document.getElementById('count-bracket')?.value || 0,
        countFillBlank: document.getElementById('count-fillblank')?.value || 0,
        countVertical: document.getElementById('count-vertical')?.value || 0,
        minNum: document.getElementById('min-num').value,
        maxNum: document.getElementById('max-num').value,
        columns: document.getElementById('columns').value,
        questionOrder: document.getElementById('question-order').value,
        noNegative: document.getElementById('no-negative').checked,
        noRemainder: document.getElementById('no-remainder').checked,
        showAnswers: document.getElementById('show-answers').checked,
        enableDecimal: document.getElementById('enable-decimal')?.checked || false,
        decimalPlaces: document.getElementById('decimal-places')?.value || 1,
        sheetTitle: document.getElementById('sheet-title').value
    };
    localStorage.setItem('mathPracticeSettings', JSON.stringify(settings));
}

// 保存在线练习设置
function savePracticeSettings() {
    const practiceSettings = {
        countAdd: parseInt(document.getElementById('count-add').value) || 0,
        countSub: parseInt(document.getElementById('count-sub').value) || 0,
        countMul: parseInt(document.getElementById('count-mul').value) || 0,
        countDiv: parseInt(document.getElementById('count-div').value) || 0,
        countMixed: parseInt(document.getElementById('count-mixed')?.value) || 0,
        countBracket: parseInt(document.getElementById('count-bracket')?.value) || 0,
        countFillBlank: parseInt(document.getElementById('count-fillblank')?.value) || 0,
        minNum: parseInt(document.getElementById('min-num').value) || 1,
        maxNum: parseInt(document.getElementById('max-num').value) || 20,
        noNegative: document.getElementById('no-negative').checked,
        noRemainder: document.getElementById('no-remainder').checked,
        enableDecimal: document.getElementById('enable-decimal')?.checked || false,
        decimalPlaces: parseInt(document.getElementById('decimal-places')?.value) || 1
    };
    localStorage.setItem('practiceSettings', JSON.stringify(practiceSettings));
}

// 从 localStorage 加载设置
function loadSettings() {
    const saved = localStorage.getItem('mathPracticeSettings');
    if (!saved) return;

    try {
        const settings = JSON.parse(saved);

        if (settings.countAdd !== undefined) document.getElementById('count-add').value = settings.countAdd;
        if (settings.countSub !== undefined) document.getElementById('count-sub').value = settings.countSub;
        if (settings.countMul !== undefined) document.getElementById('count-mul').value = settings.countMul;
        if (settings.countDiv !== undefined) document.getElementById('count-div').value = settings.countDiv;
        if (settings.countMixed !== undefined && document.getElementById('count-mixed')) document.getElementById('count-mixed').value = settings.countMixed;
        if (settings.countBracket !== undefined && document.getElementById('count-bracket')) document.getElementById('count-bracket').value = settings.countBracket;
        if (settings.countFillBlank !== undefined && document.getElementById('count-fillblank')) document.getElementById('count-fillblank').value = settings.countFillBlank;
        if (settings.countVertical !== undefined && document.getElementById('count-vertical')) document.getElementById('count-vertical').value = settings.countVertical;
        if (settings.minNum !== undefined) document.getElementById('min-num').value = settings.minNum;
        if (settings.maxNum !== undefined) document.getElementById('max-num').value = settings.maxNum;
        if (settings.columns !== undefined) document.getElementById('columns').value = settings.columns;
        if (settings.questionOrder !== undefined) document.getElementById('question-order').value = settings.questionOrder;
        if (settings.noNegative !== undefined) document.getElementById('no-negative').checked = settings.noNegative;
        if (settings.noRemainder !== undefined) document.getElementById('no-remainder').checked = settings.noRemainder;
        if (settings.showAnswers !== undefined) document.getElementById('show-answers').checked = settings.showAnswers;
        if (settings.enableDecimal !== undefined && document.getElementById('enable-decimal')) {
            document.getElementById('enable-decimal').checked = settings.enableDecimal;
            // 显示/隐藏小数位数选项
            const decimalOptions = document.getElementById('decimal-options');
            if (decimalOptions) {
                decimalOptions.style.display = settings.enableDecimal ? 'block' : 'none';
            }
        }
        if (settings.decimalPlaces !== undefined && document.getElementById('decimal-places')) {
            document.getElementById('decimal-places').value = settings.decimalPlaces;
        }
        if (settings.sheetTitle !== undefined) {
            document.getElementById('sheet-title').value = settings.sheetTitle;
            document.getElementById('display-title').textContent = settings.sheetTitle || '小学算术练习题';
        }
    } catch (e) {
        console.error('加载设置失败:', e);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    // 先加载保存的设置
    loadSettings();

    // 监听实时标题更新
    document.getElementById('sheet-title').addEventListener('input', function (e) {
        document.getElementById('display-title').textContent = e.target.value || '小学算术练习题';
        saveSettings();
    });

    // 监听运算数量变化，实时更新总题数
    ['count-add', 'count-sub', 'count-mul', 'count-div', 'count-mixed', 'count-bracket', 'count-fillblank', 'count-vertical'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', function () {
            updateTotalCount();
            saveSettings();
        });
        el.addEventListener('change', function () {
            const min = parseInt(this.min);
            const max = parseInt(this.max);
            let value = parseInt(this.value);

            if (isNaN(value)) value = 0;
            if (value < min) value = min;
            if (value > max) value = max;

            this.value = value;
            updateTotalCount();
            saveSettings();
        });
    });

    // 数字范围输入验证
    ['min-num', 'max-num'].forEach(id => {
        document.getElementById(id).addEventListener('change', function () {
            const min = parseInt(this.min);
            const max = parseInt(this.max);
            let value = parseInt(this.value);

            if (isNaN(value)) value = parseInt(this.defaultValue);
            if (value < min) value = min;
            if (value > max) value = max;

            this.value = value;
            saveSettings();
        });
    });

    // 监听其他设置变化
    ['columns', 'question-order'].forEach(id => {
        document.getElementById(id).addEventListener('change', saveSettings);
    });

    ['no-negative', 'no-remainder', 'show-answers'].forEach(id => {
        document.getElementById(id).addEventListener('change', saveSettings);
    });

    // 小数开关事件监听
    const enableDecimalCheckbox = document.getElementById('enable-decimal');
    const decimalOptionsDiv = document.getElementById('decimal-options');
    if (enableDecimalCheckbox && decimalOptionsDiv) {
        enableDecimalCheckbox.addEventListener('change', function () {
            decimalOptionsDiv.style.display = this.checked ? 'block' : 'none';
            saveSettings();
        });
    }

    // 小数位数选择事件监听
    const decimalPlacesSelect = document.getElementById('decimal-places');
    if (decimalPlacesSelect) {
        decimalPlacesSelect.addEventListener('change', saveSettings);
    }

    // 初始化总题数显示
    updateTotalCount();
});
