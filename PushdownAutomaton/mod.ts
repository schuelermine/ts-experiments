/**
 * A pushdown automaton.
 * The accepting & rejecting states are predefined symbols.
 * The transition function can detect an empty stack or input.
 */
export default class PushdownAutomaton<StackAlphabet,StateAlphabet,InputAlphabet> {
    //#region Initialization
    /**
     * Construct a new PushdownAutomaton
     * @param initialState Initial state of the automaton
     * @param initialStackSymbol Initial single symbol of the stack
     * @param transition Transition function, e.g. of the form (state, stackSymbol) => { action: "pop", continue: (inputSymbol) => { action: "continue", stackAction: { action: "push", item: symbol } } }
     * @constructor
     */
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
        // This stack will be overridden by input().
        // It is only empty here to allow the transition function to be run before input()
        // TODO: Consider adding an input parameter to the constructor
        this.#input = new Stack()
    }
    /**
     * Provide input to the automaton
     * @param input Array of input symbols
     * @returns The Automaton itself
     */
    input(input: InputAlphabet[]) {
        this.#input = Stack.fromArray(input)
        return this
    }
    //#endregion
    //#region Operations
    /**
     * Advance the automaton by one step
     * @returns The Automaton itself
     */
    advance() {
        // Obtain the symbol at the top of the stack & feed it to the transition function
        let stackSymbol = this.#stack.head()
        let action1 = this.#transition(this.#state, stackSymbol)
        // Depending on the action property, possibly consume an input symbol & feed it to continue
        let action2
        if (action1.action === "pop") {
            let inputSymbol = this.#input.pop()
            action2 = action1.continue(inputSymbol)
        } else {
            action2 = action1.continue
        }
        // If the action is a resolve action, set the result & exit
        if (action2.action === "resolve") {
            this.#result = action2.result
            return this
        }
        // Otherwise, perform the action on the stack & replace the state
        this.#state = action2.state
        this.#stack.action(action2.stackAction)
        return this
    }
    /**
     * Reset the automaton to its initial state
     * @returns The Automaton itself
     */
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
    /**
     * @returns The result (if any) of the last step of the automaton
     */
    getResult() {
        return this.#result
    }
    /**
     * @returns The current state of the automaton
     */
    getState() {
        return this.#state
    }
    /**
     * @returns The transition function of the automaton
     */
    getTransitionFunction() {
        return this.#transition
    }
    /**
     * Copy the remaining unconsumed input
     * @returns A copy of the input stack
     */
    copyRemainingInput() {
        return this.#input.copy()
    }
    /**
     * @returns A copy of the stack
     */
    copyStack() {
        return this.#stack.copy()
    }
    /**
     * @returns The current head of the stack
     */
    getStackHead() {
        return this.#stack.head()
    }
    /**
     * @returns The current head of the input stack
     */
    getInputHead() {
        return this.#input.head()
    }
    //#endregion
    //#region Unsafe & private fields methods
    /**
     * This method may make the automaton's state & result invalid!
     * @returns The input stack (by reference)
     */
    rawGetRemainingInput() {
        return this.#input
    }
    /**
     * This method may make the automaton's state & result invalid!
     * @returns The stack (by reference)
     */
    rawGetStack() {
        return this.#stack
    }
    /**
     * This method may make the automaton's state & result invalid!
     * Replace the current state of the automaton
     * @param state The new state
     */
    overrideState(state: StateAlphabet) {
        this.#state = state
    }
    /**
     * This method may make the automaton's state & result invalid!
     * Replace the transition function of the automaton
     * @param transition The new transition function
     */
    overrideTransitionFunction(transition: TransitionFunction<StackAlphabet,StateAlphabet,InputAlphabet>) {
        this.#transition = transition
    }
    /**
     * This method may make the automaton's state & result invalid!
     * Replace the entire stack with a new stack
     * @param stack The new stack
     */
    replaceStack(stack: Stack<StackAlphabet>) {
        this.#stack = stack
    }
    /**
     * This method may make the automaton's state & result invalid!
     * Replace the entire input stack with a new stack
     * @param input The new input stack
     */
    replaceInput(input: Stack<InputAlphabet>) {
        this.#input = input
    }
    /**
     * This method may make the automaton's state & result invalid!
     * Perform a stack action on the stack using Stack.action()
     * @param action The action to perform on the stack
     */
    runStackAction(action: StackAction<StackAlphabet>) {
        this.#stack.action(action)
    }
    /**
     * This method may make the automaton's state & result invalid!
     * Perform a stack action on the input stack using Stack.action()
     * @param action The action to perform on the input stack
     */
    runInputAction(action: StackAction<InputAlphabet>) {
        this.#input.action(action)
    }
    /**
     * This method may make the automaton's state & result invalid!
     * Push an array of symbols to the input stack
     * @param input An array of input symbols
     */
    appendInputArray(input: InputAlphabet[]) {
        this.#input.appendArray(input)
    }
    //#endregion
    //#region Private fields
    /** The initial state of the automaton, used by reset() */
    #initialState: {
        stackSymbol: StackAlphabet
        state: StateAlphabet
    }
    /** The stack used by the automaton */
    #stack: Stack<StackAlphabet>
    /** The current state of the automaton */
    #state: StateAlphabet
    /** The transition function used by the automaton */
    #transition: TransitionFunction<StackAlphabet,StateAlphabet,InputAlphabet>
    /**
     * The result of the automaton.
     * Please note: This field is intended to be set only when entering a terminal state!
     * */
    #result: null | "accept" | "reject"
    /** The input stack used by the automaton */
    #input: Stack<InputAlphabet>
    //#endregion
}

/**
 * Transition function for the Pushdown Automaton.
 * Generic over the stack alphabet, the state alphabet and the input alphabet.
 * @param state The current state of the automaton
 * @param stackSymbol The current head of the stack
 * @returns Whether to consume the current input symbol, and what to do next, as an {@link InputAction}
 */
type TransitionFunction<StackAlphabet,StateAlphabet,InputAlphabet> =
    (
        state: StateAlphabet,
        stackSymbol: StackAlphabet | undefined
    ) => InputAction<InputAlphabet,PushdownAutomatonAction<StackAlphabet,StateAlphabet>>

/**
 * Potentially an action to perform on the input stack of the automaton.
 * This is a discriminated union, the discriminating field is action
 */
type InputAction<T,C> = PopInputAction<T,C> | IgnoreInputAction<C>
/**
 * An action to pop the current input symbol from the input stack,
 * and call the continuation (continue) with the popped symbol.
 */
type PopInputAction<T,C> = {action: "pop", continue: (inputSymbol: T | undefined) => C}
/**
 * An action to ignore the current input symbol, and the continuation (continue)
 */
type IgnoreInputAction<C> = {action: "ignore", continue: C}

/**
 * An action to perform on the stack of the automaton.
 * This is a discriminated union, the discriminating field is action
 */
type PushdownAutomatonAction<StackAlphabet,StateAlphabet> = ContinueAction<StackAlphabet,StateAlphabet> | ResolveAction
/**
 * An action to continue, containing a stack action to be performed and a new state
 * @property stackAction The stack action to perform. This is intended to be a subset of the actions available in Stack.action()
 */
type ContinueAction<StackAlphabet,StateAlphabet> = {
    action: "continue"
    stackAction: DeleteAction | PushAction<StackAlphabet> | IgnoreAction
    state: StateAlphabet
}
/**
 * An action to resolve the automaton, containing the result (accept or reject)
 */
type ResolveAction = {
    action: "resolve"
    result: "accept" | "reject"
}

/**
 * An action to perform on a stack.
 * This is a discriminated union, the discriminating field is action
 * Used by Stack.action()
 */
type StackAction<T> = DeleteAction | PushAction<T> | PopAction<T> | IgnoreAction | ClearAction
/** Delete the top item on the stack, discarding it */
type DeleteAction = {action: "delete"}
/** Push an item (contained in the property item) onto the stack */
type PushAction<T> = {action: "push", item: T}
/** Pop the top item on the stack, returning it */
type PopAction<T> = {action: "pop", default: T}
/** Do nothing */
type IgnoreAction = {action: "ignore"}
/** Clear the stack */
type ClearAction = {action: "clear"}

/**
 * Utility type representing the result of Stack.action().
 * This is a conditional type that only returns non-void if the action would return a value.
 */
type ResultOfStackAction<T, A extends StackAction<T>> = A extends PopAction<T> ? T : void

class Stack<T> {
    /**
     * @constructor
     * Construct an empty stack
     */
    constructor() {
        this.#stack = []
    }
    /**
     * Adds an item to the top of the stack
     */
    push(item: T) {
        this.#stack.push(item)
    }
    /**
     * Removes the top item of the stack and returns it
     */
    pop(): T | undefined {
        return this.#stack.pop()
    }
    /**
     * Returns the top item of the stack
     */
    head(): T | undefined {
        let stack = this.#stack
        return stack[stack.length - 1]
    }
    /**
     * Delete the top item of the stack without returning it
     */
    delete() {
        this.#stack.pop()
    }
    /**
     * Returns a copy of the stack
     */
    copy(): Stack<T> {
        return Stack.fromArray([...this.#stack])
    }
    /**
     * Resets the stack to be empty
     */
    clear() {
        this.#stack = []
    }
    /**
     * Pushes the items in the array to the stack
     * @param array Array of items
     */
    appendArray(array: T[]) {
        this.#stack.push(...array)
    } // TODO: Method to append other stack
    /**
     * Performs an action (specified by an object) on the stack.
     * The property action can be the strings delete, push, pop or ignore (no-op).
     * If the action is a pop, the property default is returned if the stack is empty.
     * If the action is a push, the property item is pushed to the stack.
     * @param action Action to perform on the stack
     * @returns The Stack itself
     */
    action<A extends StackAction<T>>(action: A): ResultOfStackAction<T,A> {
        // TODO: Consider refactoring to use switch-case
        // Perform an action depending on the action field
        if (action.action === "delete") {
            this.delete()
        } else if (action.action === "push") {
            this.push(action.item)
        } else if (action.action === "pop") {
            return (this.pop() ?? action.default) as ResultOfStackAction<T,A>
            // Typecast is necessary because TypeScript doesn't evaluate conditional types
        } else if (action.action === "clear") {
            this.clear()
        }
        // This will (currently) only be run if the action is unknown
        // As of now it's mainly used to make TypeScript happy
        return undefined as ResultOfStackAction<T,A>
        // Typecast is necessary because TypeScript doesn't evaluate conditional types
    }
    /**
     * Create a stack from an array
     */
    static fromArray<T>(array: T[]): Stack<T> {
        let stack = new Stack<T>()
        stack.#stack = array
        return stack
    } // TODO: Implement this as an overload of the constructor
    /**
     * The array used to represent the stack internally
     */
    #stack: T[]
}

namespace Unused {
    // (just for fun)
    /**
     * Swaps the top two items of the stack, without using the stack's internal logic
     * @this Stack The stack on which to swap the items
     */
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