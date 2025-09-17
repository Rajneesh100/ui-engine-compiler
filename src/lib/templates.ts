import type { UIConfig } from "./uiSchema";

export const ChatTemplate: UIConfig = {
  name: "Chat App",
  version: "1.0",
  config: {
    authToken: "demo-token",
    endpoints: {
      send_message: "http://localhost:3000/send-message",
    },
    headers: {},
  },
  root: {
    id: "root",
    type: "container",
    direction: "column",
    gap: 12,
    className: "max-w-2xl w-full mx-auto p-4 border rounded-lg",
    children: [
      { id: "title", type: "text", text: "Chat", className: "text-xl font-semibold" },
      {
        id: "composer",
        type: "container",
        direction: "row",
        gap: 8,
        children: [
          { id: "messageInput", type: "input", placeholder: "Type a message...", className: "flex-1 border rounded px-3 py-2" },
          {
            id: "sendBtn",
            type: "button",
            text: "Send",
            className: "bg-black text-white px-4 py-2 rounded",
            action: {
              type: "api_call",
              endpoint: "send_message",
              method: "POST",
              payload: {
                message: { component: "messageInput", path: "value" },
              },
              successMessage: "Message sent",
            },
          },
        ],
      },
    ],
  },
};

export const ContactFormTemplate: UIConfig = {
  name: "Contact Form",
  version: "1.0",
  config: {
    endpoints: {
      submit: "http://localhost:3000/api/contact",
    },
  },
  root: {
    id: "root",
    type: "container",
    direction: "column",
    gap: 10,
    className: "max-w-md w-full mx-auto p-4 border rounded-lg",
    children: [
      { id: "heading", type: "text", text: "Contact Us", className: "text-xl font-semibold" },
      { id: "name", type: "input", placeholder: "Your Name" },
      { id: "email", type: "input", placeholder: "Email" },
      { id: "message", type: "input", placeholder: "Message" },
      {
        id: "submit",
        type: "button",
        text: "Submit",
        className: "bg-black text-white px-4 py-2 rounded",
        action: {
          type: "api_call",
          endpoint: "submit",
          method: "POST",
          payload: {
            name: { component: "name", path: "value" },
            email: { component: "email", path: "value" },
            message: { component: "message", path: "value" },
          },
        },
      },
    ],
  },
};

export const DashboardTemplate: UIConfig = {
  name: "Dashboard",
  version: "1.0",
  root: {
    id: "root",
    type: "container",
    direction: "column",
    gap: 16,
    className: "max-w-3xl w-full mx-auto p-4",
    children: [
      { id: "title", type: "text", text: "Simple Dashboard", className: "text-2xl font-bold" },
      {
        id: "filters",
        type: "container",
        direction: "row",
        gap: 8,
        children: [
          { id: "search", type: "input", placeholder: "Search...", className: "flex-1 border rounded px-3 py-2" },
          { id: "refresh", type: "button", text: "Refresh", className: "px-3 py-2 border rounded" },
        ],
      },
    ],
  },
};

export const Templates = {
  chat: ChatTemplate,
  contact: ContactFormTemplate,
  dashboard: DashboardTemplate,
};