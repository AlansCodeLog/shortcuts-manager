## File Structure

This library makes use of a custom index file manager I wrote, called [indexit](https://github.com/alanscodelog/indexit).

Whenever a file is added/removed, the `gen:exports` script should be called, it calls indexit with the right options and will update the necessary index files.

Every function normally has it's own file and there should only be one export per file (indexit does not support multiple yet, and will just use the first export).

```
src
 ┣ bases
 ┃ ┣ #todo explain
 ┣ classes
 ┃ ┣ #todo explain
 ┣ helpers
 ┣ types - all the types and enums are stored here in their respective categories
tests
 ┣ chai.ts - imports & re-exports retyped chai + plugins
 ┣ template.ts - the template to use for tests, just copy and rename to the name of the test + `.spec.ts`
 ┗ helpers.keys.ts - contains com pre-configured keys used in tests, they are not meant to be very realistic
```

## Building

Run `pnpm run build` to build the library and the types. If you don't need to build the types you can use the `build:babel` or `build:babel:watch` commands.

# Building the Demo

The demo is mostly WIP, hardly demo. Am currently checking everything is ergnomic, etc.

Currently the `demo:dev` script is broken because of something related to [vite and linked dependencies](https://vitejs.dev/guide/dep-pre-bundling.html#monorepos-and-linked-dependencies) and the package not being ESM. Hoping this [PR](https://github.com/vitejs/vite/pull/7094) might fix things in the future.

To build the demo, the package must be linked to itself. I forget how to do this with npm. With pnpm which is what I use locally, just `pnpm link .`

Now you can build then serve the demo: `pnpm demo:build && pnpm demo:serve`.

# Other

`@utils/*` imports are an alias to my utils library [`@alanscodelog/utils`](https://github.com/AlansCodeLog/my-utils).
