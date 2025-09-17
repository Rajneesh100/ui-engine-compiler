# JSON-to-UI Engine (Alpha)

This engine renders UI from a JSON config and wires basic state and API actions.

Key concepts:
- UIConfig: holds `config` (authToken, endpoints), `root` component tree.
- Components: container | text | input | button
- Bindings: reference component state by `{ component: "messageInput", path: "value" }`
- Actions:
  - `log`: dumps evaluated payload to Logs pane
  - `api_call`: calls a configured endpoint with headers + optional bearer token

Usage in code:

```tsx
import { UIEngine } from "@/lib/engine";
import { Templates } from "@/lib/templates";

<UIEngine config={Templates.chat} />
```

Extend it by adding component types in `uiSchema.ts` and adding render logic in `engine.tsx`.

Security note: The playground is for local development; never expose raw tokens in client-side JSON in production.