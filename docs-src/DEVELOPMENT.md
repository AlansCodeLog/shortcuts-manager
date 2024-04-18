## File Structure

This library makes use of a custom index file manager I wrote, called [indexit](https://github.com/alanscodelog/indexit).

Whenever a file is added/removed, the `gen:exports` script should be called, it calls indexit with the right options and will update the necessary index files.

Every function normally has it's own file and there should only be one export per file (indexit does not support multiple yet, and will just use the first export).

```
src
 ┣ defaults - default implementations for some options such as the stringifier/sorter/etc
 ┣ demo - the demo is set up so it can use the library straight from src, see the vite config for details
 ┣ helpers - more complex helper functions that require some parts of the manager
 ┣ utils - small utility functions, do not require complex options
 ┣ internal - internal helpers/utils - their apis for the moment are not considered stable, many will be moved to helpers in the future
 ┣ types - all the types and enums are stored here in their respective categories
tests
 ┣ template.ts - the template to use for tests, just copy and rename to the name of the test + `.spec.ts`
 ┗ helpers.keys.ts 
	- contains custom pre-configured keys used in tests, they are not meant to be very realistic
	- the manager it exposes should be deep cloned in tests before modifications
```

## Demo

The demo is mostly WIP, hardly demo. Am currently using it as a playground to check everything is ergnomic, etc.

It uses vite and compiles the src of the library also, so changes in both the library and the demo should be instantaneous.

Note that the out dir is `docs/demo` so that it can be seen from the docs site in the future.
