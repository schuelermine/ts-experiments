function makeChainable<This, Args extends unknown[], Result>(f: (this: This, ...args: Args) => Result): (...args: Args) => This {
    return function(...args) {
        f.apply(this, args);
        return this;
    };
}

function noop(): void {
    // No-op function
}

class Oreo {
    constructor() {
        this.moped = "🛵";
    }
    getSelf = makeChainable<this, [], void>(noop);
    moped: string;
}

var oreo = new Oreo();
console.log(oreo.getSelf().moped);
