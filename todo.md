- [ ] Retest after new modifications, fix clear chain
- Esc clears chain
- drag bin disable
- drag bin delete
- remove unused errors - simplify
- old value in onsethooks
- document adding of empty chain hook?

# Wishlist
- [ ] Allow arrow key focusing if already using tab.


---
const res = setKeyProp({} as Key, "pressed", true, {} as Omit<Manager, "hooks">)
if (res.isError) {
	const err = res.error
}

class Test<T> extends Error {
	constructor(public t:T){super()}
}
const res = setKeysProp("entries@add", {} as Key, {
	shortcuts: {} as Manager["shortcuts"],
	commands: {} as Manager["commands"],
	keys: {} as Manager["keys"],
	options: {} as Manager["options"],
	hooks: {
		canSetKeysProp: (_keys, _prop, _val) => new Test(ERROR.INVALID_VARIANT),
	},
})
if (res.isError) {
	const t = res.error
}




const res = setKeyProp({} as Key, "x", 1, {
	hooks: {
		canSetKeyProp: () => new KnownError(ERROR.CANNOT_SET_WHILE_DISABLED, "Cannot set x property while a key is disabled.", { instance: {} as Key }),
	},
})
if (res.isError) {
	const err = res.error
}

const t = setShortcutProp({} as Shortcut, "chain", [], {} as Manager, { check: "only" })
