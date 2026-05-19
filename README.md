# React Native packages

![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)

Mobile npm packages for React Native. Each folder = one [org repo](https://github.com/orgs/NPM-Packages-Modules/repositories).

## Packages

| Package | Purpose |
| --- | --- |
| [servbridge](./servbridge) | Connect app services with minimal setup |
| [datamorph](./datamorph) | API data transform pipelines |
| [routeforge](./routeforge) | Navigation / screen scaffolding |
| [authmesh](./authmesh) | Centralized auth & tokens |
| [querygenie](./querygenie) | API query builder |
| [cachepilot](./cachepilot) | Smart fetch caching |
| [socketmesh](./socketmesh) | Real-time channels |
| [envsyncer](./envsyncer) | Env validation |
| [stacktracex](./stacktracex) | Distributed tracing |
| [retryflow](./retryflow) | Retries & fault tolerance |
| [mongoforge](./mongoforge) | Data layer optimization helpers |
| [eventbridgex](./eventbridgex) | Event pub/sub |
| [cronpilot](./cronpilot) | Background job scheduling |
| [schemashift](./schemashift) | Schema migration utilities |
| [secureflow](./secureflow) | Security hardening |
| [logmesh](./logmesh) | Structured logging |
| [servqueue](./servqueue) | Job queues |
| [deploysense](./deploysense) | Pre-release checks |
| [apidocsmith](./apidocsmith) | API docs |
| [apiflowx](./apiflowx) | API flow visualization |

## Development

```bash
npm run build --workspace=react-native/servbridge
npm test --workspace=react-native/servbridge
node ../.scripts/sync-workspace-repos.mjs react-native/servbridge
```

Backend MERN packages: [`../mern`](../mern). Flutter: [`../flutter`](../flutter).
