"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { isSafeHttpUrl } from "./RichTextEditor.utils";

type RichTextEditorLinkDialogProps = {
  editor: Editor;
  open: boolean;
  onClose: () => void;
};

export default function RichTextEditorLinkDialog({
  editor,
  open,
  onClose,
}: RichTextEditorLinkDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    const currentUrl = editor.getAttributes("link").href || "";

    setUrl(currentUrl);
    setError("");

    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [editor, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      onClose();
      return;
    }

    const normalizedUrl = /^https?:\/\//i.test(trimmedUrl)
      ? trimmedUrl
      : `https://${trimmedUrl}`;

    if (!isSafeHttpUrl(normalizedUrl)) {
      setError("Enter a valid http:// or https:// URL.");
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: normalizedUrl,
        target: "_blank",
        rel: "noopener noreferrer nofollow",
      })
      .run();

    onClose();
  };

  return (
    <div
      className="rte-dialog-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="rte-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rte-link-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="rte-dialog__header">
          <h3 id="rte-link-dialog-title">Add link</h3>

          <button
            type="button"
            className="rte-dialog__close"
            aria-label="Close link dialog"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="rte-dialog__label" htmlFor="rte-link-url">
            Website URL
          </label>

          <input
            ref={inputRef}
            id="rte-link-url"
            type="url"
            value={url}
            placeholder="https://example.com"
            className="rte-dialog__input"
            onChange={(event) => {
              setUrl(event.target.value);
              setError("");
            }}
          />

          {error && (
            <p className="rte-dialog__error" role="alert">
              {error}
            </p>
          )}

          <p className="rte-dialog__hint">
            Leave the URL empty and save to remove the existing link.
          </p>

          <div className="rte-dialog__actions">
            <button
              type="button"
              className="rte-button rte-button--secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="rte-button rte-button--primary">
              Save link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
