(function () { 'use strict'; }());
var Key = function (val) {
    this.value = val;
    this.getValue = function () {
        return this.value;
    };
};

var less = function (that, other) {
    return that.getValue() < other.getValue();
};

var greater = function (that, other) {
    return that.getValue() > other.getValue();
};

Key.prototype.toString = function () {
    return this.getValue().toString();
};

var MaxHeap = function (arr, comp) {
    var items = arr || [];
    if (comp === undefined) { comp = greater; }
    var exch = function (i, j) {
        var temp = items[i];
        items[i] = items[j];
        items[j] = temp;
    };
    var swim = function (k) {
        var p = Math.floor((k - 1) / 2);
        while (k > 0 && comp(items[p], items[k])) {
            exch(p, k);
            k = p;
            p = Math.floor((k - 1) / 2);
        }
    };
    var sink = function (k) {
        var child;
        while (2 * k  + 1 < items.length) {
            child = 2 * k + 1;
            if (child + 1 < items.length && comp(items[child], items[child + 1])) { child += 1; }
            if (comp(items[child], items[k])) { break; }
            exch(k, child);
            k = child;
        }
    };
    this.insert = function (item) {
        items.push(item);
        swim(items.length - 1);
    };
    this.delMax = function () {
        if (items.length < 1) { throw 'End of array'; }
        var max = items[0];
        exch(0, items.length - 1);
        items.pop();
        sink(0);
        return max;
    };
    this.size = function () {
        return items.length;
    };
    this.printTree = function () {
        var i, j, res;
        for (i = 1; i < items.length; i *= 2) {
            res = '';
            for (j = 0; j < i && i - 1 + j < items.length; j += 1) {
                res += items[i - 1 + j] + '  ';
            }
            console.log(res);
        }
    };
};