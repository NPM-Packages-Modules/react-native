# servbridge

**Topics:** `events` · `mern-packages` · `merndev` · `microservices` · `mobile` · `nodejs` · `npm-pm` · `observability` · `react` · `react-native` · `routing` · `servbridge` · `service-discovery` · `typescript`

**React Native** library.

Automatically connect multiple MERN services together with minimal setup.

## Features

- service discovery
- request routing
- event communication
- retry handling
- distributed tracing
- shared auth

## Example

```ts
import { servbridge } from "@mr-aftab-ahmad-khan/servbridge";

const bridge = servbridge();
bridge.register("payments", async (payload) => {
  /* handle */
});
bridge.emit("order.paid", { id: "1" });
```

## Why it matters

Microservices become operational chaos very quickly.

## License

MIT
