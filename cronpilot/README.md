# cronpilot

**React Native** library.

Manage distributed cron jobs safely across servers.

## Features

- duplicate prevention
- retry scheduling
- cron balancing
- execution history
- worker coordination
- failure recovery

## Example

```ts
import { cronpilot } from "@mr-aftab-ahmad-khan/cronpilot";

cronpilot.schedule("* * * * *", task);
```

## Why it matters

Cron systems break unpredictably in scaled environments.

## License

MIT
