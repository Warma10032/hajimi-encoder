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
function trinaryToHajiami(trinary_str) {
    let mapping = {'0': '哈', '1': '基', '2': '米'};
    return [...trinary_str].map(digit => mapping[digit]).join('');
}

// 将 '哈'、'基'、'米' 转换回三进制数字
function hajiamiToTrinary(hajiami_str) {
    let reverse_mapping = {'哈': '0', '基': '1', '米': '2'};
    return [...hajiami_str].map(char => reverse_mapping[char]).join('');
}

// 编码函数
function encodeHajiami(inputStr) {
    let encodedStr = '';
    for (let char of inputStr) {
        let trinary_str = charToTrinaryString(char);
        let length = trinary_str.length;

        // 根据长度选择前缀并补齐三进制字符串
        let prefix, paddedTrinary;
        if (length <= 6) {
            prefix = '哈';
            paddedTrinary = trinary_str.padStart(6, '0');
        } else if (length <= 9) {
            prefix = '基';
            paddedTrinary = trinary_str.padStart(9, '0');
        } else if (length <= 12) {
            prefix = '米';
            paddedTrinary = trinary_str.padStart(12, '0');
        } else {
            throw new Error("你的话超出正常人类的理解范围了吧");
        }

        let hajiami_str = trinaryToHajiami(paddedTrinary);
        encodedStr += prefix + hajiami_str;
    }
    return encodedStr;
}

// 解码函数
function decodeHajiami(encodedStr) {
    let decodedStr = '';
    let i = 0;
    while (i < encodedStr.length) {
        let prefix = encodedStr[i];
        i++;

        let length;
        if (prefix === '哈') {
            length = 6;
        } else if (prefix === '基') {
            length = 9;
        } else if (prefix === '米') {
            length = 12;
        } else {
            throw new Error("无效的哈基米编码，曼波听不懂哦~");
        }

        let hajiami_str = encodedStr.slice(i, i + length);
        i += length;

        // 检查是否合法的"哈""基""米"
        if (!/^[哈基米]+$/.test(hajiami_str)) {
            throw new Error("无效的哈基米编码，曼波听不懂哦~");
        }

        let trinary_str = hajiamiToTrinary(hajiami_str);
        let unicode_val = parseInt(trinary_str, 3);
        decodedStr += String.fromCharCode(unicode_val);
    }
    return decodedStr;
}

// 加密文本
function encryptText() {
    let inputText = document.getElementById('inputText').value;
    if (inputText.trim() === '') {
        // 如果输入框为空，不进行任何操作
        return;
    }
    let encodedText = encodeHajiami(inputText);
    document.getElementById('outputText').value = encodedText;
    document.getElementById('error').innerText = '';
}

// 解密文本
function decryptText() {
    let inputText = document.getElementById('outputText').value;
    if (inputText.trim() === '') {
        // 如果输出框为空，不进行任何操作
        return;
    }
    try {
        let decodedText = decodeHajiami(inputText);
        document.getElementById('inputText').value = decodedText;
        document.getElementById('error').innerText = '';
    } catch (error) {
        document.getElementById('error').innerText = '解密失败: ' + error.message;
    }
}


// 复制到剪贴板
function copyToClipboard(textareaId, button) {
    const textarea = document.getElementById(textareaId);
    textarea.select();
    textarea.setSelectionRange(0, 99999); // 兼容移动端
    document.execCommand('copy');
    textarea.blur(); // 取消选中状态
    showToast(button); // 显示复制成功的提示
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
