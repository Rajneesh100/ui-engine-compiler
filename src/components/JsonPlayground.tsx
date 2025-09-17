"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Templates } from "@/lib/templates";
import { UIEngine, useParsedConfig } from "@/lib/engine";
import type { UIConfig } from "@/lib/uiSchema";

const DEFAULT_JSON = JSON.stringify(Templates.chat, null, 2);

export default function JsonPlayground() {
  const [json, setJson] = useState<string>(DEFAULT_JSON);
  const parsed = useParsedConfig(json);
  const [logs, setLogs] = useState<Array<{ kind: "info" | "error"; msg: any }>>([]);

  function handleLog(msg: any, kind: "info" | "error" = "info") {
    setLogs((prev) => [...prev, { kind, msg }]);
  }

  useEffect(() => {
    // reset logs on JSON change to keep focus on latest run
    setLogs([]);
  }, [json]);

  const templateOptions = useMemo(
    () => [
      { key: "chat", label: "Chat App" },
      { key: "contact", label: "Contact Form" },
      { key: "dashboard", label: "Dashboard" },
    ],
    []
  );

  function loadTemplate(key: string) {
    const tpl = (Templates as any)[key] as UIConfig | undefined;
    if (tpl) setJson(JSON.stringify(tpl, null, 2));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">JSON Editor</h2>
          <div className="flex items-center gap-2">
            <label htmlFor="template" className="text-sm text-muted-foreground">Template:</label>
            <select
              id="template"
              className="border rounded px-2 py-1"
              onChange={(e) => loadTemplate(e.target.value)}
              defaultValue="chat"
            >
              {templateOptions.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          className="font-mono min-h-[420px] w-full border rounded p-3"
          spellCheck={false}
        />
        <div className="text-sm text-muted-foreground">
          Tip: Change endpoint URLs in config.endpoints to point to your API.
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Preview</h2>
        <div className="border rounded p-4 min-h-[420px] bg-card">
          {parsed.errors ? (
            <div className="text-red-600 text-sm whitespace-pre-wrap">
              {parsed.errors.join("\n")}
            </div>
          ) : parsed.config ? (
            <UIEngine config={parsed.config} onLog={handleLog} />)
          : null}
        </div>
        <div className="flex-1">
          <h3 className="font-medium mb-2">Logs</h3>
          <div className="border rounded p-3 h-48 overflow-auto bg-muted/50 text-sm">
            {logs.length === 0 && <div className="text-muted-foreground">No logs yet</div>}
            {logs.map((l, i) => (
              <div key={i} className={l.kind === "error" ? "text-red-600" : "text-foreground"}>
                {typeof l.msg === "string" ? l.msg : JSON.stringify(l.msg, null, 2)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}