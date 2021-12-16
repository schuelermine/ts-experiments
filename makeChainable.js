function makeChainable(f) {
    return function (...args) {
        f.apply(this, args);
        return this;
    };
}
function noop() { }
class Oreo {
    constructor() {
        this.moped = "🛵";
    }
    getSelf() {
        return this;
    }
    moped;
}
