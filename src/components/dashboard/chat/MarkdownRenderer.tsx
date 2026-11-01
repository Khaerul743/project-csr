"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
  isTyping?: boolean;
}

export function MarkdownRenderer({ content, isTyping }: MarkdownRendererProps) {
  // Helper to render inline markdown: **bold**, *italic*, `code`
  const renderInline = (text: string): React.ReactNode[] => {
    // Regex matches **bold**, *italic*, and `code`
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (!part) return null;

      // Bold: **text**
      if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
        return (
          <strong key={index} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Italic: *text*
      if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
        return (
          <em key={index} className="italic text-slate-700">
            {part.slice(1, -1)}
          </em>
        );
      }

      // Inline code: `code`
      if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded-md bg-slate-100 text-emerald-800 text-[12px] font-mono font-semibold border border-slate-200/80"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      // If trailing partial bold during typing (e.g. "**text" without closing)
      if (part.startsWith("**")) {
        return (
          <strong key={index} className="font-bold text-slate-900">
            {part.slice(2)}
          </strong>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 text-sm text-slate-800 leading-relaxed select-text">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // 1. Empty lines
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // 2. Headings: ###
        if (line.startsWith("### ")) {
          return (
            <h4
              key={idx}
              className="text-sm font-extrabold text-[#181343] mt-3.5 mb-1 flex items-center gap-1.5"
            >
              {renderInline(line.slice(4))}
            </h4>
          );
        }

        // Headings: ##
        if (line.startsWith("## ")) {
          return (
            <h3
              key={idx}
              className="text-base font-extrabold text-[#181343] mt-4 mb-1.5 border-b border-slate-100 pb-1"
            >
              {renderInline(line.slice(3))}
            </h3>
          );
        }

        // Headings: #
        if (line.startsWith("# ")) {
          return (
            <h2 key={idx} className="text-lg font-black text-[#181343] mt-4 mb-2">
              {renderInline(line.slice(2))}
            </h2>
          );
        }

        // 3. Tip / Callout / Highlight box (starts with 💡, 📌, ⚠️, 🚀)
        if (
          trimmed.startsWith("💡") ||
          trimmed.startsWith("📌") ||
          trimmed.startsWith("⚠️") ||
          trimmed.startsWith("🚀")
        ) {
          return (
            <div
              key={idx}
              className="my-2 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-950 text-xs font-medium leading-relaxed flex items-start gap-2 shadow-xs"
            >
              <div className="flex-1">{renderInline(trimmed)}</div>
            </div>
          );
        }

        // 4. Numbered list item: e.g. "1. **Program Pemberdayaan**"
        const numberedMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5 my-1.5 pl-0.5">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200/50">
                {numberedMatch[1]}
              </span>
              <div className="flex-1 text-slate-800 font-medium">
                {renderInline(numberedMatch[2])}
              </div>
            </div>
          );
        }

        // 5. Indented sub-bullet item: e.g. "   - **Fokus Area**: Lingkungan"
        const indentedBulletMatch = line.match(/^(\s{2,}|\t+)[-*•]\s+(.*)$/);
        if (indentedBulletMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 my-1 pl-6 text-[13px] text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
              <div className="flex-1 leading-relaxed">
                {renderInline(indentedBulletMatch[2])}
              </div>
            </div>
          );
        }

        // 6. Root bullet item: e.g. "- Fokus Area: Lingkungan" or "• Item"
        const rootBulletMatch = line.match(/^[-*•]\s+(.*)$/);
        if (rootBulletMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5 my-1.5 pl-1.5 text-slate-800">
              <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-2" />
              <div className="flex-1 leading-relaxed">
                {renderInline(rootBulletMatch[1])}
              </div>
            </div>
          );
        }

        // 7. Regular paragraph text
        return (
          <p key={idx} className="leading-relaxed text-slate-800">
            {renderInline(line)}
          </p>
        );
      })}

      {/* Blinking Typing Cursor */}
      {isTyping && (
        <span
          className="inline-block w-1.5 h-4 ml-1 bg-emerald-600 rounded-xs animate-pulse align-middle"
          title="Mengetik..."
        />
      )}
    </div>
  );
}
