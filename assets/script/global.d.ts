interface String {
    format(...param);
}

String.prototype.format = function (...param) {
    //将arguments转化为数组（ES5中并非严格的数组）
    var args = Array.prototype.slice.call(arguments);
    var count = 0;
    //通过正则替换%s
    return this.replace(/%s/g, function (s, i) {
        return args[count++];
    });
}