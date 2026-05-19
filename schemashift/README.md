# schemashift

**Topics:** `cli` · `mern-packages` · `merndev` · `migration` · `mobile` · `mongodb` · `nodejs` · `npm-pm` · `observability` · `react` · `react-native` · `schema` · `schemashift` · `typescript`

**React Native** library.

Automatically generate MongoDB schema migrations.

## Features

- migration generation
- rollback support
- schema diffing
- validation repair
- version history
- migration tracking

## Example

```ts
import { schemashift } from "@mr-aftab-ahmad-khan/schemashift";

await schemashift.generate();
```

## Why it matters

Mongo migrations are still mostly unmanaged manually.

## License

MIT
