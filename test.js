function parsePrivateKey(expression) {
    // 递归解析和计算表达式，返回计算结果
    function calculate(index) {
        let num = '';
        let result = null; // 累积的结果值

        while (index < expression.length) {
            const char = expression[index];

            // 处理数字和小数点
            if (!isNaN(char) || char === '.') {
                num += char; // 累积数字或小数点
                index++;
            }
            // 处理 √ 符号，递归计算 √ 后面的表达式
            else if (char === '√') {
                let sqrtValue;
                const [subResult, newIndex] = calculate(index + 1); // 递归解析 √ 后的表达式
                sqrtValue = Math.sqrt(parseFloat(subResult.join(''))); // 对后面的结果开平方根
                index = newIndex;

                if (result === null) {
                    result = sqrtValue;
                } else {
                    result *= sqrtValue; // 将开平方后的值与当前结果相乘
                }
                num = ''; // 清空 num
            }
            // 处理 π 符号，将前面的数字乘以 π
            else if (char === 'π') {
                if (num) {
                    let value = parseFloat(num);
                    if (result === null) {
                        result = value * Math.PI;
                    } else {
                        result *= Math.PI * value; // 乘以 π 并更新结果
                    }
                    num = ''; // 清空当前数字
                } else {
                    // 如果 num 为空，则视为 1 * π
                    if (result === null) {
                        result = Math.PI;
                    } else {
                        result *= Math.PI;
                    }
                }
                index++;
            }
            // 遇到其他字符或表达式结束时，停止
            else {
                break;
            }
        }

        // 当循环结束时，将最后累积的数字处理
        if (num) {
            if (result === null) {
                result = parseFloat(num);
            } else {
                result *= parseFloat(num); // 将累积的数值乘以结果
            }
        }

        return [[result], index];
    }

    const [finalResult] = calculate(0); // 从索引 0 开始递归解析表达式
    return finalResult;
}

// 用于生成私钥移位量并扩展到目标长度
function generateShiftArrayFromPrivateKey(privateKey, encryptLength) {
    // 递归计算私钥表达式
    let resultArray = parsePrivateKey(privateKey);

    // 忽略小数点，将结果转换为数字数组
    resultArray = resultArray.join('').replace('.', '').split('').map(Number);

    // 扩展结果数组到加密字符的长度
    let finalArray = [];
    for (let i = 0; i < encryptLength; i++) {
        finalArray.push(resultArray[i % resultArray.length]);
    }

    return finalArray;
}

// 示例用法
let privateKey = "";
let encryptLength = 30;
let result = generateShiftArrayFromPrivateKey(privateKey, encryptLength);
console.log(result); // 输出扩展后的移位量数组
