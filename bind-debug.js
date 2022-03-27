
        Function.prototype.bind2 = function(context) {
            if (typeof this !== "function") {
                throw new Error("error");
            }

            const args = [].slice.apply(arguments, [1]),
                self = this

            const Fc = function() {}
            Fc.prototype = self.prototype

            const func = function() {
                const args2 = [].slice.apply(arguments)
                return self.apply(
                    this instanceof func ? this : context,
                    args.concat(args2)
                )
            }
            // 继承一下，这样保证了原型链，又不会影响到父类的 prototype
            func.prototype = new Fc()
            return func
        }

        function say() {
            console.log(this.x);
        }

        var a = say.bind2({x: 1});
        var b = a.bind2({x: 2});
        b();
