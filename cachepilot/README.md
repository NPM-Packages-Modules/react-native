# cachepilot

**React Native** library.

Automatically cache APIs and database queries intelligently.

## Features

- Redis integration
- stale refresh
- auto invalidation
- query fingerprinting
- route caching
- memory sync

## Example

```ts
import { cachepilot } from "@mr-aftab-ahmad-khan/cachepilot";

export const getProducts = cachepilot.wrap(async () => fetchProducts());
```

## Why it matters

Caching logic is complicated and duplicated everywhere.

## License

MIT
