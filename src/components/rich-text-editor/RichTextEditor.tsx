"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import Color from "@tiptap/extension-color";
import {TextStyle} from "@tiptap/extension-text-style";

import RichTextEditorToolbar from "./RichTextEditorToolbar";
import RichTextEditorLinkDialog from "./RichTextEditorLinkDialog";

import type {
  RichTextEditorImageUploadResult,
  RichTextEditorProps,
} from "./RichTextEditor.types";

import {
  cn,
  createEditorId,
  getPlainTextFromHtml,
  getWordCount,
  normalizeEditorHtml,
} from "./RichTextEditor.utils";

import "./RichTextEditor.css";
import { stripPastedColors } from "./helpers/stripPastedColors";

export default function RichTextEditor({
  value = "",
  onChange,
  onImmediateChange,
  onImageUpload,
  onFocus,
  onBlur,
  placeholder = "Start writing...",
  label,
  helperText,
  error,
  disabled = false,
  readOnly = false,
  required = false,
  enableImageUpload = true,
  enableLinks = true,
  showCharacterCount = true,
  characterLimit,
  debounceMs = 350,
  minHeight = 280,
  maxHeight,
  id,
  className,
  contentClassName,
}: RichTextEditorProps) {
  const generatedId = useId();

  const editorId = useMemo(
    () => createEditorId(id || generatedId.replace(/:/g, "")),
    [generatedId, id],
  );

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Keeps track of the last HTML value emitted by the editor.
   *
   * This prevents the parent/API synchronization effect
   * from unnecessarily replacing content that was just edited.
   */
  const latestEmittedValueRef = useRef(normalizeEditorHtml(value));

  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [plainText, setPlainText] = useState(() =>
    getPlainTextFromHtml(normalizeEditorHtml(value)),
  );

  /**
   * Tiptap extensions.
   *
   * StarterKit provides:
   * - paragraph
   * - heading
   * - bold
   * - italic
   * - strike
   * - bullet list
   * - ordered list
   * - list item
   * - blockquote
   * - hard break
   * - horizontal rule
   *
   * Inline code and code blocks are intentionally disabled.
   */
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },

        /*
         * Enter:
         *   creates a new paragraph/block.
         *
         * Shift + Enter:
         *   creates a <br>.
         */
        hardBreak: {},

        /*
         * Code formatting is not required
         * for this content editor.
         */
        code: false,

        /*
         * Code blocks are not required
         * for this content editor.
         */
        codeBlock: false,
      }),

      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),

      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,

        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),

      Image.configure({
        allowBase64: false,

        HTMLAttributes: {
          class: "rte-image",
          loading: "lazy",
        },
      }),

      /**
       * Text alignment is a BLOCK-LEVEL operation.
       *
       * It applies to the current paragraph or heading.
       */
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "left",
      }),

      /**
       * Text color support.
       *
       * Tiptap generates HTML similar to:
       *
       * <p>
       *   <span style="color: #ef4444">Important</span>
       * </p>
       *
       * Only text color is supported.
       *
       * There is intentionally NO Highlight extension.
       */
      TextStyle,

      Color.configure({
        types: ["textStyle"],
      }),

      CharacterCount.configure({
        limit: characterLimit,
      }),
    ],
    [characterLimit, placeholder],
  );

  /**
   * Debounced onChange.
   */
  const emitChange = useCallback(
    (html: string) => {
      if (!onChange) {
        return;
      }

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        latestEmittedValueRef.current = html;

        onChange(html);
      }, debounceMs);
    },
    [debounceMs, onChange],
  );

  const editor = useEditor({
    extensions,

    content: normalizeEditorHtml(value),

    editable: !disabled && !readOnly,

    /**
     * Required for SSR-safe behavior with Tiptap.
     */
    immediatelyRender: false,

    /**
     * Avoid unnecessary React re-renders on every Tiptap transaction.
     */
    shouldRerenderOnTransaction: false,

    editorProps: {
      transformPastedHTML: stripPastedColors,
      attributes: {
        id: editorId,

        class: "rte-content",

        role: "textbox",

        "aria-multiline": "true",

        "aria-invalid": error ? "true" : "false",

        "aria-describedby": [
          helperText ? `${editorId}-helper` : "",
          error ? `${editorId}-error` : "",
        ]
          .filter(Boolean)
          .join(" "),
      },
    },

    /**
     * Called whenever the editor content changes.
     */
    onUpdate: ({ editor: editorInstance }) => {
      const html = normalizeEditorHtml(editorInstance.getHTML());

      const text = editorInstance.getText();

      setPlainText(text);

      /**
       * Immediate callback.
       */
      onImmediateChange?.(html);

      /**
       * Debounced callback.
       */
      emitChange(html);
    },

    onFocus,

    onBlur,
  });

  /**
   * Cleanup debounce timer.
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Synchronize content loaded later from the backend API.
   */
  useEffect(() => {
    if (!editor) {
      return;
    }

    const normalizedValue = normalizeEditorHtml(value);

    const currentHtml = normalizeEditorHtml(editor.getHTML());

    /**
     * Nothing changed.
     */
    if (currentHtml === normalizedValue) {
      latestEmittedValueRef.current = normalizedValue;

      return;
    }

    /**
     * This value was already produced by this editor.
     *
     * Don't replace the current document unnecessarily.
     */
    if (latestEmittedValueRef.current === normalizedValue) {
      return;
    }

    /**
     * External/API value changed.
     *
     * Update Tiptap without emitting another onUpdate.
     */
    editor.commands.setContent(normalizedValue, {
      emitUpdate: false,
    });

    latestEmittedValueRef.current = normalizedValue;

    setPlainText(editor.getText());
  }, [editor, value]);

  /**
   * Keep editable/read-only state synchronized.
   */
  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(!disabled && !readOnly);
  }, [disabled, editor, readOnly]);

  /**
   * Image upload handler.
   */
  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor || !onImageUpload || disabled || readOnly) {
        return;
      }

      /**
       * Frontend validation.
       *
       * Backend validates the same rules again.
       */
      const maximumSize = 5 * 1024 * 1024;

      const supportedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];

      if (!supportedTypes.includes(file.type)) {
        window.alert("Please upload a JPG, PNG, WEBP, or GIF image.");

        return;
      }

      if (file.size > maximumSize) {
        window.alert("Image size must be less than 5 MB.");

        return;
      }

      try {
        setIsUploadingImage(true);

        /**
         * Backend upload adapter.
         *
         * Expected result:
         *
         * {
         *   url: string;
         *   alt: string;
         * }
         */
        const image: RichTextEditorImageUploadResult =
          await onImageUpload(file);

        if (!image.url) {
          throw new Error("Image upload did not return an image URL.");
        }

        /**
         * Insert the image at the current cursor position.
         */
        editor
          .chain()
          .focus()
          .setImage({
            src: image.url,
            alt: image.alt || file.name,
          })
          .run();
      } catch (uploadError) {
        console.error("Rich text editor image upload failed:", uploadError);

        window.alert(
          uploadError instanceof Error
            ? uploadError.message
            : "Unable to upload image. Please try again.",
        );
      } finally {
        setIsUploadingImage(false);
      }
    },
    [disabled, editor, onImageUpload, readOnly],
  );

  /**
   * Character count.
   */
  const characterCount = plainText.length;

  /**
   * Word count.
   */
  const wordCount = getWordCount(plainText);

  /**
   * Character limit state.
   */
  const isOverCharacterLimit = Boolean(
    characterLimit && characterCount > characterLimit,
  );

  /**
   * Editor initialization/loading state.
   */
  if (!editor) {
    return (
      <div
        className={cn("rte-container", "rte-container--loading", className)}
        aria-busy="true"
      >
        <div className="rte-skeleton rte-skeleton--toolbar" />

        <div
          className="rte-skeleton rte-skeleton--content"
          style={{
            minHeight,
          }}
        />
      </div>
    );
  }

  return (
    <>
      <section
        className={cn(
          "rte-container",
          error && "has-error",
          disabled && "is-disabled",
          readOnly && "is-read-only",
          className,
        )}
      >
        {label && (
          <div className="rte-label-row">
            <label className="rte-label" htmlFor={editorId}>
              {label}

              {required && (
                <span className="rte-required" aria-hidden="true">
                  *
                </span>
              )}
            </label>

            {readOnly && <span className="rte-read-only-badge">Read only</span>}
          </div>
        )}

        {!readOnly && (
          <RichTextEditorToolbar
            editor={editor}
            disabled={disabled}
            enableImageUpload={enableImageUpload && Boolean(onImageUpload)}
            enableLinks={enableLinks}
            isUploadingImage={isUploadingImage}
            onOpenLinkDialog={() => setIsLinkDialogOpen(true)}
            onImageButtonClick={handleImageUpload}
          />
        )}

        <div
          className={cn("rte-editor-shell", contentClassName)}
          style={{
            minHeight,
            maxHeight,
            overflowY: maxHeight ? "auto" : undefined,
          }}
        >
          <EditorContent editor={editor} />
        </div>

        {(helperText || showCharacterCount || error) && (
          <footer className="rte-footer">
            <div>
              {error ? (
                <p id={`${editorId}-error`} className="rte-error" role="alert">
                  {error}
                </p>
              ) : helperText ? (
                <p id={`${editorId}-helper`} className="rte-helper">
                  {helperText}
                </p>
              ) : null}
            </div>

            {showCharacterCount && (
              <div
                className={cn(
                  "rte-count",
                  isOverCharacterLimit && "rte-count--limit-exceeded",
                )}
                aria-live="polite"
              >
                <span>{wordCount} words</span>

                <span aria-hidden="true">·</span>

                <span>
                  {characterCount}
                  {characterLimit ? ` / ${characterLimit}` : ""} characters
                </span>
              </div>
            )}
          </footer>
        )}
      </section>

      <RichTextEditorLinkDialog
        editor={editor}
        open={isLinkDialogOpen}
        onClose={() => setIsLinkDialogOpen(false)}
      />
    </>
  );
}
