// import { crop, indent, pretty, unreachable } from "@utils/utils"

// import { KnownError } from "./KnownError"

// import { Command, Commands, Key, Keys, Shortcut, Shortcuts } from "@/classes"
// import { ERROR, ErrorCallback, Optional } from "@/types"


// type ErrorCallbackSubtype<T> =
// T extends Key
// ? ErrorCallback<ERROR.DUPLICATE_KEY>

// : T extends Command
// ? ErrorCallback<ERROR.DUPLICATE_COMMAND>

// : T extends Shortcut
// ? ErrorCallback<ERROR.DUPLICATE_SHORTCUT>
// : never

// /**
//  * Adds an entry to an "collection" instance's entries property.
//  * The entries property is usually an object, but sometimes it needs to be an array.
//  *
//  * @internal
//  */
// export function addToDict<
// 	T extends Command | Key | Shortcut, // needed else we get an error on the callback type
// 	TSelf extends Commands | Keys | Shortcuts = Commands | Keys | Shortcuts,
// 	TEntries extends
// 		Record<string, T> | T[] =
// 		Record<string, T> | T[],
// >(
// 	self: TSelf,
// 	entries: TEntries,
// 	entry: T,
// 	/** When entries are stored in a record this will give us the key the entries are keyed by. */
// 	indexer: Optional<keyof TEntries | ((entry: T) => string)>,
// 	/** Is the user's error callback passed down to us. */
// 	cb: ErrorCallbackSubtype<T>,
// ): void {
// 	const key = typeof indexer === "function"
// 		? indexer(entry) as keyof TEntries
// 		: indexer

// 	let existing: T | undefined

// 	if (Array.isArray(entries)) {
// 		existing = (entries).find(item => {
// 			entry.equals(item)
// 		})
// 	} else {
// 		existing = (entries as any)[key as string]
// 	}

// 	if (existing) {
// 		const type = entry.constructor.name
// 		const text = crop`
// 			${type} ${existing/* .string */} is already registered.
// 			Existing ${type}:
// 			${indent(pretty(existing), 3)}
// 			New ${type}:
// 			${indent(pretty(entry), 3)}
// 		`

// 		const error =
// 			existing instanceof Key // todo
// 			? new KnownError(ERROR.DUPLICATE_KEY, text, { existing: (existing as any), self: self as Keys })

// 			: existing instanceof Command // todo
// 			? new KnownError(ERROR.DUPLICATE_COMMAND, text, { existing: (existing as any), self: self as Commands })

// 			: existing instanceof Shortcut // todo
// 			? new KnownError(ERROR.DUPLICATE_SHORTCUT, text, { existing: (existing as any), self: self as Shortcuts })
// 			: unreachable()
// 			// not sure why this thinks cb takes a union of ALL possible types
// 			// the following cast works but is wrong for use for the function argument

// 			;(cb as ErrorCallback<ERROR.DUPLICATE_KEY | ERROR.DUPLICATE_COMMAND | ERROR.DUPLICATE_SHORTCUT>)(error)
// 	}

// 	if (Array.isArray(entries)) {
// 		(entries).push(entry)
// 	} else {
// 		(entries as any)[key as string] = entry
// 	}
// }
