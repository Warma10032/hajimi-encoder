// 字符到三进制字符串的转换函数
function charToTrinaryString(char) {
    let unicode_val = char.charCodeAt(0);
    let trinary_str = '';
    while (unicode_val > 0) {
        let remainder = unicode_val % 3;
        trinary_str = remainder + trinary_str;
        unicode_val = Math.floor(unicode_val / 3);
    }
    return trinary_str;
}

// 将三进制的数字替换为 '哈'、'基'、'米'
function trinaryToHajiami(trinary_str, mapping) {
    return [...trinary_str].map(digit => mapping[digit]).join('');
}

// 将 '哈'、'基'、'米' 转换回三进制数字
function hajiamiToTrinary(hajiami_str, reverse_mapping) {
    return [...hajiami_str].map(char => reverse_mapping[char]).join('');
}

// 生成一个随机偏移量，用于改变加密的表现形式
function generateRandomShift(i=null) {
    return Math.floor(Math.random() * 9); // 生成 0 到 8 的随机数
}

// 将随机偏移量（0-9）转换为哈基米
function shiftToHajiami(shift,mapping) {
    let trinaryStr = shift.toString(3).padStart(2, '0');  // 转换为三进制并补足两位
    return trinaryStr.split('').map(digit => mapping[digit]).join('');
}

// 将哈基米转换回对应的偏移量（数字0-9）
function hajiamiToShift(hajiami,reverse_mapping) {
    let trinaryStr = hajiami.split('').map(char => reverse_mapping[char]).join('');
    // 将三进制字符串转换回十进制数字
    return parseInt(trinaryStr, 3);
}

// 凯撒加密的辅助函数
function caesarEncrypt(unicode_val, shift) {
    return unicode_val + shift;
}

// 凯撒解密的辅助函数
function caesarDecrypt(unicode_val, shift) {
    return unicode_val - shift;
}

// 对三进制字符串右移 n 位
function rightShiftTrinary(trinary_str, n) {
    return trinary_str.slice(-n) + trinary_str.slice(0, -n);
}

// 对三进制字符串左移 n 位
function leftShiftTrinary(trinary_str, n) {
    return trinary_str.slice(n) + trinary_str.slice(0, n);
}

// 编码函数：加密字符串，并且每个字符有随机的偏移量
function encodeHajiami(inputStr, baseShift = 3,mapping,shiftArray) { // 基础位移量为3
    let encodedStr = '';
    for (let i = 0; i < inputStr.length; i++) {
        char = inputStr[i];
        
        let randomShift = generateRandomShift(); // 为每个字符生成一个随机偏移量
        if(shiftArray[0] !== undefined){
            totalShift = baseShift + randomShift + shiftArray[i]; // 总偏移量是基础位移+随机偏移+私钥偏移
        }
        else{
            totalShift = baseShift + randomShift; // 总偏移量是基础位移+随机偏移
        }
        let shiftedUnicode = caesarEncrypt(char.charCodeAt(0), totalShift); // 偏移后的 Unicode 值
        let trinary_str = charToTrinaryString(String.fromCharCode(shiftedUnicode)); // Unicode 值转为三进制字符串
        let length = trinary_str.length;

        // 根据长度选择前缀并补齐三进制字符串
        let paddedTrinary, lengthIndicator;
        if (length <= 6) {
            paddedTrinary = trinary_str.padStart(6, '0');
            lengthIndicator = '0'; // 长度标识：0 表示 6 位
        } else if (length <= 9) {
            paddedTrinary = trinary_str.padStart(9, '0');
            lengthIndicator = '1'; // 长度标识：1 表示 9 位
        } else if (length <= 12) {
            paddedTrinary = trinary_str.padStart(12, '0');
            lengthIndicator = '2'; // 长度标识：2 表示 12 位
        } else {
            throw new Error("你说的真的是正常的人类的语言吗🤯");
        }

        // 随机化长度标识
        lengthIndicator = (lengthIndicator + randomShift) % 3;
        // 右移操作：根据 randomShift 确定右移位数
        let shiftedTrinary = rightShiftTrinary(paddedTrinary, randomShift);

        // 生成 2位凯撒移位编码 + 1位长度标识 + 三进制密文
        let shiftAsHajiami = shiftToHajiami(randomShift,mapping); // 将随机偏移量转为 "哈基米" 的形式
        let lengthAsHajiami = mapping[lengthIndicator]; // 长度标识转为 "哈基米" 的形式
        let inputAsHajiami = trinaryToHajiami(shiftedTrinary,mapping); // 三进制密文转为 "哈基米" 的形式
        encodedStr += shiftAsHajiami + lengthAsHajiami + inputAsHajiami; // 2位移位编码 + 1位长度标识 + 三进制密文
    }
    return encodedStr;
}

// 解码函数：根据加密时的随机偏移量正确解密字符
function decodeHajiami(encodedStr, baseShift = 3,reverse_mapping,shiftArray) {
    let decodedStr = '';
    for (let i = 0, j = 0; i < encodedStr.length; j++) {
        // 获取2位凯撒移位编码
        let shiftAsHajiami = encodedStr.slice(i, i + 2); // 读取两位作为偏移量
        let randomShift = hajiamiToShift(shiftAsHajiami,reverse_mapping); // 转换回数字
        i += 2; 

        // 获取长度标识
        let lengthAsHajiami = encodedStr[i];
        let lengthIndicator = reverse_mapping[lengthAsHajiami];
        lengthIndicator = (lengthIndicator - randomShift + 9) % 3; // 还原长度标识
        i += 1; // 长度标识占一位

        let length;
        if (lengthIndicator === 0) {
            length = 6;
        } else if (lengthIndicator === 1) {
            length = 9;
        } else if (lengthIndicator === 2) {
            length = 12;
        } else {
            throw new Error("不符合编码格式的密文");
        }

        // 获取密文部分
        let inputAsHajiami = encodedStr.slice(i, i + length);
        i += length;

        // 提取 reverse_mapping 的键
        let keys = Object.keys(reverse_mapping);
        // 创建动态正则表达式，匹配 keys 中的字符
        let regex = new RegExp(`^[${keys.join('')}]+$`);

        if (!regex.test(inputAsHajiami)) {
            throw new Error("不符合编码格式的密文");
        }

        // 左移操作：根据 randomShift 确定左移位数
        let originalTrinary = leftShiftTrinary(hajiamiToTrinary(inputAsHajiami,reverse_mapping), randomShift);
        // 三进制转为十进制unicode
        let unicode_val = parseInt(originalTrinary, 3);

        // 根据加密时的凯撒偏移量还原字符
        if(shiftArray[0] !== undefined){
            totalShift = baseShift + randomShift + shiftArray[j];
        }
        else{
            totalShift = baseShift + randomShift; // 总偏移量是基础位移加上随机偏移
        }
        let originalUnicode = caesarDecrypt(unicode_val, totalShift);
        decodedStr += String.fromCharCode(originalUnicode);
    }
    return decodedStr;
}

// 将私钥字符串的每个字符的 Unicode 码直接转换为 10 进制数值数组
function parsePrivateKey(privateKey) {
    let shiftArray = [];

    // 遍历私钥字符串中的每个字符
    for (let i = 0; i < privateKey.length; i++) {
        // 获取字符的 Unicode 编码 (十进制)
        let unicodeValue = privateKey.charCodeAt(i);

        // 将 Unicode 编码的每一位拆分为数字
        let decimalValueArray = unicodeValue.toString().split('').map(Number);

        // 将其加入偏移量数组
        shiftArray.push(...decimalValueArray);
    }

    return shiftArray; // 返回生成的偏移量数组
}

// 用于生成私钥移位量并扩展到目标长度
function generateShiftArrayFromPrivateKey(privateKey, encryptLength) {
    // 将私钥转换为偏移量数组
    let shiftArray = parsePrivateKey(privateKey);

    // 扩展偏移量数组到加密字符的长度
    let finalArray = [];
    for (let i = 0; i < encryptLength; i++) {
        finalArray.push(shiftArray[i % shiftArray.length]);
    }

    return finalArray;
}

// 加密文本
function encryptText() {
    let inputText = document.getElementById('inputText').value;
    if (inputText.trim() === '') {
        // 如果输入框为空，不进行任何操作
        return;
    }
    try{
        let encoderType = document.getElementById('encoderType').value;
        if (encoderType.length == 0){
            mapping = {'0': '哈', '1': '基', '2': '米'};
        }
        else if(encoderType.length == 3){
            if (encoderType[0] === encoderType[1] || encoderType[0] === encoderType[2] || encoderType[1] === encoderType[2]) {
                throw new Error("三进制编码的三个字符必须各不相同");
            }
            mapping = {'0': encoderType[0], '1': encoderType[1], '2': encoderType[2]};
        }
        else{
            throw new Error("三进制编码格式仅需要输入三个你想要用来编码的字符"); 
        }
        let privateKey = document.getElementById('privateKey').value;
        let shiftArray = generateShiftArrayFromPrivateKey(privateKey, inputText.length); // 根据私钥生成移位数组
        let encodedText = encodeHajiami(inputText, 3, mapping, shiftArray); // 加密
        document.getElementById('outputText').value = encodedText;
        document.getElementById('error').innerText = '';
    } catch (error) {
        document.getElementById('error').innerText = '加密失败: ' + error.message;
    } 
}

// 解密文本
function decryptText() {
    let inputText = document.getElementById('outputText').value;
    if (inputText.trim() === '') {
        // 如果输出框为空，不进行任何操作
        return;
    }
    try {
        let encoderType = document.getElementById('encoderType').value;
        if (encoderType.length == 0){
            reverse_mapping = {'哈' : 0, '基' : 1, '米' : 2};
        }
        else if(encoderType.length == 3){
            if (encoderType[0] === encoderType[1] || encoderType[0] === encoderType[2] || encoderType[1] === encoderType[2]) {
                throw new Error("三进制编码的三个字符必须各不相同");
            }
            reverse_mapping = {[encoderType[0]] : 0,  [encoderType[1]] : 1, [encoderType[2]] : 2};
        }
        else{
            throw new Error("三进制编码格式仅需要输入三个你想要用来编码的字符"); 
        }
        let privateKey = document.getElementById('privateKey').value;
        let shiftArray = generateShiftArrayFromPrivateKey(privateKey, inputText.length); // 根据私钥生成移位数组
        let decodedText = decodeHajiami(inputText, 3, reverse_mapping, shiftArray); // 解密
        document.getElementById('inputText').value = decodedText;
        document.getElementById('error').innerText = '';
    } catch (error) {
        document.getElementById('error').innerText = '解密失败: ' + error.message;
    }
}

// 复制到剪贴板
function copyToClipboard(textareaId, button) {
    const textarea = document.getElementById(textareaId);
    const textToCopy = textarea.value; // 获取文本区的内容
    navigator.clipboard.writeText(textToCopy).then(() => {
        textarea.blur(); // 取消选中状态
        showToast(button); // 显示复制成功的提示
    }).catch(error => {
        console.error('复制失败: ', error); // 处理复制失败的情况
    });
}

// 显示 Toast 提示
function showToast(button) {
    const toast = button.nextElementSibling; // 获取相应的toast提示框
    toast.classList.add("show"); // 显示 Toast 提示
    setTimeout(function() {
        toast.classList.remove("show"); // 3秒后隐藏
    }, 3000);
}

// 随机设置背景图片，排除当前展示的图片
window.onload = function() {
    const leftImages = ['../resources/东海帝皇1.jpg', '../resources/东海帝皇2.jpg', '../resources/东海帝皇3.jpg', '../resources/东海帝皇4.jpg']; // 左侧图片数组
    const rightImages = ['../resources/诗歌剧1.jpg', '../resources/诗歌剧2.jpg', '../resources/诗歌剧3.jpg', '../resources/诗歌剧4.jpg']; // 右侧图片数组

    // 随机选择新的左侧图片
    const leftImageIndex = Math.floor(Math.random() * leftImages.length);
    document.body.style.setProperty('--left-bg-image', `url('${leftImages[leftImageIndex]}')`);

    // 随机选择新的右侧图片
    const rightImageIndex = Math.floor(Math.random() * rightImages.length);
    document.body.style.setProperty('--right-bg-image', `url('${rightImages[rightImageIndex]}')`);
};
