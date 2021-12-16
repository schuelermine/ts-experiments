export default class PushdownAutomaton<StackAlphabet,StateAlphabet,InputAlphabet> {
    constructor(
        initialState: StateAlphabet,
        initialStackSymbol: StackAlphabet,
        transition: TransitionFunction<StackAlphabet,StateAlphabet,InputAlphabet>
    ) {
        this.#stack = new Stack()
        this.#stack.push(initialStackSymbol)
        this.#state = initialState
        this.#transition = transition
        this.#result = null
        this.#initialState = {
            stackSymbol: initialStackSymbol,
            state: initialState
        }
        this.#input = new Stack()
    }
    input(input: InputAlphabet[]) {
        this.#input = Stack.fromArray(input)
    }
    advance() {
        let stackSymbol = this.#stack.head()
        if (typeof stackSymbol === "undefined") {
            this.#result = "accept"
            return this
        }
        let action1 = this.#transition(this.#state, stackSymbol)
        let action2
        if (action1.action === "read") {
            let inputSymbol = this.#input.pop()
            if (typeof inputSymbol === "undefined") {
                this.#result = "reject"
                return this
            }
            action2 = action1.continue(inputSymbol)
        } else {
            action2 = action1.continue
        }
        this.#stack.action(action2.stackAction)
        return this
    }
    check() {
        return this.#result
    }
    reset() {
        this.#stack = new Stack()
        this.#stack.push(this.#initialState.stackSymbol)
        this.#state = this.#initialState.state
        this.#result = null
        this.#input = new Stack()
        return this
    }
    getState() {
        return this.#state
    }
    getTransitionFunction() {
        return this.#transition
    }
    copyRemainingInput() {
        return this.#input.copy()
    }
    copyStack() {
        return this.#stack.copy()
    }
    getStackHead() {
        return this.#stack.head()
    }
    getInputHead() {
        return this.#input.head()
    }
    rawGetRemainingInput() {
        return this.#input
    }
    rawGetStack() {
        return this.#stack
    }
    overrideState(state: StateAlphabet) {
        this.#state = state
        return this
    }
    overrideTransitionFunction(transition: TransitionFunction<StackAlphabet,StateAlphabet,InputAlphabet>) {
        this.#transition = transition
    }
    replaceStack(stack: Stack<StackAlphabet>) {
        this.#stack = stack
    }
    replaceInput(input: Stack<InputAlphabet>) {
        this.#input = input
    }
    runStackAction(action: StackAction<StackAlphabet>) {
        this.#stack.action(action)
    }
    runInputAction(action: StackAction<InputAlphabet>) {
        this.#input.action(action)
    }
    appendInputArray(input: InputAlphabet[]) {
        this.#input.appendArray(input)
    }
    #initialState: {
        stackSymbol: StackAlphabet
        state: StateAlphabet
    }
    #stack: Stack<StackAlphabet>
    #state: StateAlphabet
    #transition: TransitionFunction<StackAlphabet,StateAlphabet,InputAlphabet>
    #result: null | "accept" | "reject"
    #input: Stack<InputAlphabet>
}

type TransitionFunction<StackAlphabet,StateAlphabet,InputAlphabet> =
    (
        state: StateAlphabet,
        stackSymbol: StackAlphabet
    ) => MaybePopInputAction<InputAlphabet,PushdownAutomatonAction<StackAlphabet,StateAlphabet>>

type MaybePopInputAction<T,R> = PopInputAction<T,R> | IgnoreInputAction<R>
type PopInputAction<T,R> = {action: "read", continue: (inputSymbol: T) => R}
type IgnoreInputAction<R> = {action: "ignore", continue: R}

interface PushdownAutomatonAction<StackAlphabet,StateAlphabet> {
    newState: StateAlphabet
    stackAction: DeleteAction | PushAction<StackAlphabet> | IgnoreAction
}

type StackAction<T> = DeleteAction | PushAction<T> | PopAction<T> | IgnoreAction | ClearAction
type DeleteAction = {action: "delete"}
type PushAction<T> = {action: "push", item: T}
type PopAction<T> = {action: "pop", default: T}
type IgnoreAction = {action: "ignore"}
type ClearAction = {action: "clear"}

type ResultOfStackAction<T, A extends StackAction<T>> = A extends PopAction<T> ? T : void

class Stack<T> {
    constructor() {
        this.#stack = []
    }
    push(item: T) {
        this.#stack.push(item)
    }
    pop(): T | undefined {
        return this.#stack.pop()
    }
    head(): T | undefined {
        let stack = this.#stack
        return stack[stack.length - 1]
    }
    delete() {
        this.#stack.pop()
    }
    copy(): Stack<T> {
        return Stack.fromArray([...this.#stack])
    }
    clear() {
        this.#stack = []
    }
    appendArray(array: T[]) {
        this.#stack.push(...array)
    }
    action<A extends StackAction<T>>(action: A): ResultOfStackAction<T,A> {
        if (action.action === "delete") {
            this.delete()
        } else if (action.action === "push") {
            this.push(action.item)
        } else if (action.action === "pop") {
            return (this.pop() ?? action.default) as ResultOfStackAction<T, A>
        } else if (action.action === "clear") {
            this.clear()
        }
        return undefined as ResultOfStackAction<T, A>
    }
    static fromArray<T>(array: T[]): Stack<T> {
        let stack = new Stack<T>()
        stack.#stack = array
        return stack
    }
    #stack: T[]
}

// just for fun: swapping w/o direct access to the array
const swap: <T>(this: Stack<T>) => boolean = function() {
    let item1 = this.pop()
    if (typeof item1 === "undefined") {
        return false
    }
    let item2 = this.pop()
    if (typeof item2 === "undefined") {
        this.push(item1)
        return false
    }
    this.push(item2)
    this.push(item1)
    return true
}