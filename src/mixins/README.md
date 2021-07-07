Because many of the classes share some of the exact same methods, we are using mixin classes to express this. Mixins are implemented as described [here](https://www.typescriptlang.org/docs/handbook/mixins.html).

This has many advantages, in particular, we can deduplicate code without overhead. For example, if we used helpers we would have the extra call overhead, and if we want those helpers to be able to access this we have to bind them each time (and typescript wouldn't understand the `this` in those functions), or inline them, both of which have an overhead.

BUT because we're ONLY copying the methods, there are a few things to be aware of:

- Mixins are not aware of what they extend.
  - This seems obvious, but it's important.
- Properties do NOT get mixed in.
- The constructor is never called.

So...

# Mixins Should:

## NOT have real constructors
Since they are not copied over, and even if we copied them, they would be hard to type, real constructors aren't used.

If a constructor is needed, they are instead added as plain methods named `_[INSERT MIXIN NAME]_constructor`.

## Declare the properties they share with classes they extend in their Interface

This is so typescript understands what's going on, but note that it is the classes that must implement them.

I have tried to create a helper type so you can't forget to declare mixin properties, but I could get it to work since once we fake the mixin by extending the interface of the class typescript assumes those properties exist.

## Declare the types of methods so that they narrow down to the same types the classes's use
All mixins take in a generic parameter to narrow down their methods. This also helps give an idea, from just looking at the mixin, of what extends them

Here's what the basic pattern looks like:
```ts
// in the respective files where the types for each class are declared:
export type ClassA_prop = string
// and:
export type ClassB_prop = number

// in the file where the types for Mixin are declared:
export type Mixin_Prop<T> =

T extends ClassA
? ClassA_prop

T extends ClassB
? ClassB_prop
: never

// in Mixin
export interface Mixin<
	T extends ClassA | ClassB,
	TProp extends Mixin_Prop<T>,
> {
	// properties it shares with the classes (which are only implemented by the classes)
	prop: TProp
}
export class Mixin<
	T extends ClassA | ClassB,
	TProp extends Mixin_Prop<T>,
> {
	method(prop: TProp) {/* ... */}
}

// in ClassA
export class ClassA<
	TProp extends Mixin_Prop<ClassA>
> {
	prop: TProp
}
interface ClassA extends Mixin<ClassA> {}
mixin(ClassA, [Mixin])

//same with classB
```

Note the use of `Mixin_Prop` in `ClassA`. This resolves/narrows to `ClassA_type` when we extend the interface to `SomeMixin<ClassA>`. `ClassA_type` is not used directly, because often the types are not this simple, and it is simpler to change what `SomeMixin_Type` looks up than `ClassA_type` directly.

## NOT rely om or have class specific behavior

There are two exceptions to this.

One, for mixins that are private and therefore provide no hooks, a few class specific checks are done in the mixin where it makes sense to (e.g. the `Plugable.__add_plugins` warning regarding shortcuts).

we need some ways for classes to override certain behavior either "globally" or by some key (e.g. `Hooks.set`). In these cases the following pattern is used in the mixin:

```ts

class Mixin</* ... */> {
	someMethod(/* ... */) {
		// temporarily type this as the class that would extend it (technically a bit looser)
		let extender = (this as unknown as Extended<T>)
		if (extender.__set || extender[`__set_${type}`]) {
			extender.__set
				// we can't store these in a variable because they MUST be called from extender, otherwise `this` is will be undefined inside the methods
				? extender.__set(type, value, extender[type as string], cb)
				: extender[`__set_${type}`](value, extender[type as string], cb)
		}
	}
}
```


Classes can then specify a method with that name.

```ts
_someMethod_someKey(/* ... */)
```
Unfortunately we must set the types manually for this and they really have no effect on anything else (e.g. the mixin isn't aware of what these functions take or return).

Note that whether it's completely overriding the behavior depends on the mixin and it's needs, it might replace the method exactly (like in the example), or only be called in certain circumstances (e.g. `Hooks.set`):

You might be asking why not use getter/setters? It's because setters can't be passed more than one parameter and we often need to pass more than that (e.g. a callback).

And why not just register a hook for methods like `Hooks.allows` which don't mutate anything? Because we'd have to register one per instance and either inline the function or create a method to handle it anyways.

