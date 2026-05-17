"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Frame,
  Grid,
  GripVertical,
  ImageIcon,
  Layers,
  Link as LinkIcon,
  List,
  TriangleAlert,
  Type,
} from "lucide-react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import MarkdownEditor from "@/components/site/MarkdownEditor";
import type { GridMode, LandingBlock } from "@/lib/types";
import { SortableItem } from "./_dnd/SortableItem";

type TopSection = {
  mode?: "header" | "hero";
  header_style?: "small" | "large-square" | "large-circle";
};

export default function LandingEditor({
  initialBlocks,
  initialTopSection,
  onBlocksChange,
  onTopSectionChange,
}: {
  initialBlocks: LandingBlock[];
  initialTopSection?: TopSection;
  onBlocksChange: (blocks: LandingBlock[]) => void;
  onTopSectionChange: (topSection: TopSection) => void;
}) {
  const [blocks, setBlocks] = useState<LandingBlock[]>(initialBlocks ?? []);
  const [topSection, setTopSection] = useState<TopSection>(
    initialTopSection ?? { mode: "header", header_style: "small" }
  );

  useEffect(() => setBlocks(initialBlocks ?? []), [initialBlocks]);
  useEffect(() => {
    if (initialTopSection) setTopSection(initialTopSection);
  }, [initialTopSection]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function onChangeBlocks(next: LandingBlock[]) {
    setBlocks(next);
    onBlocksChange(next);
  }

  function onChangeTopSection(patch: Partial<TopSection>) {
    const next = { ...(topSection ?? {}), ...patch };
    setTopSection(next);
    onTopSectionChange(next);
  }

  function onDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((_, i) => `b-${i}` === active.id);
    const newIndex = blocks.findIndex((_, i) => `b-${i}` === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onChangeBlocks(arrayMove(blocks, oldIndex, newIndex));
  }

  function addBlock(block: LandingBlock) {
    onChangeBlocks([...blocks, block]);
  }

  function removeAt(index: number) {
    onChangeBlocks(blocks.filter((_, idx) => idx !== index));
  }

  function toggleAt(index: number) {
    onChangeBlocks(
      blocks.map((block, idx) =>
        idx === index ? ({ ...block, _hidden: !(block as any)._hidden } as LandingBlock) : block
      )
    );
  }

  function updateAt(index: number, patch: Partial<LandingBlock>) {
    onChangeBlocks(
      blocks.map((block, idx) => (idx === index ? ({ ...block, ...patch } as LandingBlock) : block))
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-sm font-medium text-neutral-800">
          <Layers className="h-4 w-4" /> Landing Builder
        </h2>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
          Draft mode
        </span>
      </div>

      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-medium text-neutral-800">Top of Page</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChangeTopSection({ mode: "header" })}
            className={`rounded-xl border px-3 py-2 text-sm ${
              (topSection?.mode ?? "header") !== "hero" ? "border-neutral-900" : "border-black/10"
            }`}
          >
            Header
          </button>
          <button
            type="button"
            onClick={() => onChangeTopSection({ mode: "hero" })}
            className={`rounded-xl border px-3 py-2 text-sm ${
              (topSection?.mode ?? "header") === "hero" ? "border-neutral-900" : "border-black/10"
            }`}
          >
            Hero
          </button>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {[
            { value: "small", label: "Small avatar" },
            { value: "large-square", label: "Large square" },
            { value: "large-circle", label: "Large circle" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChangeTopSection({ header_style: option.value as TopSection["header_style"] })}
              className={`rounded-xl border px-3 py-2 text-left text-sm ${
                (topSection?.header_style ?? "small") === option.value
                  ? "border-neutral-900"
                  : "border-black/10"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-medium text-neutral-800">Add section</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <AddTile icon={Frame} label="Hero" onClick={() => addBlock({ type: "hero", show_avatar: true, show_socials: true, show_ctas: true })} />
          <AddTile icon={ImageIcon} label="Collections grid" onClick={() => addBlock({ type: "categories_wall", view: "grid", columns: 3 })} />
          <AddTile icon={List} label="Collections list" onClick={() => addBlock({ type: "categories_wall", view: "list" })} />
          <AddTile icon={LinkIcon} label="Collections links" onClick={() => addBlock({ type: "categories_wall", view: "links" })} />
          <AddTile icon={Grid} label="Products grid" onClick={() => addBlock({ type: "products", source: "all", view: "grid_3", show_price: true })} />
          <AddTile icon={Type} label="Text" onClick={() => addBlock({ type: "text", content_md: "Your text...", align: "start" })} />
        </div>
      </section>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={blocks.map((_, i) => `b-${i}`)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {blocks.map((block, index) => (
              <SortableItem key={`b-${index}`} id={`b-${index}`}>
                <BlockCard
                  block={block as any}
                  onChange={(patch) => updateAt(index, patch)}
                  onRemove={() => removeAt(index)}
                  onToggle={() => toggleAt(index)}
                />
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function AddTile({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function Row({ label, children }: React.PropsWithChildren<{ label: string }>) {
  return (
    <label className="block text-sm">
      <span className="text-neutral-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`inline-flex h-6 w-11 items-center rounded-full border px-0.5 transition ${
        checked ? "border-neutral-900 bg-neutral-900" : "border-black/10 bg-white"
      }`}
    >
      <span className={`h-5 w-5 rounded-full bg-white shadow transition ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

function BlockCard({
  block,
  onChange,
  onRemove,
  onToggle,
}: {
  block: LandingBlock & { _hidden?: boolean };
  onChange: (patch: Partial<LandingBlock>) => void;
  onRemove: () => void;
  onToggle: () => void;
}) {
  const [open, setOpen] = useState(true);
  const hidden = !!block._hidden;

  const Icon = useMemo(() => {
    switch (block.type) {
      case "hero":
        return Frame;
      case "categories_wall":
        return ImageIcon;
      case "products":
        return Grid;
      case "text":
        return Type;
      default:
        return Layers;
    }
  }, [block.type]);

  return (
    <div className={`rounded-2xl border border-black/10 bg-white shadow-sm ${hidden ? "opacity-70" : ""}`}>
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <GripVertical className="h-4 w-4 text-neutral-400" />
          <Icon className="h-4 w-4" />
          <span>
            {block.type === "hero" && "Hero"}
            {block.type === "categories_wall" && "Collections"}
            {block.type === "products" && "Products"}
            {block.type === "text" && "Text"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onToggle} className="rounded-xl border border-black/10 bg-white p-2 hover:bg-neutral-50">
            {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button type="button" onClick={() => setOpen((value) => !value)} className="rounded-xl border border-black/10 bg-white p-2 hover:bg-neutral-50">
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button type="button" onClick={onRemove} className="rounded-xl border border-black/10 bg-white p-2 hover:bg-neutral-50">
            <TriangleAlert className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </div>

      {open ? (
        <div className="grid gap-3 border-t border-black/10 p-3 sm:grid-cols-2">
          {block.type === "hero" ? (
            <>
              <Row label="Dense">
                <Switch checked={(block as any).dense ?? false} onChange={(value) => onChange({ dense: value } as any)} />
              </Row>
              <Row label="Show avatar">
                <Switch checked={(block as any).show_avatar ?? true} onChange={(value) => onChange({ show_avatar: value } as any)} />
              </Row>
              <Row label="Show socials">
                <Switch checked={(block as any).show_socials ?? true} onChange={(value) => onChange({ show_socials: value } as any)} />
              </Row>
              <Row label="Show CTAs">
                <Switch checked={(block as any).show_ctas ?? true} onChange={(value) => onChange({ show_ctas: value } as any)} />
              </Row>
            </>
          ) : null}

          {block.type === "categories_wall" ? (
            <>
              <Row label="View">
                <select className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" value={(block as any).view ?? "grid"} onChange={(event) => onChange({ view: event.target.value as GridMode } as any)}>
                  <option value="grid">grid</option>
                  <option value="list">list</option>
                  <option value="links">links</option>
                </select>
              </Row>
              {(block as any).view !== "grid" ? null : (
                <Row label="Columns">
                  <select className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" value={(block as any).columns ?? 3} onChange={(event) => onChange({ columns: Number(event.target.value) as any } as any)}>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </Row>
              )}
            </>
          ) : null}

          {block.type === "products" ? (
            <>
              <Row label="View">
                <select className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" value={(block as any).view ?? "grid_3"} onChange={(event) => onChange({ view: event.target.value as GridMode } as any)}>
                  <option value="grid">grid</option>
                  <option value="grid_1">grid_1</option>
                  <option value="grid_2">grid_2</option>
                  <option value="grid_3">grid_3</option>
                  <option value="list">list</option>
                  <option value="links">links</option>
                </select>
              </Row>
              <Row label="Show price">
                <Switch checked={(block as any).show_price ?? false} onChange={(value) => onChange({ show_price: value } as any)} />
              </Row>
              <Row label="Show collection navbar">
                <Switch checked={(block as any).show_category_nav ?? false} onChange={(value) => onChange({ show_category_nav: value } as any)} />
              </Row>
              <Row label="Limit">
                <input type="number" min={1} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" value={(block as any).limit ?? ""} onChange={(event) => onChange({ limit: event.target.value ? Number(event.target.value) : undefined } as any)} />
              </Row>
            </>
          ) : null}

          {block.type === "text" ? (
            <>
              <div className="sm:col-span-2">
                <MarkdownEditor
                  label="Text"
                  value={block.content_md ?? ""}
                  onChange={(content_md) => onChange({ content_md })}
                  placeholder="Text"
                  rows={4}
                />
              </div>
              <Row label="Align">
                <select className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" value={(block as any).align ?? "start"} onChange={(event) => onChange({ align: event.target.value as any } as any)}>
                  <option value="start">Start</option>
                  <option value="center">Center</option>
                </select>
              </Row>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
