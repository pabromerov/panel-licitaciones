"use client";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Panel = dynamic(() => import("./panel"), { ssr: false });

export default function Home() {
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).storage) {
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
          const keys = Object.keys(localStorage).filter((k: string) => !prefix || k.startsWith(prefix));
          return { keys };
        },
      };
    }
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 0 40px 0" }}>
      <Panel />
    </div>
  );
}
