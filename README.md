### 🚧 WIP, BETA COMING SOON 🚧

[![Docs](https://github.com/alanscodelog/shortcuts-manager/workflows/Docs/badge.svg)](https://github.com/alanscodelog/shortcuts-manager/actions/workflows/docs.yml)
[![Build](https://github.com/alanscodelog/shortcuts-manager/actions/workflows/build.yml/badge.svg)](https://github.com/alanscodelog/shortcuts-manager/actions/workflows/build.yml)
[![Release](https://github.com/alanscodelog/shortcuts-manager/actions/workflows/release.yml/badge.svg)](https://github.com/alanscodelog/shortcuts-manager/actions/workflows/release.yml)
[![NPM Version (with latest tag)](https://img.shields.io/npm/v/%40alanscodelog%2Fshortcuts-manager/latest)](https://www.npmjs.com/package/@alanscodelog/shortcuts-manager/v/latest)
<!-- [![NPM Version (with beta tag)](https://img.shields.io/npm/v/%40alanscodelog%2Fshortcuts-manager/beta)](https://www.npmjs.com/package/@alanscodelog/shortcuts-manager/v/beta) -->

# ...Name Pending

This is a shortcut manager library for handling ALL the shortcut needs of an application.

# [Docs](https://alanscodelog.github.io/shortcuts-manager)

# [Demo (mostly complete, please report any issues)](https://alanscodelog.github.io/shortcuts-manager/demo)

# Features
- Manages anything key like (mouse + keyboard).
	- Modifiers, toggles, mouse buttons, and even the mouse wheel.
- Manages layouts. 
	- Easy to create and layout keys in one go.
	- Provides mechanisms for handling left/right key variants in any way you like.
	- Optional auto key labeling.
- Supports shortcuts chains (e.g. `Ctrl+A B C`).
	- Has methods for swapping/moving parts of the chain with ease.
- [Framework agnostic\*](#usage-with-frameworks).
- Hooks to allow listening to state changes and controlling whether shortcuts are valid, can be added, removed, modified, etc. 
- Easy error handling with type safe result monads.
	- e.g. to check a shortcut can be changed: `setShortcutProp(shortcut, "chain", [...]).isOk`
- Helper and utility functions for common use cases.
- Heavily tested. 

# Usage


This is a simple example of how you can quickly setup a manager. 

```ts
// While a barrel "shortcuts-manager" import is available
// for the root and all the parts of the library. It's
// recommended to import the individual functions instead, 
// especially if using a bundler like vite which does not tree-shake
// in dev mode. It will be faster.

import { createManager } from "shortcuts-manager/createManager.js"
import { createKeys } from "shortcuts-manager/createKeys.js"
import { createContext } from "shortcuts-manager/createContext.js"
import {type Context, ERROR} from "shortcuts-manager/types"
import { createCommand } from "shortcuts-manager/createCommand.js"
import { createShortcut } from "shortcuts-manager/createShortcut.js"
import { addCommand } from "shortcuts-manager/addCommand.js"
import { addShortcut } from "shortcuts-manager/addShortcut.js"

const manager = createManager({
	name: "default",
	// use/modify one of the layouts provided, or create your own (more below)
	keys: createLayout("ansi"), 
	commands: [
		{name: "makeBold", execute: () => {}},	
	],
	shortcuts: [
		{chain: [["ctrl", "b"]], command: "makeBold"},
	],
	// a context to evaluate conditions on, you can use Context<YourContextType> to use anything you'd like.
	context: createContext<Context<Record<string, boolean>>>({
		a: false
		b: false,
	}),
	options: {
		// this is required to tell the manager how to evaluate conditions
		evaluateCondition(condition, context) {
			return context.value[condition.text]
		},
		cb(_manager, error, e) {
			// the manger can throw soft errors working, these can be handled here
			if (error.code === ERROR.UNKNOWN_KEY_EVENT) {
			} else {
				// some other error (e.g. no shortcut available to trigger, multiple shortcuts found, etc)
				console.log(error, e)
			}
		},
	},
	listener: ({ event, manager, keys }) => {
		// You can listen to all the events the manger listens to
		// and inspect how it's interpreting the keys.
		// This can also be used to label keys and
		// preventDefault some events when recording, more below.
	},
}).unwrap()

const command = createCommand("test", { execute: () => {} })
addCommand(command,manager).unwrap()

const shortcut = createShortcut({
	chain: [["a"]],
	command: "test",
}, manager).unwrap()
addShortcut(shortcut,manager).unwrap()
```


### Listening to Events
Then we need to attach the manager to the dom or an emulator\* so it can listen to events.

```ts
// all listeners are created by default, but you can use the second parameter
// to make it only create some of them
const listeners = createManagerEventListeners(manager)

// then we can attach to the dom or an emulator
// we can also pass options to some listeners
// by default, the wheel listener is passive
attach(el, listeners, { wheel: { passive: true } })
// to later detach
detach(el, listeners, { wheel: { passive: true } })
```
\* The emulator is for testing purposes and is not needed for virtual key presses (see `virtualPress/Toggle/Release`) which can be used to allow the user to "press" a key via some other mechanism (e.g. clicking a virtual keyboard).

## How Does It Work?

The listeners listen to all the events, look up the keys in the manager's key entries, then add/remove the keys from the manager's chain (`state.chain`). When a user presses a trigger key (non-modifier key), if there is a shortcut with the current chain as it's base, the manager will create a new chord on the next key press (`[[a]]` => `[[a], []]`). 

The manager checks if the chain should trigger a shortcut, and triggers the corresponding `command.execute` both on `keyup` and `keydown.`. On `keydown` said shortcut is saved to `state.untrigger` in case we need to untrigger it early.

You can choose in your execute function what exactly to do at that point for both the `keyup` and the `keydown`. Usually you will want your logic to only run on keydown and you should clear the manager's chain with `safeSetManagerChain`.

If non-modifier keys are still being held at this point, the manager will not allow triggering a shortcut until they are released (see `state.isAwaitingKeyup`). Modifiers are not affect by this. We usually want the user to be able to keep the modifier pressed and do, for example, `Ctrl+B` then `Ctrl+I` to bold and italicize text, without having to release `Ctrl`, only `B` and `I`.

## Errors and `{check}` Option

Note the use of `unwrap()`. Because many actions can throw "soft" errors, to better help deal with all the errors the library uses a Result monad in most of the return types. `unwrap` is like rust's unwrap and will throw the error if there was one, otherwise "unwrap" and return the value within. 

For example, you could create a key like this if needed (e.g. when loading user configurations):
```ts
const res = createKey(key.id, key)
if (res.isError) {
	// handle error
	res.error // typed 
	res.error.code // see the ERROR enum
	res.error.info // returns relevant objects
} else {
	return res.value
}
```

Many functions also offer the ability to pass `{check: true}` to check if they will succeed without actually doing anything. This is useful, for example, to check when dragging if a shortcut can be dragged to a key or not.
```ts
const res = setShortcutProp(shortcut, "chain", newChain, manager, { check: true })
if (res.isOk) {
	// ... shortcut can be changed
}
```
# Advanced Usage - Building the Manager Piece by Piece

For more advanced use cases, you might want to build the manager piece by piece.

Above the example took in raw keys/lists and `createManager` internally converted and checked everything. But sometimes, like when loading a manager, it can be useful to do all this manually. For this there are several `create*` functions. 

## Manager Options

Many of the functions need parts of the manager, including some of it's options to verify the creation of the keys/commands/shortcuts. For example, we can't be sure a shortcut is valid, unless we know the set of commands and keys that will be connected to it.

But we can't create a manager before creating a manager..., so instead we can create it's options first and pass those to the functions that need it:

```ts
const options = createManagerOptions({
		evaluadeCondition(condition, context) {
		return context.value[condition.text]
		},
	//...
})
```

## Keys and Layouts

Then we need to create a layout. This is a list of keys in their raw form (they can be missing some properties), that describes the position of the keys and their width/height. `createLayout` is provided to help generate variations of the common ansi/iso layouts. We can then create real keys from these.
```ts
import { createLayout } from "shortcuts-manager/layouts/createLayout.js"

const layout = createLayout("ansi", {
	numpad: false // don't add numbpad keys
})

const keysList = layout.map(key => {
	// modify layout as you need
	//...
	return createKey(key.id, key).unwrap()
})
```
You can also build completely custom layouts, the `calculateAndSetPositionAndSize` helper is provided to make laying things out easier. It shifts the x position of the next key based on the previous key and auto sets width/height to 1 unit if not specified.

**Note: Key ids must be valid KeyboardEvent.code values, unless they are toggles, or have a list of variants. See `Key` docs for more info.**

 ```ts
import { calculateAndSetPositionAndSize } from "shortcuts-manager/helpers/calculateAndSetPositionAndWidth.js"
 
const firstRow = calculateAndSetPositionAndSize([
	{ id: "Escape" as const, label: "Esc" }, // {x: 0, width: 1, height: 1}
	//	F1 needs to be shifted to skip 1 key unit
	{ id: "F1" as const, x: 2 },
	{ id: "F2" as const },
	{ id: "F3" as const },
	{ id: "F4" as const },
	//	again after the 4th F* key, we shift one unit right
	{ id: "F5" as const, x: 6.5 },
	{ id: "F6" as const },
	{ id: "F7" as const },
	{ id: "F8" as const },
	// and again
	{ id: "F9" as const, x: 11 },
	{ id: "F10" as const },
	{ id: "F11" as const },
	{ id: "F12" as const },
]).map(_ => _.y = 0), // y position is not set, so we set it
```
Rotation is not currently supported, but it's easy to add. You can extend the `BaseKey` interface yourself to add the needed properties. There's also the `NonToggleKey` and `ToggleKey` interfaces if you them. 

```ts
// global.d.ts
declare module "shortcuts-manager/types/index.js" {
	export interface BaseKey {
		yourProperty:string
	}
}
export { }
```

Next you need to create a `Keys` object which describes a group of `Key`s. When keys are added/removed with `add/removeKey`, they will take care of adding/removing keys properly from the `Keys` since keys also need to be added to additional properties of `Keys` such as `toggles`, `variants`, etc. properties. These are used to speed up lookups and can be useful for searching for keys and or applying styles (e.g. `if (toggles[id]) // id is toggle`).

```ts
import { createKeys } from "shortcuts-manager/createKeys.js"

// using the keysList and options we created above
const keys = createKeys(keysList, options).unwrap()
```

## Commands

Command creation cannot error, so there is no unwrap.

`command.execute` is of type `CommandExecute` if you need to type your command execute function separately.

```ts
import { createCommand } from "shortcuts-manager/createCommand.js"

const command = createCommand(
	"test",
	{
		execute: ({ isKeydown, command, shortcut, event, manager }) => {
		// note that event might be undefined if using virtual key presses
		// the manager and shortcut might also be undefined
		// this is to allow calling the command manually without the library
		},
		// commands can also have their own conditions that must be met
		condition: createCondition("a || b")
	}
)

const commandSet = createCommands([
	command,
	// command2
], options).unwrap()
```

## Conditions

`Condition` is just an object that provides a wrapper the library understands, it does not actually implement evaluation, etc. For that you can use a seperate library, like [expressit](https://github.com/witchcraftjs/expressit) which I created for this purpose.

This is why we *must* tell the manager how to evaluate conditions.

To extend `Condition` and add properties to it, you can extend the `Condition` interface yourself.
```ts
// global.d.ts
import type { ConditionNode, ExpressionNode, GroupNode } from "@witchcraft/expressit/types"
declare module "shortcuts-manager/types/index.js" {
	export interface Condition {
		ast?: ExpressionNode | ConditionNode | GroupNode
	}
}
export { }
```

Additionally, when you create a condition, you can pass a function to `parse` it and add these needed properties:
```ts
const condition = createCondition("a || b ", (_) => {
	_.ast = parse(_.text)
	return _
})
```

## Contexts

Similarly with contexts, you can use any sort of object or type that you like. 

You can tell the manager it's type when you create it. For example, say we wanted to use a map:

```ts
const manager = createManager({
	context: createContext<Context<Map<string, boolean>>>(new Map()),
	options: {
		evaluateCondition(condition, context) {
			// context is now correctly typed
			return context.value.has(condition.text)
		},
	}
})
```

## Shortcuts

Creating a shortcut requires a the key/commands we created and the manager options to create a valid shortcut.

```ts
const shortcut =createShortcut({
	command: "test",
	chain: [["a"]],
	condition: createCondition("a || b", true),
	enabled: true,
}, {options, keys, commands}).unwrap()

const shortcuts = createShortcuts([
	shortcut,
	// shortcut2
], {options, keys, commands}).unwrap()

```

At this point we can create the manager. This time, because we passed full `Keys/Commands/Shortcuts` objects, the manager will not create them internal as it does when you pass it raw keys/commands/etc.

We should also set the listener at this point to prevent default events while recording, and to label keys automatically if we want (see `labelWithEvent` and `labelWithKeyboardMap` for details).
```ts
const manager = createManager({
	keys,
	commands,
	shortcuts,
	options,
	listener: ({ event, manager, keys }) => {
		if (!event) return
		labelWithEvent(event, keys, manager)
		// this is only an example, the specifics, depend on how you implement recording
		if (
			manager.state.isRecording
			&& !(event instanceof MouseEvent)
			&& "preventDefault" in event
		) {
			// prevent default effect of keys when recording
			event.preventDefault()
		}
	},
})

//in either case, keys and commands are typed
const keyA = manager.keys.entries.KeyA
const testCommand = manager.commands.entries.test
```

## Changing/Setting Properties and Hooks

A series of `set*Prop` functions are provided to safely set properties on keys, shortcuts, etc. We pass these the manager to give the functions context so they can tell whether a given action is ok.

When we create the manager, we can also pass additional restrictions using `hooks` or just hook in to listen to events (e.g. in the demo, these are used to trigger saving).
```ts
const manager = createManager({
	// ...
	hooks: {
		onSetShortcutProp(...args) {
			throw new CustomError("You can't change the shortcuts.")
		}
	}
})

const res = setShortcutProp(shortcut, "chain", newChain, manager)
if (res.isError) {
	// res.error is now typed as all the errors setting this property can throw
	// + CustomError
}
```

Note that while the built in errors are property specific, custom errors are not.

## Other Helpers and Utilities

There are many helpers provided to simplify common use cases under `/helpers`. Some notable ones are:

- `equals*` functions for checking equality.
- `calculateLayoutSize` for calculating the total size of a layout in key units
- `safeSetManagerChain` for safely setting of the state of the manager's chain.
- `shortcutCanExecuteIn` and `shortcutIsTriggerableBy`.
- `virtualPress/Toggle/Release` for virtual key presses (allowing a click on a virtual keyboard to trigger a key press).
- `getKeyboardLayoutMap` for getting the keyboard layout map needed for `labelWithKeyboardMap`.
- `shortcutSwapChords` for swapping the base chords of shortcuts. 
- `generateKeyShortcutMap` This is a complex helper that generates a map, keyed by all the key id's, with info regarding what shortcuts can be pressed. This is crucial for showing a visual representation of the shortcuts on the keys depending on the current key state as is done in the demo.

There's also some smaller utility functions in `/utils`:
- `equals/dedupe/clone/*Key` These are particularly important for manipulating chords. This is because keys which are variants of eachother (see `Key.variants`) do not have matching ids and we usually want to be able to dedupe by the variants as well. 
- `isAny/Trigger/Wheel/MouseKey`.


There's also a few other functions that in the future might be moved from the demo were I created them and into the library. See [demo/src/common](https://github.com/AlansCodeLog/shortcuts-manager/tree/master/demo/src/common).

## More Examples

I'm currently working polishing the library and making it easier to use. 

Many of the methods/properties have extensive documentation with examples.

For a more advanced example, you can look at the [demo](https://alanscodelog.github.io/shortcuts-manager/demo) and it's [code](https://github.com/AlansCodeLog/shortcuts-manager/tree/master/demo).

There are also extensive tests you can look at, specifically the [tests/Manager.spec.ts](https://github.com/AlansCodeLog/shortcuts-manager/tree/master/tests/Manager.spec.ts) file.

## Usage with Frameworks 

Originally this was written with classes, but that kind of grew into a tangled mess and it made it hard to override/customize functionality and save objects. It also made it hard to work with frameworks, even proxy-based ones.

Now everything is just a plain object. The library still mutates everything directly and that is unlikely to change\*, but in frameworks like vue which allow deep reactivity, this should work perfectly. In frameworks that don't, you might have to resort to a library like valtio to be able to use proxy based reactivity. 

The reason the library mutates objects directly is that some changes can cause multiple other changes to happen (for example, safely setting the manager's chain can touch a lot of state) and making the library immutable would probably be expensive, especially for frameworks that don't need it.

Note that the `on*` hooks were not intended for intercepting property changes since they have no record of what the given value *was*. This could be changed if it would help, but I would need to test/rewrite the demo in something like React to be sure everything is working as intended.

\* The other possibility is to add immutable versions of the `set*` functions and the listeners.

# [Development](./docs-src/DEVELOPMENT.md)

## Notes

Under gnome at least, if a key (usually Ctrl) is set to locate the cursor, it will not send any key events. It will only be detected when pressed with another key.

## Related

[@witchcraft/expressit (boolean parser)](https://github.com/witchcraftjs/expressit)
[Parsekey (shortcuts parser)](https://github.com/alanscodelog/parsekey)

# FAQ 

## Browser shortcuts interfere with certain shortcuts, how can this be avoided?

You can use a listener on the manager to e.preventDefault() some of these, but this doesn't work for all of them.

If available you can also try using the [Keyboard API's](https://developer.mozilla.org/en-US/docs/Web/API/Keyboard_API) lock method (see [Keyboard Locking](https://developer.mozilla.org/en-US/docs/Web/API/Keyboard_API#keyboard_locking) ).

## How to label keys with their local names?

If the [Keyboard API](https://developer.mozilla.org/en-US/docs/Web/API/Keyboard_API) is available, you can use it's [navigator.keyboard.getLayoutMap method.](https://developer.mozilla.org/en-US/docs/Web/API/Keyboard/getLayoutMap). Helpers (getKeyboardLayoutMap and labelWithNavigator) are provided for this purpose, see them for details.


## How to set multiple manager properties safely (i.e. batch replace shortcuts/commands/keys)?

This can be an issue because there isn't a way to tell the manager you want to replace *multiple* properties and it might be impossible to, for example, replace commands with a smaller subset but not have it error even if you're planning to replace the shortcuts so they don't contain missing commands.

To achieve this:

You can shallow clone the manager, change all the properties you want directly, then validate it's state by using isValidManager.

Once you know it's valid, detach the old manager and attach the new one.
```ts
detach(manager, ...)
const clone = {...manager, keys: newKeys, shortcuts: newShortcuts}

if (isValidManager(manager)) {
	attach(clone, ...)
}

```
## How to create `modifier-only` shortcuts? (e.g. a shortcut `Ctrl` that changes the some state like enabling multiple selection).

To do this, instead of clearing the manager's chain, you just set the state directly.

```ts
const enableMultiSelect = createCommand("enableMultiSelect", {
	execute: ({isKeydown}) => {
		state.multiSelect = isKeydown
	}
})
const shortcut = createShortcut({
	chain: [["ControlLeft"]],
	command: enableMultiSelect.name,
}, manager).unwrap()
addShortcut(shortcut, manager).unwrap()
```

While the click on some item could be handled by a shortcut, usually you will want to handle it in your framework:

```vue
// vue
<template>
	<button
		v-for="item in items"
		:class="twMerge(
			state.multiSelect && `cursor-pointer`
		`)"
		@click="addToSelected(item)"
	></button>
</template>
<script setup>
import { state } from "./state.js" // reactive({ multiSelect: false })
const selected = ref([])
function addToSelected(item) {
	if (state.multiSelect) {
		if (!selected.value.includes(item)) {
			selected.value.push(item)
		} 
	} else {
		selected.value = [item]
	}
}
</script>
```



