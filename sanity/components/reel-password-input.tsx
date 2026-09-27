"use client";

import { useState, type ChangeEvent, type KeyboardEvent } from "react";
import { set, unset, type StringInputProps } from "sanity";

async function hashPassword(password: string) {
  const iterations = 210_000;
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const digest = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256,
  );
  const toHex = (bytes: Uint8Array) =>
    Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `pbkdf2:${iterations}:${toHex(salt)}:${toHex(new Uint8Array(digest))}`;
}

export function ReelPasswordInput(props: StringInputProps) {
  const [password, setPassword] = useState("");
  const [saved, setSaved] = useState(false);

  const savePassword = async () => {
    const trimmed = password.trim();
    if (!trimmed) return;
    props.onChange(set(await hashPassword(trimmed)));
    setPassword("");
    setSaved(true);
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <input
        type="password"
        value={password}
        placeholder={props.value ? "Enter a new password to replace the current one" : "Enter a password"}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setPassword(event.currentTarget.value);
          setSaved(false);
        }}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void savePassword();
          }
        }}
        style={{ padding: 10, border: "1px solid #ccc", borderRadius: 3, font: "inherit" }}
      />
      <button
        type="button"
        disabled={!password.trim()}
        onClick={() => void savePassword()}
        style={{ padding: 10, border: 0, borderRadius: 3, cursor: "pointer", font: "inherit" }}
      >
        {props.value ? "Replace password" : "Set password"}
      </button>
      {props.value ? (
        <button
          type="button"
          onClick={() => {
            props.onChange(unset());
            setSaved(false);
          }}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 3, cursor: "pointer", font: "inherit" }}
        >
          Remove password
        </button>
      ) : null}
      {props.value ? (
        <p style={{ margin: 0, fontSize: 13 }}>
          {saved ? "Password updated. Publish the reel to save it." : "A password is set."}
        </p>
      ) : null}
    </div>
  );
}
