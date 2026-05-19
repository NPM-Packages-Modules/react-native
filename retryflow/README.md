# retryflow

**React Native** library.

Manage retries and fault tolerance automatically.

## Features

- exponential backoff
- retry queues
- timeout recovery
- circuit breakers
- dead-letter handling
- retry analytics

## Example

```ts
import { retryflow } from "@mr-aftab-ahmad-khan/retryflow";

await retryflow.wrap(sendEmail)();
```

## Why it matters

Retry systems are difficult and often implemented poorly.

## License

MIT
