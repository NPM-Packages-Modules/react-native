# eventbridgex

**React Native** library.

Unified event-driven communication layer for MERN services.

## Features

- pub/sub
- event retries
- schema validation
- consumer groups
- dead event handling
- event replay

## Example

```ts
import { eventbridgex } from "@mr-aftab-ahmad-khan/eventbridgex";

await eventbridgex.emit("order.created", { id: "42" });
```

## Why it matters

Event architectures become chaotic without centralized tooling.

## License

MIT
