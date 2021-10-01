Array.prototype.some =
    Array.prototype.some ||
    function(fn) {
        const arr = this;
        let result = false;
        for (let i = 0; i < arr.length; i++) {
            result = fn(arr[i], i, arr);
            if (result) {
                break;
            }
        }
        return result;
    };
