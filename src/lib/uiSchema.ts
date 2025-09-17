// Core UI JSON schema types and minimal runtime validation

export type ComponentType = "container" | "text" | "input" | "button";

export type Style = Record<string, string | number>;

export type BindingTarget = {
  // e.g., { component: "messageInput", path: "value" }
  component: string;
  path: string; // dotted path relative to component state (e.g., "value")
};

export type ButtonAction = {
  type: "api_call" | "log";
  endpoint?: string; // key inside config.endpoints
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  payload?: Record<string, BindingTarget | string | number | boolean | null>;
  successMessage?: string;
  errorMessage?: string;
};

export type BaseComponent = {
  id: string; // unique id
  type: ComponentType;
  style?: Style;
  className?: string;
  children?: UIComponent[]; // only for container
};

export type TextComponent = BaseComponent & {
  type: "text";
  text: string;
};

export type InputComponent = BaseComponent & {
  type: "input";
  placeholder?: string;
  value?: string;
  name?: string;
};

export type ButtonComponent = BaseComponent & {
  type: "button";
  text: string;
  action?: ButtonAction;
};

export type ContainerComponent = BaseComponent & {
  type: "container";
  direction?: "row" | "column";
  gap?: number;
  align?: "start" | "center" | "end" | "between";
};

export type UIComponent =
  | TextComponent
  | InputComponent
  | ButtonComponent
  | ContainerComponent;

export type GlobalConfig = {
  authToken?: string;
  endpoints?: Record<string, string>; // key -> URL
  headers?: Record<string, string>; // global headers
};

export type UIConfig = {
  name?: string;
  version?: string;
  config?: GlobalConfig;
  root: UIComponent; // root container or any component
  components?: UIComponent[]; // optional registry, referenced by id
};

// Runtime validation (lightweight, no deps)
export function validateUIConfig(input: unknown): { ok: true; value: UIConfig } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  function isObj(v: any) {
    return v && typeof v === "object" && !Array.isArray(v);
  }

  function validateComponent(node: any, path: string): node is UIComponent {
    if (!isObj(node)) {
      errors.push(`${path} should be an object`);
      return false;
    }
    if (typeof node.id !== "string" || !node.id) errors.push(`${path}.id must be non-empty string`);
    if (!(["container", "text", "input", "button"] as const).includes(node.type)) {
      errors.push(`${path}.type invalid`);
    }
    if (node.style && !isObj(node.style)) errors.push(`${path}.style must be object`);

    switch (node.type) {
      case "text":
        if (typeof node.text !== "string") errors.push(`${path}.text must be string`);
        break;
      case "input":
        if (node.placeholder && typeof node.placeholder !== "string") errors.push(`${path}.placeholder must be string`);
        if (node.value && typeof node.value !== "string") errors.push(`${path}.value must be string`);
        break;
      case "button":
        if (typeof node.text !== "string") errors.push(`${path}.text must be string`);
        break;
      case "container":
        if (node.children && !Array.isArray(node.children)) errors.push(`${path}.children must be array`);
        if (Array.isArray(node.children)) {
          node.children.forEach((c: any, i: number) => validateComponent(c, `${path}.children[${i}]`));
        }
        break;
    }
    return true;
  }

  if (!isObj(input)) return { ok: false, errors: ["root must be an object"] };

  if (!("root" in input)) errors.push("root is required");
  if (input.root) validateComponent((input as any).root, "root");

  if ((input as any).components) {
    const comps = (input as any).components;
    if (!Array.isArray(comps)) errors.push("components must be array");
    else comps.forEach((c: any, i: number) => validateComponent(c, `components[${i}]`));
  }

  if ((input as any).config) {
    const cfg = (input as any).config;
    if (!isObj(cfg)) errors.push("config must be object");
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, value: input as UIConfig };
}