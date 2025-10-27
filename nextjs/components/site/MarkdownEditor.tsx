"use client";

import { useRef } from "react";

type MarkdownEditorProps = {
  label?: string;
  value: string; // markdown string
  onChange: (md: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
};

export default function MarkdownEditor({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 4,
  className = "",
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insert(before: string, after: string = "") {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const cur = value || "";
    const selected = cur.slice(start, end);
    const next = cur.slice(0, start) + before + selected + after + cur.slice(end);
    onChange(next);

    // restore cursor
    requestAnimationFrame(() => {
      const pos = start + before.length + selected.length + after.length;
      textarea.setSelectionRange(pos, pos);
      textarea.focus();
    });
  }

  function addBold() {
    insert("**", "**");
  }

  function addItalic() {
    insert("_", "_");
  }

  function addList() {
    insert("- ");
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label ? <div className="text-sm font-medium">{label}</div> : null}

      {/* toolbar */}
      <div className="flex flex-wrap gap-1 text-xs">
        <button
          type="button"
          onClick={addBold}
          className="rounded border border-black/10 bg-white px-2 py-1 font-semibold hover:bg-neutral-50"
        >
          **B**
        </button>
        <button
          type="button"
          onClick={addItalic}
          className="rounded border border-black/10 bg-white px-2 py-1 italic hover:bg-neutral-50"
        >
          _i_
        </button>
        <button
          type="button"
          onClick={addList}
          className="rounded border border-black/10 bg-white px-2 py-1 hover:bg-neutral-50"
        >
          • List
        </button>

        <span className="pl-2 text-[10px] text-neutral-400">
          Markdown supported
        </span>
      </div>

      {/* textarea only */}
      <textarea
        ref={textareaRef}
        // ADDED CLASSES: whitespace-pre-wrap and break-words
        className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm resize-y font-mono whitespace-pre-wrap break-words"
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
