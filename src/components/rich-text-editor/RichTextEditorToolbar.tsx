"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useEditorState } from "@tiptap/react";

import type { RichTextEditorToolbarProps } from "./RichTextEditor.types";
import { cn } from "./RichTextEditor.utils";

/**
 * Fixed text-color palette.
 *
 * These are text colors only.
 *
 * No highlight/background colors are used.
 */
const TEXT_COLORS = [
  "#000000",
  "#404040",
  "#666666",
  "#808080",
  "#999999",
  "#b3b3b3",
  "#cccccc",
  "#ffffff",

  "#ef4444",
  "#dc2626",
  "#b91c1c",
  "#991b1b",
  "#f97316",
  "#ea580c",
  "#c2410c",
  "#9a3412",

  "#f59e0b",
  "#d97706",
  "#ca8a04",
  "#a16207",
  "#eab308",
  "#84cc16",
  "#65a30d",
  "#4d7c0f",

  "#22c55e",
  "#16a34a",
  "#15803d",
  "#166534",
  "#14b8a6",
  "#0d9488",
  "#0f766e",
  "#115e59",

  "#06b6d4",
  "#0891b2",
  "#0e7490",
  "#155e75",
  "#3b82f6",
  "#2563eb",
  "#1d4ed8",
  "#1e40af",

  "#6366f1",
  "#4f46e5",
  "#4338ca",
  "#3730a3",
  "#8b5cf6",
  "#7c3aed",
  "#6d28d9",
  "#5b21b6",

  "#d946ef",
  "#c026d3",
  "#a21caf",
  "#86198f",
  "#ec4899",
  "#db2777",
  "#be185d",
  "#9d174d",

  "#f43f5e",
  "#e11d48",
  "#be123c",
  "#9f1239",
] as const;

const DEFAULT_TEXT_COLOR = "#000000";

type ToolbarButtonProps = {
  label: string;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

function ToolbarButton({
  label,
  title,
  active = false,
  disabled = false,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      className={cn("rte-toolbar__button", active && "is-active")}
      onMouseDown={(event) => {
        /*
         * Prevent the editor selection from being lost
         * when clicking the toolbar.
         */
        event.preventDefault();
      }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

type ToolbarGroupProps = {
  children: ReactNode;
};

function ToolbarGroup({ children }: ToolbarGroupProps) {
  return <div className="rte-toolbar__group">{children}</div>;
}

export default function RichTextEditorToolbar({
  editor,
  disabled,
  enableImageUpload,
  enableLinks,
  isUploadingImage,
  onImageButtonClick,
  onOpenLinkDialog,
}: RichTextEditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colorControlRef = useRef<HTMLDivElement>(null);

  const [isTextColorOpen, setIsTextColorOpen] = useState(false);

  /*
   * Read only the editor state that affects the toolbar.
   */
  const editorState = useEditorState({
    editor,

    selector: ({ editor: editorInstance }) => ({
      isBold: editorInstance.isActive("bold"),

      isItalic: editorInstance.isActive("italic"),

      isStrike: editorInstance.isActive("strike"),

      /*
       * Current text color.
       */
      textColor: editorInstance.getAttributes("textStyle").color ?? "",

      isBulletList: editorInstance.isActive("bulletList"),

      isOrderedList: editorInstance.isActive("orderedList"),

      isBlockquote: editorInstance.isActive("blockquote"),

      isLink: editorInstance.isActive("link"),

      isAlignLeft: editorInstance.isActive({
        textAlign: "left",
      }),

      isAlignCenter: editorInstance.isActive({
        textAlign: "center",
      }),

      isAlignRight: editorInstance.isActive({
        textAlign: "right",
      }),

      isHeading1: editorInstance.isActive("heading", {
        level: 1,
      }),

      isHeading2: editorInstance.isActive("heading", {
        level: 2,
      }),

      isHeading3: editorInstance.isActive("heading", {
        level: 3,
      }),

      canUndo: editorInstance.can().undo(),

      canRedo: editorInstance.can().redo(),
    }),
  });

  /*
   * Determine which block the cursor is currently inside.
   */
  const selectedBlockType = useMemo(() => {
    if (editorState.isHeading1) {
      return "h1";
    }

    if (editorState.isHeading2) {
      return "h2";
    }

    if (editorState.isHeading3) {
      return "h3";
    }

    return "paragraph";
  }, [editorState.isHeading1, editorState.isHeading2, editorState.isHeading3]);

  const commandDisabled = disabled || isUploadingImage;

  /*
   * Current selected text color.
   */
  const currentTextColor = editorState.textColor || DEFAULT_TEXT_COLOR;

  /*
   * Close the color palette when clicking outside.
   */
  useEffect(() => {
    if (!isTextColorOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (target instanceof Node && colorControlRef.current?.contains(target)) {
        return;
      }

      setIsTextColorOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isTextColorOpen]);

  /*
   * Handles the block-style dropdown.
   */
  const handleBlockTypeChange = (value: string) => {
    if (commandDisabled) {
      return;
    }

    if (value === "paragraph") {
      if (!editor.isActive("paragraph")) {
        editor.chain().focus().setParagraph().run();
      }

      return;
    }

    const level = Number(value.replace("h", "")) as 1 | 2 | 3;

    if (
      editor.isActive("heading", {
        level,
      })
    ) {
      return;
    }

    editor
      .chain()
      .focus()
      .setNode("heading", {
        level,
      })
      .run();
  };

  /*
   * Apply text color.
   *
   * Important:
   *
   * The color button uses onMouseDown + preventDefault,
   * so the selected text inside the editor remains selected.
   */
  const handleTextColorChange = (color: string) => {
    if (commandDisabled) {
      return;
    }

    editor.chain().focus().setColor(color).run();

    setIsTextColorOpen(false);
  };

  /*
   * Remove text color from selected text.
   */
  const handleRemoveTextColor = () => {
    if (commandDisabled) {
      return;
    }

    editor.chain().focus().unsetColor().run();

    setIsTextColorOpen(false);
  };

  return (
    <div
      className="rte-toolbar"
      role="toolbar"
      aria-label="Rich text formatting controls"
    >
      {/* =====================================================
          BLOCK TYPE
      ====================================================== */}

      <ToolbarGroup>
        <select
          aria-label="Text style"
          className="rte-toolbar__select"
          value={selectedBlockType}
          disabled={commandDisabled}
          onChange={(event) => {
            handleBlockTypeChange(event.target.value);
          }}
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
        >
          <option value="paragraph">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
      </ToolbarGroup>

      {/* =====================================================
          INLINE FORMATTING
      ====================================================== */}

      <ToolbarGroup>
        <ToolbarButton
          label="B"
          title="Bold"
          active={editorState.isBold}
          disabled={commandDisabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />

        <ToolbarButton
          label="I"
          title="Italic"
          active={editorState.isItalic}
          disabled={commandDisabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />

        <ToolbarButton
          label="S"
          title="Strikethrough"
          active={editorState.isStrike}
          disabled={commandDisabled}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />

        {/* =================================================
            TEXT COLOR
        ================================================== */}

        <div ref={colorControlRef} className="rte-color-picker">
          <button
            type="button"
            title="Text color"
            aria-label="Text color"
            aria-haspopup="true"
            aria-expanded={isTextColorOpen}
            disabled={commandDisabled}
            className={cn(
              "rte-toolbar__button",
              "rte-color-picker__trigger",
              isTextColorOpen && "is-active",
            )}
            onMouseDown={(event) => {
              /*
               * Critical:
               *
               * Don't allow the browser to remove
               * the selected editor text.
               */
              event.preventDefault();
            }}
            onClick={() => {
              if (commandDisabled) {
                return;
              }

              setIsTextColorOpen((current) => !current);
            }}
          >
            <span className="rte-color-picker__letter" aria-hidden="true">
              A
            </span>

            <span
              className="rte-color-picker__indicator"
              style={{
                backgroundColor: currentTextColor,
              }}
              aria-hidden="true"
            />
          </button>

          {isTextColorOpen && (
            <div
              className="rte-color-picker__popover"
              role="dialog"
              aria-label="Text colors"
            >
              <div className="rte-color-picker__header">
                <span>Text color</span>

                <button
                  type="button"
                  className="rte-color-picker__reset"
                  title="Remove text color"
                  aria-label="Remove text color"
                  disabled={commandDisabled}
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                  onClick={handleRemoveTextColor}
                >
                  Default
                </button>
              </div>

              <div
                className="rte-color-picker__grid"
                role="listbox"
                aria-label="Text color options"
              >
                {TEXT_COLORS.map((color) => {
                  const isSelected =
                    currentTextColor.toLowerCase() === color.toLowerCase();

                  return (
                    <button
                      key={color}
                      type="button"
                      role="option"
                      aria-label={`Text color ${color}`}
                      aria-selected={isSelected}
                      title={color}
                      className={cn(
                        "rte-color-picker__swatch",
                        isSelected && "is-selected",
                      )}
                      style={{
                        backgroundColor: color,
                      }}
                      onMouseDown={(event) => {
                        /*
                         * This is essential.
                         *
                         * Without preventDefault(), clicking
                         * the palette can remove the text
                         * selection before setColor() runs.
                         */
                        event.preventDefault();
                      }}
                      onClick={() => handleTextColorChange(color)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ToolbarGroup>

      {/* =====================================================
          LISTS / BLOCKS
      ====================================================== */}

      <ToolbarGroup>
        <ToolbarButton
          label="•"
          title="Bullet list"
          active={editorState.isBulletList}
          disabled={commandDisabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />

        <ToolbarButton
          label="1."
          title="Numbered list"
          active={editorState.isOrderedList}
          disabled={commandDisabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />

        <ToolbarButton
          label="❝"
          title="Block quote"
          active={editorState.isBlockquote}
          disabled={commandDisabled}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
      </ToolbarGroup>

      {/* =====================================================
          TEXT ALIGNMENT
      ====================================================== */}

      <ToolbarGroup>
        <ToolbarButton
          label="≡"
          title="Align left"
          active={editorState.isAlignLeft}
          disabled={commandDisabled}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        />

        <ToolbarButton
          label="≣"
          title="Align center"
          active={editorState.isAlignCenter}
          disabled={commandDisabled}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        />

        <ToolbarButton
          label="≢"
          title="Align right"
          active={editorState.isAlignRight}
          disabled={commandDisabled}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        />
      </ToolbarGroup>

      {/* =====================================================
          LINKS / IMAGE
      ====================================================== */}

      <ToolbarGroup>
        {enableLinks && (
          <ToolbarButton
            label="↗"
            title={editorState.isLink ? "Edit or remove link" : "Add link"}
            active={editorState.isLink}
            disabled={commandDisabled}
            onClick={onOpenLinkDialog}
          />
        )}

        {enableImageUpload && (
          <>
            <ToolbarButton
              label={isUploadingImage ? "…" : "▧"}
              title={isUploadingImage ? "Uploading image" : "Upload image"}
              disabled={commandDisabled}
              onClick={() => fileInputRef.current?.click()}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="rte-visually-hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  onImageButtonClick(file);
                }

                /*
                 * Reset the input so selecting the
                 * same image again triggers onChange.
                 */
                event.target.value = "";
              }}
            />
          </>
        )}
      </ToolbarGroup>

      {/* =====================================================
          HISTORY / CLEAR
      ====================================================== */}

      <ToolbarGroup>
        <ToolbarButton
          label="↶"
          title="Undo"
          disabled={commandDisabled || !editorState.canUndo}
          onClick={() => editor.chain().focus().undo().run()}
        />

        <ToolbarButton
          label="↷"
          title="Redo"
          disabled={commandDisabled || !editorState.canRedo}
          onClick={() => editor.chain().focus().redo().run()}
        />

        <ToolbarButton
          label="×"
          title="Clear formatting"
          disabled={commandDisabled}
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
        />
      </ToolbarGroup>
    </div>
  );
}
