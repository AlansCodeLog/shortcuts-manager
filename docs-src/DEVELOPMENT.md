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

## Demo

The demo is mostly WIP, hardly demo. Am currently using it as a playground to check everything is ergnomic, etc.

It uses vite and compiles the src of the library also, so changes in both the library and the demo should be instantaneous.

Note that the out dir is `docs/demo` so that it can be seen from the docs site in the future.

## Other

`@utils/*` imports are an alias to my utils library [`@alanscodelog/utils`](https://github.com/AlansCodeLog/my-utils).
