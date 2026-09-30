import { useState } from "react";

import { RichTextEditor } from "@/components/rich-text-editor";
import { createRichTextEditorImageUpload } from "@/components/rich-text-editor/RichTextEditor.upload";

const RichTextEditorTest = () => {
  const [content, setContent] = useState("");

  return (
    <div className="min-h-screen bg-background p-6 text-foreground">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Rich Text Editor Test</h1>

          <p className="text-muted-foreground">
            Test editor formatting and backend image upload.
          </p>
        </div>

        <RichTextEditor
          label="Content"
          value={content}
          onChange={setContent}
          onImageUpload={createRichTextEditorImageUpload("editor-images")}
          enableImageUpload
          enableLinks
          showCharacterCount
          placeholder="Write something..."
        />

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Generated HTML</h2>

          <pre className="max-h-80 overflow-auto rounded-lg border bg-muted p-4 text-sm">
            {content || "No content yet."}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditorTest;
