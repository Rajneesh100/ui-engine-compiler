"use client";

import React, { CSSProperties, useCallback, useMemo, useRef, useState } from "react";
import type {
  UIConfig,
  UIComponent,
  InputComponent,
  ButtonComponent,
  ContainerComponent,
  TextComponent,
  BindingTarget,
} from "./uiSchema";
import { validateUIConfig } from "./uiSchema";

// Resolve a binding target like { component: "messageInput", path: "value" }
function resolveBinding(
  binding: BindingTarget,
  state: Record<string, any>
): any {
  const obj = state[binding.component];
  if (obj == null) return undefined;
  if (!binding.path) return obj;
  const parts = binding.path.split(".");
  return parts.reduce<any>((acc, key) => (acc == null ? acc : acc[key]), obj);
}

// Merge headers: global -> action -> auth
function buildHeaders(cfg: UIConfig, actionHeaders?: Record<string, string>) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(cfg.config?.headers || {}),
    ...(actionHeaders || {}),
  };
  if (cfg.config?.authToken && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${cfg.config.authToken}`;
  }
  return headers;
}

async function executeApiCall(opts: {
  cfg: UIConfig;
  endpointKey?: string;
  method?: string;
  headers?: Record<string, string>;
  payload?: any;
}) {
  const { cfg, endpointKey, method = "POST", headers, payload } = opts;
  const url = endpointKey ? cfg.config?.endpoints?.[endpointKey] : undefined;
  if (!url) throw new Error(`Unknown endpoint key: ${endpointKey}`);
  const res = await fetch(url, {
    method,
    headers: buildHeaders(cfg, headers),
    body: method === "GET" ? undefined : JSON.stringify(payload ?? {}),
  });
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    const message = typeof data === "string" ? data : JSON.stringify(data);
    throw new Error(message || `Request failed with ${res.status}`);
  }
  return data;
}

// Map style object directly to React CSSProperties
function toStyle(style?: Record<string, string | number>): CSSProperties | undefined {
  return style as CSSProperties | undefined;
}

export type EngineProps = {
  config: UIConfig; // already validated preferred
  className?: string;
  onLog?: (msg: any, kind?: "info" | "error") => void;
};

export function useParsedConfig(raw: string | UIConfig): {
  config?: UIConfig;
  errors?: string[];
} {
  return useMemo(() => {
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        const v = validateUIConfig(parsed);
        if (v.ok) return { config: v.value };
        return { errors: v.errors };
      } catch (e: any) {
        return { errors: [e?.message || "Invalid JSON"] };
      }
    }
    const v = validateUIConfig(raw);
    if (v.ok) return { config: v.value };
    return { errors: v.errors };
  }, [raw]);
}

export function UIEngine({ config, className, onLog }: EngineProps) {
  // Component-level state store: id -> state
  const [store, setStore] = useState<Record<string, any>>(() => ({}));
  const mounted = useRef(false);

  const updateState = useCallback((id: string, updater: (prev: any) => any) => {
    setStore((prev) => ({ ...prev, [id]: updater(prev[id]) }));
  }, []);

  const setState = useCallback((id: string, next: any) => {
    setStore((prev) => ({ ...prev, [id]: next }));
  }, []);

  const runAction = useCallback(
    async (button: ButtonComponent) => {
      const act = button.action;
      if (!act) return;
      try {
        if (act.type === "log") {
          const payload = act.payload || {};
          const evaluated: Record<string, any> = {};
          for (const [k, v] of Object.entries(payload)) {
            evaluated[k] = (v as any)?.component
              ? resolveBinding(v as BindingTarget, store)
              : v;
          }
          onLog?.(evaluated, "info");
          return;
        }
        if (act.type === "api_call") {
          const payload = act.payload || {};
          const evaluated: Record<string, any> = {};
          for (const [k, v] of Object.entries(payload)) {
            evaluated[k] = (v as any)?.component
              ? resolveBinding(v as BindingTarget, store)
              : v;
          }
          const data = await executeApiCall({
            cfg: config,
            endpointKey: act.endpoint,
            method: act.method,
            headers: act.headers,
            payload: evaluated,
          });
          onLog?.({ ok: true, data }, "info");
          if (act.successMessage) onLog?.(act.successMessage, "info");
          return;
        }
      } catch (e: any) {
        onLog?.(e?.message || String(e), "error");
      }
    },
    [config, onLog, store]
  );

  const renderNode = useCallback(
    (node: UIComponent): React.ReactNode => {
      switch (node.type) {
        case "container": {
          const n = node as ContainerComponent;
          const dir = n.direction === "row" ? "row" : "col";
          const gap = n.gap ?? 8;
          const align = n.align ?? "start";
          const alignClass =
            align === "center"
              ? "items-center"
              : align === "end"
              ? "items-end"
              : align === "between"
              ? "justify-between"
              : "items-start";
          const dirClass = dir === "row" ? "flex-row" : "flex-col";
          const styleObj: React.CSSProperties = { ...(toStyle(n.style) || {}), gap };
          return (
            <div
              key={n.id}
              data-id={n.id}
              className={`flex ${dirClass} ${alignClass} ${n.className ?? ""}`}
              style={styleObj}
            >
              {n.children?.map((c) => renderNode(c))}
            </div>
          );
        }
        case "text": {
          const n = node as TextComponent;
          return (
            <span key={n.id} data-id={n.id} className={n.className} style={toStyle(n.style)}>
              {n.text}
            </span>
          );
        }
        case "input": {
          const n = node as InputComponent;
          const value = store[n.id]?.value ?? n.value ?? "";
          return (
            <input
              key={n.id}
              data-id={n.id}
              name={n.name}
              placeholder={n.placeholder}
              value={value}
              onChange={(e) => setState(n.id, { ...(store[n.id] || {}), value: e.target.value })}
              className={n.className || "border rounded px-3 py-2"}
              style={toStyle(n.style)}
            />
          );
        }
        case "button": {
          const n = node as ButtonComponent;
          return (
            <button
              key={n.id}
              data-id={n.id}
              onClick={() => runAction(n)}
              className={n.className || "bg-foreground text-background rounded px-4 py-2"}
              style={toStyle(n.style)}
            >
              {n.text}
            </button>
          );
        }
        default:
          return null;
      }
    },
    [runAction, setState, store]
  );

  // Initialize default values once
  if (!mounted.current) {
    mounted.current = true;
    const defaults: Record<string, any> = {};
    const init = (n: UIComponent) => {
      if (n.type === "input") {
        const i = n as InputComponent;
        defaults[n.id] = { value: i.value ?? "" };
      }
      if ((n as any).children) (n as any).children.forEach(init);
    };
    init(config.root);
    setStore((prev) => ({ ...defaults, ...prev }));
  }

  return <div className={className}>{renderNode(config.root)}</div>;
}

export function tryParseConfig(json: string): { config?: UIConfig; errors?: string[] } {
  try {
    const obj = JSON.parse(json);
    const v = validateUIConfig(obj);
    if (v.ok) return { config: v.value };
    return { errors: v.errors };
  } catch (e: any) {
    return { errors: [e?.message || "Invalid JSON"] };
  }
}