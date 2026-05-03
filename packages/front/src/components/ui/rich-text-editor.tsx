"use client";

import { forwardRef, useImperativeHandle, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { Extension } from "@tiptap/core";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";

const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => el.style.fontSize || null,
            renderHTML: (attrs) =>
              attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }: { chain: () => any }) =>
          chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }: { chain: () => any }) =>
          chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run(),
    } as any;
  },
});
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Table as TableIcon,
  RowsIcon,
  Columns3,
  Trash2,
  ChevronDown,
  Pilcrow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export interface RichTextEditorHandle {
  insertContent: (text: string) => void;
}

interface RichTextEditorProps {
  value: string;
  onChange?: (html: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 rounded text-sm hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
        active && "bg-accent text-accent-foreground"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-0.5 self-center" />;
}

export const RichTextEditor = forwardRef<
  RichTextEditorHandle,
  RichTextEditorProps
>(({ value, onChange, className, placeholder, readOnly = false }, ref) => {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !readOnly,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      FontSize,
      Color,
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({
        placeholder: placeholder ?? "Escribí el mensaje aquí...",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] p-3 focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_s]:line-through [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_p]:mb-1 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_th]:bg-gray-100 [&_th]:font-semibold",
      },
    },
  });

  useEffect(() => {
    if (editor && !editor.isFocused) {
      const currentHTML = editor.getHTML();
      if (value !== currentHTML) {
        editor.commands.setContent(value || "", false);
      }
    }
  }, [value, editor]);

  useImperativeHandle(ref, () => ({
    insertContent: (text: string) => {
      editor?.chain().focus().insertContent(text).run();
    },
  }));

  if (!editor) return null;

  const FONT_SIZES = ["11", "12", "13", "14", "16", "18", "20", "24"];
  const currentFontSize =
    editor.getAttributes("textStyle").fontSize?.replace("px", "") ?? "13";

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      {/* Barra de herramientas */}
      {!readOnly && (
        <div className="flex items-center gap-0.5 p-1.5 border-b bg-muted/40 flex-wrap">
          {/* Párrafo / Encabezados */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-accent transition-colors"
              >
                {editor.isActive("heading", { level: 1 }) && (
                  <Heading1 className="h-3.5 w-3.5" />
                )}
                {editor.isActive("heading", { level: 2 }) && (
                  <Heading2 className="h-3.5 w-3.5" />
                )}
                {editor.isActive("heading", { level: 3 }) && (
                  <Heading3 className="h-3.5 w-3.5" />
                )}
                {!editor.isActive("heading") && (
                  <Pilcrow className="h-3.5 w-3.5" />
                )}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[140px]">
              <DropdownMenuItem
                onClick={() => editor.chain().focus().setParagraph().run()}
              >
                <Pilcrow className="h-4 w-4 mr-2" /> Párrafo
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
              >
                <Heading1 className="h-4 w-4 mr-2" /> Título 1
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
              >
                <Heading2 className="h-4 w-4 mr-2" /> Título 2
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
              >
                <Heading3 className="h-4 w-4 mr-2" /> Título 3
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Tamaño de fuente */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-accent transition-colors w-14"
              >
                <span>{currentFontSize}px</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[80px]">
              {FONT_SIZES.map((size) => (
                <DropdownMenuItem
                  key={size}
                  onClick={() =>
                    editor.chain().focus().setFontSize(`${size}px`).run()
                  }
                  className={cn(currentFontSize === size && "bg-accent")}
                >
                  {size}px
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Divider />

          {/* Formato básico */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Negrita"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Cursiva"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Subrayado"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            title="Tachado"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>

          {/* Color de texto */}
          <label
            title="Color de texto"
            className="p-1.5 rounded hover:bg-accent transition-colors cursor-pointer relative"
          >
            <span
              className="text-xs font-bold"
              style={{
                color: editor.getAttributes("textStyle").color ?? "#000",
              }}
            >
              A
            </span>
            <input
              type="color"
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              value={editor.getAttributes("textStyle").color ?? "#000000"}
              onChange={(e) =>
                editor.chain().focus().setColor(e.target.value).run()
              }
            />
          </label>

          <Divider />

          {/* Alineación */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            title="Alinear izquierda"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            title="Centrar"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
            title="Alinear derecha"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* Listas */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Lista con viñetas"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Lista numerada"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>

          <Divider />

          {/* Tabla */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 px-1.5 py-1 rounded text-xs hover:bg-accent transition-colors"
                title="Tabla"
              >
                <TableIcon className="h-4 w-4" />
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[180px]">
              <DropdownMenuItem
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run()
                }
              >
                <TableIcon className="h-4 w-4 mr-2" /> Insertar tabla 3×3
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addRowAfter().run()}
                disabled={!editor.can().addRowAfter()}
              >
                <RowsIcon className="h-4 w-4 mr-2" /> Agregar fila abajo
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addRowBefore().run()}
                disabled={!editor.can().addRowBefore()}
              >
                <RowsIcon className="h-4 w-4 mr-2" /> Agregar fila arriba
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteRow().run()}
                disabled={!editor.can().deleteRow()}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Eliminar fila
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                disabled={!editor.can().addColumnAfter()}
              >
                <Columns3 className="h-4 w-4 mr-2" /> Agregar columna derecha
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                disabled={!editor.can().addColumnBefore()}
              >
                <Columns3 className="h-4 w-4 mr-2" /> Agregar columna izquierda
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteColumn().run()}
                disabled={!editor.can().deleteColumn()}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Eliminar columna
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => editor.chain().focus().deleteTable().run()}
                disabled={!editor.can().deleteTable()}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Eliminar tabla
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Área de edición */}
      <EditorContent editor={editor} />
    </div>
  );
});

RichTextEditor.displayName = "RichTextEditor";
