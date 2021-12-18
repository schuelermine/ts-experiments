export default class PushdownAutomaton<StackAlphabet,StateAlphabet,InputAlphabet> {
    //#region Initialization
    constructor(
        initialState: StateAlphabet,
        initialStackSymbol: StackAlphabet,
        transition: TransitionFunction<StackAlphabet,StateAlphabet,InputAlphabet>,
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
    //#endregion
    //#region Operations
    advance() {
        let stackSymbol = this.#stack.head()
        let action1 = this.#transition(this.#state, stackSymbol)
        let action2
        if (action1.action === "pop") {
            let inputSymbol = this.#input.pop()
            action2 = action1.continue(inputSymbol)
        } else {
            action2 = action1.continue
        }
        if (action2.action === "resolve") {
            this.#result = action2.result
            return this
        }
        this.#state = action2.state
        this.#stack.action(action2.stackAction)
        return this
    }
    reset() {
        this.#stack = new Stack()
        this.#stack.push(this.#initialState.stackSymbol)
        this.#state = this.#initialState.state
        this.#result = null
        this.#input = new Stack()
        return this
    }
    //#endregion
    //#region Accessors
    getResult() {
        return this.#result
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
    //#endregion
    //#region Unsafe & private fields methods
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
    //#endregion
    //#region Private fields
    #initialState: {
        stackSymbol: StackAlphabet
        state: StateAlphabet
    }
    #stack: Stack<StackAlphabet>
    #state: StateAlphabet
    #transition: TransitionFunction<StackAlphabet,StateAlphabet,InputAlphabet>
    #result: null | "accept" | "reject"
    #input: Stack<InputAlphabet>
    //#endregion
}

type TransitionFunction<StackAlphabet,StateAlphabet,InputAlphabet> =
    (
        state: StateAlphabet,
        stackSymbol: StackAlphabet | undefined
    ) => InputAction<InputAlphabet,PushdownAutomatonAction<StackAlphabet,StateAlphabet>>

type InputAction<T,C> = PopInputAction<T,C> | IgnoreInputAction<C>
type PopInputAction<T,C> = {action: "pop", continue: (inputSymbol: T | undefined) => C}
type IgnoreInputAction<C> = {action: "ignore", continue: C}

type PushdownAutomatonAction<StackAlphabet,StateAlphabet> = ContinueAction<StackAlphabet,StateAlphabet> | ResolveAction
type ContinueAction<StackAlphabet,StateAlphabet> = {
    action: "continue"
    stackAction: DeleteAction | PushAction<StackAlphabet> | IgnoreAction
    state: StateAlphabet
}
type ResolveAction = {
    action: "resolve"
    result: "accept" | "reject"
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
    } // TODO: Method to append other stack
    action<A extends StackAction<T>>(action: A): ResultOfStackAction<T,A> {
        if (action.action === "delete") {
            this.delete()
        } else if (action.action === "push") {
            this.push(action.item)
        } else if (action.action === "pop") {
            return (this.pop() ?? action.default) as ResultOfStackAction<T,A>
        } else if (action.action === "clear") {
            this.clear()
        }
        return undefined as ResultOfStackAction<T,A>
    }
    static fromArray<T>(array: T[]): Stack<T> {
        let stack = new Stack<T>()
        stack.#stack = array
        return stack
    }
    #stack: T[]
}

namespace Unused {
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
}