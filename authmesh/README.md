# authmesh

**Topics:** `auth` · `authmesh` · `jwt` · `mern-packages` · `merndev` · `mobile` · `nodejs` · `npm-pm` · `observability` · `rbac` · `react` · `react-native` · `session` · `typescript`

**React Native** library.

Create centralized authentication systems across MERN services.

## Features

- JWT validation
- role propagation
- shared sessions
- token rotation
- auth middleware
- RBAC

## Example

```ts
import express from "express";
import { authmesh } from "@mr-aftab-ahmad-khan/authmesh";

const app = express();
app.use(authmesh({ accessSecret: process.env.JWT_SECRET! }));
```

## Why it matters

Authentication duplication becomes impossible to maintain at scale.

## License

MIT
