# datamorph

**Topics:** `api` · `datamorph` · `mapping` · `mern-packages` · `merndev` · `mobile` · `nodejs` · `npm-pm` · `observability` · `react` · `react-native` · `sanitization` · `transform` · `typescript`

**React Native** library.

Transform API/database data automatically through pipelines.

## Features

- response shaping
- field mapping
- nested transforms
- sanitization
- serialization

## Example

```ts
import { datamorph } from "@mr-aftab-ahmad-khan/datamorph";

const out = datamorph()
  .hide("password")
  .rename("full_name", "name")
  .apply(user);
```

## Why it matters

Developers constantly write repetitive transformation logic.

## License

MIT
