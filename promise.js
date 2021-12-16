const main = async () => {
    const time = 10000;
    const callback = function () { console.log(value); };
    const promise = new Promise((resolve) => {
        setTimeout(() => {
            callback();
            resolve(null);
        }, time);
    });
    const value = await promise;
    console.log(value);
};
main();
