var p2 = new Promise((resolve, reject) => {
    console.log("promise1");
    resolve("a");
})
    .then(val => {
        console.log("then11", val);
        return new Promise((resolve, reject) => {
            console.log("promise2");
            resolve("b");
        })
            .then(val => {
                console.log("then21", val);
                return "c";
            })
            .then(val => {
                console.log("then23", val);
                return Promise.resolve()
                    .then(() => {
                        console.log("then23里的 then");
                        return "d";
                    })
                    .then(val => {
                        console.log("then24", val);
                        return "e";
                    });
            })
            .then(val => {
                console.log("then25", val);
                return "f";
            })
            .then(val => {
                console.log("then26", val);
                return "g";
            });
    })
    .then(val => {
        console.log("then12", val);
    });
