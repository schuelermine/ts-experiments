type X<T> = A<T> | B<T>
type A<T> = {type: "a", value: T}
type B<T> = {type: "b", value: T}
type R<T,Y extends X<T>> = Y extends B<T> ? T : void
function f<T,Y extends X<T>>(y: Y): R<T,Y> {
    if (y.type === "b") {
        return y.value
    } else return
}
