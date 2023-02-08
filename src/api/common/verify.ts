// 正数、一位小数
export let verifyFigure = /^(0|\d{1,}|(0|[1-9]*)+(\.[0-9]{1,1})|([1-9]\d*))?$/;

// 正数、 小数
export let verifyDecimals = /^(([0-9]+)|([0-9]+\.[0-9]+))$/;

// 正数、两位小数
export let verifyPositive = /^(0|\d{1,}|(0|[1-9]*)+(\.[0-9]{1,2})|([1-9]\d*))?$/;

// 正数、负数、0、一位小数
export let verifyFigures = /^((-?[0-9]\d*)+((\.[0-9]{1,1})|([1-9]\d*))?)$/;

// 正数、负数、0、两位小数
export let verifyTwoFigures = /^((-?[0-9]\d*)+((\.[0-9]{1,2})|([1-9]\d*))?)$/;

// 正数
export let verifyPlus = /^(0|\d{1,}|(0|[1-9]*)+(\.[0-9]{1,})|([1-9]\d*))?$/;

// 正整数、负整数、0
export let verifyInts = /^-?[0-9]\d*$/;

// 正整数、一位小数
export let verifyInt = /^((0|[1-9]*)+(\.[0-9]{1,1})|([1-9]\d*))?$/;

// 数字在0~100小数保留一位小数
export let verify_0_100_01 = /^(\d{1,2}(\.\d{1})?|100|100\.0)$/;

// 数字在0~100小数保留两位小数
export let verify_0_100_02 = /^(\d{1,2}(\.\d{1,2})?|100|100\.0|100\.00)$/;

// 电话
export let verifyPhone = /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/;

// 电话、固定电话
export let verifyRelation = /^((\d{3}-\d{7,8}|\d{4}-\d{7,8})|(1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}))$/;

// 电话组
export let verifyPhones = /^(1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}[\r\n]?)(\,[\r\n]?(1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}))*$/;

// 邮箱
export let verifyEmail = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;

// 验证密码 长度为8且至少包含数字、字母、特殊字符两种
export let verifyPwd = /^(?!\d+$)(?!^[a-zA-Z]+$)(?!^[_#@]+$).{8,}$/;

// ip地址
export let verifyIp = /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/;

// 端口号
export let verifyPort = /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]{1}|6553[0-5])$/;

// 身份证
export let verifyIdCard = /(^\d{15}$)|(^\d{17}([0-9]|X)$)/;

// 护照
export let verifyPassport = /^1[45][0-9]{7}$|(^[P|p|S|s]\d{7}$)|(^[S|s|G|g|E|e]\d{8}$)|(^[Gg|Tt|Ss|Ll|Qq|Dd|Aa|Ff]\d{8}$)|(^[H|h|M|m]\d{8,10}$)/;

// 经度
export let verifylongitude = /^[\-\+]?(0(\.\d{1,10})?|([1-9](\d)?)(\.\d{1,10})?|1[0-7]\d{1}(\.\d{1,10})?|180\.0{1,10})$/;

// 纬度
export let verifylatitude = /^[\-\+]?((0|([1-8]\d?))(\.\d{1,10})?|90(\.0{1,10})?)$/;
