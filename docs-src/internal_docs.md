<!--
The main functionality of the library is split across the following classes:

Base Classes:
- [Key](./Key.ts)
- [Shortcut](./Shortcut.ts)
- [Command](./Command.ts)

Collection Classes
- [Keys](./Keys.ts)
- [Shortcuts](./Shortcuts.ts)
- [Commands](./Commands.ts)
Helper Classes
- [KeysSorter](./KeysSorter.ts)
- [Stringifier](./Stringifier.ts)

Property Classes
- [Condition](./Condition.ts)
- [Context](./Context.ts)

Plugin Classes
- [BasePlugin](./BasePlugin.ts)
- [CollectionPlugin](./CollectionPlugin.ts)


That's how they are referred to in the code and documentation.
-->
# Shared Internal-ish Documentation

## Generics

Although it might be noisier, where possible generics are assigned a default value so we can easily use them without any type parameters.

In general, the user should not really be needing to specify type parameters, as they should all be inferred correctly, unless otherwise noted.

<!-- ## Plugins -->
<!---->
<!-- All base classes take in `PluginBase` instances. -->
<!-- All collection classes take in `PluginCollection` instances. -->
<!---->
<!-- At the top of all base classes you'll see something like this for the generics: -->
<!---->
<!-- ```ts -->
<!-- TPlugins extends PluginBase<any>[] = PluginBase<any>[], -->
<!-- T extends OrToAnd<PluginInfo<TPlugins[number]>> = OrToAnd<PluginInfo<TPlugins[number]>>, -->
<!---->
<!-- // getting rid of the clutter we can read this like: -->
<!-- TPlugins = PluginBase<any>[] -->
<!-- T = OrToAnd<PluginInfo<TPlugins[number]>>, -->
<!-- ``` -->
<!---->
<!-- This is what allows typescript to understand what properties are "allowed" (and therefore provide proper autocomplete) on the `info` property given the plugins passed. -->
<!---->
<!-- The important bit is the second line, the first is just "capturing" the `plugin` param as a generic we can use. -->
<!---->
<!-- What it's doing is for each plugin (`TPlugins[number]>`), it "iterates" through the return value of each pluginbase's `init` property (using a helper type `PluginInfo`) which is what determines what will be assigned to `info`/`T`. But we only get a union out of this, so there's helper `OrToAnd` that converts the type into to an intersection of all the pluginbase's properties to require them ALL to be in `T`. -->
<!---->
<!-- Something similar happens for all collections, although it's not important for autocomplete: -->
<!---->
<!-- ```ts -->
<!-- TPlugins extends Plugin<any, any>[] = Plugin<any, any>[], -->
<!-- TPluginsBase extends TPlugins[number]["base"][] = TPlugins[number]["base"][], -->
<!---->
<!-- // getting rid of the clutter we can read this like: -->
<!-- TPlugins = Plugin<any, any>[], -->
<!-- TPluginsBase = TPlugins[number]["base"][], -->
<!-- ``` -->
<!---->
<!-- Again, first line is just to capture the plugins argument. -->
<!---->
<!-- The we just extract the `base` of each plugin (which is a `PluginBase` instance) into an array of bases so we can type our entries, e.g. `Shortcut<TPluginsBase>`. This is why these two generics are always first, because when we want typed entries, we need to set them internally. -->
<!---->
## Collection Entries

All collections, except `Shortcuts` use an object to store their entries. This object is keyed by some property in the base class.

To get typescript to understand this, first that property in the base class must be using a generic, this is why you'll see a seemingly unused generic called `T[INSERT PROP NAME] extends string = string` in all base classes except `Shortcut`.

Then in collection classes we do:

<!-- // T[TYPE] extends T[TYPE]<TPluginsBase> = T[TYPE]<TPluginsBase>, -->

```ts
TRaw[TYPE]s extends OnlyRequire<T[TYPE], "[KEY]">[] = OnlyRequire<T[TYPE], "[KEY]">[],
TEntries extends RecordFromArray<TRaw[TYPE], "[KEY]", T[TYPE]> = RecordFromArray<TRaw[TYPE], "[KEY]", T[TYPE]>
```

Getting rid of the clutter we can read this like:
<!-- T[TYPE] = T[TYPE]<TPluginsBase>, -->
<!-- TKey = Key<TPluginsBase>, -->
```ts
TRaw[TYPE]s = OnlyRequire<T[TYPE], "[KEY]">[],
TEntries = RecordFromArray<TRaw[TYPE], "[KEY]", T[TYPE]>

// real example (minus clutter):
TKey = Key<...>
TRawKeys = OnlyRequire<TKey, "id">[],
TEntries = RecordFromArray<TRawKeys, "id", TKey>
```

And it's easier to show how this works than explain it:
```ts
new Keys([ // <= TRawKeys
	{ id: "a"}, // <= OnlyRequire<TKey, "id">
	{ id: "b"},
	{ id: "c"},
])
```

`RecordFromArray` creates a type like this where each `TKey` is unique. `TKey.id` is different for each key<!-- , and so are the plugin values -->, etc.

```ts
type TEntries = {
	"a": TKey // TKey.id = a
	"b": TKey // TKey.id = b
	"c": TKey // TKey.id = c
}
```

### Shortcuts

Shortcuts are the exception to the above because there is not a single key they can be indexed by. You can have shortcuts with the exact same keys and properties except for one property (e.g. two shortcuts that fire under different conditions) and it would still be perfectly valid to store these in a collection and for them not to be considered duplicates\*.

So unlike other collection classes, they must be stored in an array and the class's methods differ from other collections.

\* In general, checking if shortcuts are duplicates is a bad idea if using boolean conditions. See <!-- Todo -->

-------------






draft


		type ExtendedHooks = CommandHooks & {a:BaseHookType<Bases, string, never>}
		class Test extends Command {
			override set<T extends keyof ExtendedHooks>(key: T, val: ExtendedHooks[T]["excludeSet"] extends true ? never : ExtendedHooks[T]["value"]): void {

			}
		}
		new Test("jhlkjh").set("execute", ()=>{})
		new Test("jhlkjh").set("a", "jg")
