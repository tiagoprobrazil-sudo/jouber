import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import { useEffect, useState } from "react";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Heading2,
  Heading3,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex h-8 w-8 items-center justify-center border border-admin-border text-admin-ink transition-colors hover:bg-admin-border-soft",
        active && "bg-charcoal text-ivory hover:bg-charcoal",
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      ImageExtension.configure({ HTMLAttributes: { class: "rounded-none" } }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keep editor content in sync if the value is replaced externally
  // (e.g. loading a different post into the form).
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) return null;

  function setLink() {
    const url = window.prompt("Link URL");
    if (url) editor!.chain().focus().setLink({ href: url }).run();
  }

  return (
    <div className="border border-admin-border bg-admin-surface">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-admin-border p-2">
        <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <BoldIcon size={14} strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <ItalicIcon size={14} strokeWidth={2} />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={15} strokeWidth={1.75} />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={15} strokeWidth={1.75} />
        </ToolbarButton>
        <ToolbarButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={14} strokeWidth={1.75} />
        </ToolbarButton>
        <ToolbarButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={14} strokeWidth={1.75} />
        </ToolbarButton>
        <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}>
          <LinkIcon size={14} strokeWidth={1.75} />
        </ToolbarButton>
        <ToolbarButton label="Insert image" onClick={() => setMediaPickerOpen(true)}>
          <ImageIcon size={14} strokeWidth={1.75} />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className="journal-prose max-w-none px-5 py-5 [&_.ProseMirror]:min-h-[260px] [&_.ProseMirror]:outline-none" />

      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(url) => {
          editor.chain().focus().setImage({ src: url }).run();
          setMediaPickerOpen(false);
        }}
      />
    </div>
  );
}
