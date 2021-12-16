export const main: () => void = async () => { 
    const time = 10000
    const callback: () => void = function() {console.log(value)}
    const promise: Promise<unknown> =
        new Promise((resolve: (value: unknown) => void) => {
            setTimeout(() => {
                callback();
                resolve(null);
            }, time);
        });
    const value = await promise;
    console.log(value);
}
