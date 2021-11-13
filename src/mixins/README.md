Because many of the classes share some of the exact same methods, we are using mixin classes to express this.

This has many advantages, in particular, we can have classes share code without any overhead.

For example, if we used helpers instead of mixins we would have the extra call overhead, and if we wanted those helpers to be able to access `this` we have to bind them each time (and typescript wouldn't understand the `this` in those functions), or inline them and keep track of updating them all.

Now there's two ways to do mixins in typescript. See [TypeScript: Documentation - Mixins](https://www.typescriptlang.org/docs/handbook/mixins.html).

Here we're using mostly the [Alternative Pattern](https://www.typescriptlang.org/docs/handbook/mixins.html#alternative-pattern) where mixins are created via declaration merging.

This is because the newer way that's suggested does not suit our needs very well. In the newer way, only mixins are aware of properties of their base class (because they can constrain what classes they take in). Here we don't need the mixins to be particularly aware of anything (mostly), but we do need the base, or rather, main class to be aware of the mixins. Additionally we need the mixins to have pseudo-constructors that require different arguments than the main class. We also don't care much about the pros of the newer method (inheritance).

Initially, only simple declaration merging on each class was used (see commented out code at the end of all classes), but this didn't let us use the new `overrides` keyword correctly to catch type errors when overriding methods.

So instead now mixins are premixed into `Mixin*` classes and the main classes all extend from those.

See //TODO my [mixin]() helper and [Mixin]() type for details on how this all works and some of the limitations and rules one must follow.


TODO

	 * ```ts
	 * const keys = new Keys(new Key("a"))
	 * const dict = keys.dict
	 * const b = new Key("b")
	 * if (keys.allows() === true) {
	 * 	keys.add(b, false)
	 * }
	 * dict.a // good (gets autosuggested)
	 * dict.b // error
	 * (dict as ExpandRecord<typeof dict, "b">).b // good (gets autosuggested)
	 * // or
	 * const expanded = (dict as ExpandRecord<typeof dict, "b">)
	 * // now can be used repeatedly
	 * expanded.b //good
	 * ```
	 *
	 * Or if you don't mind that it will no longer error out if you try to access a non-existent key you can do this:
	 * ```ts
	 * const keys = new Keys(new Key("a"))
	 * // by default ExpandRecord will make the type accept any string key
	 * const dict = keys.dict as ExpandRecord<typeof keys.dict>
	 * if (keys.allows() === true) {
	 * 	keys.add(b, false)
	 * }
	 * dict.a // good (gets autosuggested)
	 * dict.b // good (does not get autosuggested)
	 * dict.c // good (does not get autosuggested) // error in production
	 * ```
