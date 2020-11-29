
var tf_randomFunc = function() {
    return Math.random();
}

function tf_random() {
    return tf_randomFunc();
}


if (typeof module !== 'undefined' && module.exports != null) {
    let exported = {};
    exported.TF_RandomFunc = tf_random;

    module.exports = exported;
} else {
    this.RandomHelper = {};
    this.RandomHelper.TF_RandomFunc = tf_random;
}