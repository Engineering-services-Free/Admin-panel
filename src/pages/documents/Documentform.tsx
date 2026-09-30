import { useEffect, useState, type FormEvent } from "react";
import { FileText } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { uploadDocument } from "@/api/uploads.api";
import { useClients } from "@/hooks/services/useClients";

import type {
  Document as DocumentItem,
  DocumentFile,
  DocumentFormValues,
  DocumentType,
  DocumentVisibility,
} from "@/typings/documents.typings";

interface DocumentFormProps {
  initialValues?: Partial<DocumentItem>;
  isSubmitting: boolean;
  onSubmit: (values: DocumentFormValues) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  brochure: "Brochure",
  certificate: "Certificate",
  "company-profile": "Company Profile",
  presentation: "Presentation",
  other: "Other",
};

const MAX_FILE_MB = 10;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
const ACCEPTED_FILES = ".pdf,.doc,.docx,.ppt,.pptx";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50";

// Optional text: "" clears a value that existed before, undefined otherwise
function optionalText(value: string, hadValue: boolean) {
  const trimmed = value.trim();

  return trimmed || (hadValue ? "" : undefined);
}

// Shows the stored file name, e.g. "documents/1712-brochure.pdf" -> "1712-brochure.pdf"
function getFileName(storagePath: string) {
  return storagePath.split("/").pop() || storagePath;
}

export function DocumentForm({
  initialValues,
  isSubmitting,
  onSubmit,
  onUploadingChange,
}: DocumentFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [type, setType] = useState<DocumentType>(
    initialValues?.type ?? "brochure",
  );
  const [clientId, setClientId] = useState(initialValues?.clientId ?? "");
  const [visibility, setVisibility] = useState<DocumentVisibility>(
    initialValues?.visibility ?? "internal",
  );
  const [orderInput, setOrderInput] = useState(
    String(initialValues?.order ?? 0),
  );
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );

  // The stored file is kept in state and sent back on save
  const [file, setFile] = useState<DocumentFile | null>(
    initialValues?.file
      ? {
          url: initialValues.file.url,
          storagePath: initialValues.file.storagePath,
        }
      : null,
  );

  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const isFormDisabled = isSubmitting || isUploading;

  const clientsQuery = useClients({ page: 1, limit: 100 });
  const clients = clientsQuery.data?.data ?? [];

  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  const handleFileUpload = async (selected: File) => {
    setFileError(null);

    if (selected.size > MAX_FILE_BYTES) {
      setFileError(`File is too large. Maximum ${MAX_FILE_MB} MB.`);
      return;
    }

    setIsUploading(true);

    try {
      const uploaded = await uploadDocument(selected, "documents");

      setFile({ url: uploaded.url, storagePath: uploaded.storagePath });
    } catch (error) {
      setFileError(
        error instanceof Error ? error.message : "Failed to upload file.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isUploading) {
      return;
    }

    setFormError(null);
    setFileError(null);

    const cleanTitle = title.trim();
    const order = Number(orderInput);

    if (!cleanTitle) {
      setFormError("Please enter the document title.");
      return;
    }

    if (orderInput.trim() === "" || !Number.isInteger(order) || order < 0) {
      setFormError("Order must be a whole number, 0 or greater.");
      return;
    }

    if (!file?.url || !file.storagePath) {
      setFileError("Please upload the document file.");
      return;
    }

    onSubmit({
      title: cleanTitle,
      type,
      description: optionalText(
        description,
        Boolean(initialValues?.description),
      ),
      // null clears an existing client, undefined leaves it unset
      clientId: clientId || (initialValues?.clientId ? null : undefined),
      file: { url: file.url, storagePath: file.storagePath },
      visibility,
      order,
    });
  };

  return (
    <form id="document-form" onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{formError}</p>
        </div>
      )}

      {/* BASIC INFORMATION */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The document name, type and who can see it.
          </p>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="document-title">Title</Label>
            <Input
              id="document-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Document title"
              maxLength={200}
              required
              disabled={isFormDisabled}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="document-type">Type</Label>
            <select
              id="document-type"
              className={selectClass}
              value={type}
              onChange={(event) => setType(event.target.value as DocumentType)}
              disabled={isFormDisabled}
            >
              {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="document-client">Client</Label>
            <select
              id="document-client"
              className={selectClass}
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              disabled={isFormDisabled}
            >
              <option value="">
                {clientsQuery.isLoading ? "Loading clients..." : "No client"}
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Optional. Link this document to a client.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="document-visibility">Visibility</Label>
            <select
              id="document-visibility"
              className={selectClass}
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as DocumentVisibility)
              }
              disabled={isFormDisabled}
            >
              <option value="internal">Internal</option>
              <option value="public">Public</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Public documents can be shown on the website.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="document-order">Order</Label>
            <Input
              id="document-order"
              type="number"
              min={0}
              step={1}
              value={orderInput}
              onChange={(event) => setOrderInput(event.target.value)}
              required
              disabled={isFormDisabled}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers show first.
            </p>
          </div>
        </div>
      </section>

      {/* FILE */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">File</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The document people will open or download.
          </p>
        </div>

        <div className="grid gap-6 p-6">
          <div className="grid gap-2">
            <Label htmlFor="document-file">
              {file ? "Replace file" : "Upload file"}
            </Label>
            <Input
              id="document-file"
              type="file"
              accept={ACCEPTED_FILES}
              disabled={isFormDisabled}
              onChange={(event) => {
                const selected = event.target.files?.[0];

                if (!selected) {
                  return;
                }

                void handleFileUpload(selected);

                event.target.value = "";
              }}
            />
            <p className="text-xs text-muted-foreground">
              PDF, DOC, DOCX, PPT or PPTX. Maximum {MAX_FILE_MB} MB.
            </p>
          </div>

          {fileError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{fileError}</p>
            </div>
          )}

          {isUploading && (
            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">Uploading file...</p>
            </div>
          )}

          {file && !isUploading && (
            <div className="flex items-center gap-3 rounded-md border p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                <FileText className="size-5 text-muted-foreground" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {getFileName(file.storagePath)}
                </p>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground underline underline-offset-2"
                >
                  Open file
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* DESCRIPTION */}
      <section className="rounded-lg border">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Description</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Optional. A short note about this document.
          </p>
        </div>

        <div className="grid gap-2 p-6">
          <Textarea
            id="document-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Write a short description..."
            rows={4}
            maxLength={500}
            disabled={isFormDisabled}
          />
          <p className="text-right text-xs text-muted-foreground">
            {description.length} / 500
          </p>
        </div>
      </section>
    </form>
  );
}
