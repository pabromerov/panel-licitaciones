"use client";
import Panel from "./panel";

// Storage en localStorage para producción
if (typeof window !== "undefined" && !window.storage) {
  (window as any).storage = {
    get: async (key: string) => {
      const val = localStorage.getItem(key);
      return val !== null ? { key, value: val } : null;
    },
    set: async (key: string, value: string) => {
      localStorage.setItem(key, value);
      return { key, value };
    },
    delete: async (key: string) => {
      localStorage.removeItem(key);
      return { key, deleted: true };
    },
    list: async (prefix?: string) => {
      const keys = Object.keys(localStorage).filter(k => !prefix || k.startsWith(prefix));
      return { keys };
    },
  };
}

export default function Home() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 0 40px 0" }}>
      <Panel />
    </div>
  );
}
