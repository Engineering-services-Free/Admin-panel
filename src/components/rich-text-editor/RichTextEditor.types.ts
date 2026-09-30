import type { Editor } from "@tiptap/react";

export type RichTextEditorImageUploadResult = {
  /**
   * Firebase Storage URL returned by the backend.
   */
  url: string;

  /**
   * Accessible image description saved to Tiptap's <img alt="..."> attribute.
   */
  alt: string;
};

export type RichTextEditorProps = {
  /**
   * Controlled HTML value.
   *
   * Example:
   * "<p>Welcome to <strong>our platform</strong>.</p>"
   */
  value?: string;

  /**
   * Debounced HTML updates from the editor.
   */
  onChange?: (html: string) => void;

  /**
   * Called immediately after every editor transaction that changes content.
   * Use this only for UI state such as "Unsaved changes".
   */
  onImmediateChange?: (html: string) => void;

  /**
   * Uploads an image through the backend API and returns
   * the Firebase Storage URL and accessible alt text.
   */
  onImageUpload?: (file: File) => Promise<RichTextEditorImageUploadResult>;

  /**
   * Called when the editor receives focus.
   */
  onFocus?: () => void;

  /**
   * Called when the editor loses focus.
   */
  onBlur?: () => void;

  placeholder?: string;
  label?: string;
  helperText?: string;
  error?: string;

  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;

  /**
   * Image button is displayed only when this is true
   * and `onImageUpload` has been supplied.
   */
  enableImageUpload?: boolean;

  enableLinks?: boolean;
  showCharacterCount?: boolean;

  /**
   * Soft visual limit. It does not prevent more typing.
   */
  characterLimit?: number;

  /**
   * Delay before calling onChange.
   */
  debounceMs?: number;

  minHeight?: number;
  maxHeight?: number;

  id?: string;
  className?: string;
  contentClassName?: string;
};

export type RichTextEditorToolbarProps = {
  editor: Editor;
  disabled: boolean;
  enableImageUpload: boolean;
  enableLinks: boolean;
  isUploadingImage: boolean;

  /**
   * Receives the selected browser File from the hidden input.
   */
  onImageButtonClick: (file: File) => void;

  onOpenLinkDialog: () => void;
};
