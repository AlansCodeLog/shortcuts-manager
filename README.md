### 🚧 WORK IN PROGRESS 🚧


![Docs](https://github.com/alanscodelog/shortcuts-manager/workflows/Docs/badge.svg)
![Build](https://github.com/alanscodelog/shortcuts-manager/workflows/Build/badge.svg)
[![Release](https://github.com/alanscodelog/shortcuts-manager/workflows/Release/badge.svg)](https://www.npmjs.com/package/shortcuts-manager)

# Name Pending

This is a shortcut manager library for handling ALL the shortcut needs of an application.

# [Docs](https://alanscodelog.github.io/shortcuts-manager)

# [Demo (very WIP, am currently using as testing playground)](https://alanscodelog.github.io/shortcuts-manager/demo)

# Features
- Manages anything key like (mouse + keyboard).
	- Modifiers, toggles, mouse buttons, and even the mouse wheel.
- Manages layouts. 
	- Easy to create and layout keys in one go.
	- Provides mechanisms for handling left/right key variants in any way you like.
	- Optional auto key labeling.
- Supports shortcuts chains (e.g. `Ctrl+A B C`).
	- Has methods for swapping/moving parts of the chain with ease.
- Framework agnostic.
- Hooks to allow listening to state changes and controlling whether shortcuts are valid, can be added, removed, modified, etc. 
- Easy error handling with type safe result monads.
	- e.g. to check a shortcut can be changed: `shortcut.allows("chain", [...]).isOk`
- Utility functions for common use cases.
- Heavily tested. 
<!-- - Plugable and highly flexible. -->
- Lots more... #todo

# Usage

```ts
// todo
```

I'm currently working polishing the library and making it smoother to use. You can see a rough demo of how it's intended to work as a whole in the demo. 

There are also extensive tests you can look at.

# [Development](./docs-src/DEVELOPMENT.md)


## Notes

Under gnome at least, if a key (usually Ctrl) is set to locate the cursor, it will not send any key events. It will only be detected when pressed with another key.

## Related

[Expressit (boolean parser)](https://github.com/alanscodelog/expressit)

[Parsekey (shortcuts parser)](https://github.com/alanscodelog/parsekey)

