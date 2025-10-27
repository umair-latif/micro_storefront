"use client";

import React, { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  GripVertical, Eye, EyeOff, ChevronDown, ChevronUp, Layers,
  ImageIcon, Frame, Grid, List, Link as LinkIcon, Hash, Type, Wand2, Loader2, CheckCircle2, TriangleAlert
} from "lucide-react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy
} from "@dnd-kit/sortable";

import type { LandingBlock, GridMode } from "@/lib/types";
import { updateLandingBlocks, /* NEW: */ updateTopSection } from "../actions"; // ← add updateTopSection on server
import { SortableItem } from "./_dnd/SortableItem";
import MarkdownEditor from "@/components/site/MarkdownEditor";


// ---------- curated presets (one-click) ----------
export const LANDING_PRESETS: Array<{ id: string; name: string; blocks: LandingBlock[] }> = [
  {
    id: "business-card",
    name: "Business Card",
    blocks: [
      { type: "hero", show_avatar: true, show_socials: true, show_ctas: true },
    ],
  },
  {
    id: "catalog",
    name: "Catalog",
    blocks: [
      { type: "hero", dense: true, show_ctas: true },
      { type: "products", source: "all", view: "grid_3", show_price: true },
    ],
  },
  {
    id: "story-highlights",
    name: "Story + Highlights",
    blocks: [
      { type: "hero", show_avatar: true, show_socials: true },
      { type: "text", content_md: "### Featured Collections", align: "start" },
      { type: "categories_wall", columns: 3, limit: 6 },
      { type: "products", source: "all", view: "links", limit: 8, cta: "product" },
    ],
  },
];

// Local type for top-of-page config (mirrors cfg.top_section)
type TopSection = {
  mode?: "header" | "hero";
  header_style?: "small" | "large-square" | "large-circle";
};

// ---------- tiny debounce ----------
function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, ms: number) {
  const ref = useRef<number | null>(null);
  return (...args: Parameters<T>) => {
    if (ref.current) window.clearTimeout(ref.current);
    ref.current = window.setTimeout(() => fn(...args), ms);
  };
}

// ---------- main editor ----------
export default function LandingEditor({
  profileId,
  initialBlocks,
  initialTopSection, // ← NEW
}: {
  profileId: string;
  initialBlocks: LandingBlock[];
  initialTopSection?: TopSection;
}) {
  const [blocks, setBlocks] = useState<LandingBlock[]>(initialBlocks ?? []);
  const [topSection, setTopSection] = useState<TopSection>(initialTopSection ?? { mode: "header", header_style: "small" });

  const [saving, startSaving] = useTransition();
  const [savedTick, setSavedTick] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // persist (debounced) when blocks change
  const persistBlocks = useDebouncedCallback((next: LandingBlock[]) => {
    startSaving(async () => {
      setError(null);
      const res = await updateLandingBlocks(profileId, next);
     if (!res.ok) {
        setError('error' in res ? res.error : 'Failed to save landing blocks.');
        return;
      }
      setSavedTick(Date.now());
    });
  }, 400);

  // NEW: persist (debounced) top section
  const persistTop = useDebouncedCallback((next: TopSection) => {
    startSaving(async () => {
      setError(null);
      // server action expects: { mode?: "header"|"hero", header_style?: "small"|"large-square"|"large-circle" }
      const res = await updateTopSection(profileId, next);
      if (!res.ok) {
        setError('error' in res ? res.error : 'Failed to save top section.');
        return;
      }
      setSavedTick(Date.now());
    });
  }, 400);

  useEffect(() => { if (initialBlocks) setBlocks(initialBlocks); }, [initialBlocks]);
  useEffect(() => { if (initialTopSection) setTopSection(initialTopSection); }, [initialTopSection]);

  function onChangeBlocks(next: LandingBlock[]) {
    setBlocks(next);   // optimistic
    persistBlocks(next);     // debounced save
  }

  function onChangeTopSection(patch: Partial<TopSection>) {
    const next = { ...(topSection ?? {}), ...patch };
    setTopSection(next);     // optimistic
    persistTop(next);        // debounced save
  }

  // dnd sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((_, i) => `b-${i}` === active.id);
    const newIndex = blocks.findIndex((_, i) => `b-${i}` === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onChangeBlocks(arrayMove(blocks, oldIndex, newIndex));
  }

  // basic mutators
  function addBlock(b: LandingBlock) { onChangeBlocks([...blocks, b]); }
  function removeAt(i: number) { onChangeBlocks(blocks.filter((_, idx) => idx !== i)); }
  function toggleAt(i: number) {
    const next = blocks.map((b, idx) => idx === i ? ({ ...b, _hidden: !(b as any)._hidden } as any) : b);
    onChangeBlocks(next as LandingBlock[]);
  }
  function updateAt<T extends LandingBlock>(i: number, patch: Partial<T>) {
    const next = blocks.map((b, idx) => idx === i ? ({ ...b, ...patch } as LandingBlock) : b);
    onChangeBlocks(next);
  }

  function applyPreset(preset: LandingBlock[]) { onChangeBlocks(preset); }

  // UX saved badge timer
  useEffect(() => {
    if (!savedTick) return;
    const t = setTimeout(() => setSavedTick(0), 1000);
    return () => clearTimeout(t);
  }, [savedTick]);

  return (
    <div className="space-y-6">
      {/* header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-neutral-800 inline-flex items-center gap-2">
          <Layers className="h-4 w-4" /> Landing Builder
        </h2>
        <div className="h-5 inline-flex items-center gap-2 text-xs">
          {saving && <span className="inline-flex items-center gap-1 text-neutral-600"><Loader2 className="h-4 w-4 animate-spin" /> Saving…</span>}
          {!saving && savedTick > 0 && <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Saved</span>}
          {error && <span className="inline-flex items-center gap-1 text-amber-700"><TriangleAlert className="h-4 w-4" /> {error}</span>}
        </div>
      </div>

      {/* NEW: Top of Page settings */}
      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-medium text-neutral-800">Top of Page</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChangeTopSection({ mode: "header" })}
            className={`rounded-xl border px-3 py-2 text-sm ${ (topSection?.mode ?? "header") !== "hero" ? "border-neutral-900" : "border-black/10" }`}
          >
            Header
          </button>
          <button
            type="button"
            onClick={() => onChangeTopSection({ mode: "hero" })}
            className={`rounded-xl border px-3 py-2 text-sm ${ (topSection?.mode ?? "header") === "hero" ? "border-neutral-900" : "border-black/10" }`}
          >
            Hero (full page)
          </button>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {[
            { v: "small", label: "Small avatar" },
            { v: "large-square", label: "Large (square)" },
            { v: "large-circle", label: "Large (circle)" },
          ].map(opt => (
            <button
              key={opt.v}
              type="button"
              onClick={() => onChangeTopSection({ header_style: opt.v as any })}
              className={`rounded-xl border px-3 py-2 text-sm text-left ${ (topSection?.header_style ?? "small") === opt.v ? "border-neutral-900" : "border-black/10" }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <p className="mt-2 text-xs text-neutral-500">
          Choose whether to show a compact header or a full-bleed hero, and pick the avatar style.
        </p>
      </section>

      {/* presets */}
      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-medium text-neutral-800">Presets</div>
        <div className="flex flex-wrap gap-2">
          {LANDING_PRESETS.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.blocks)}
              className="rounded-xl border border-black/10 px-3 py-2 text-sm transition hover:bg-neutral-50"
              title={p.name}
            >
              <Wand2 className="mr-2 inline h-4 w-4" /> {p.name}
            </button>
          ))}
        </div>
      </section>

      {/* add block palette */}
      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-medium text-neutral-800">Add block</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <AddTile icon={Frame} label="Hero" onClick={() => addBlock({ type: "hero", show_avatar: true, show_socials: true, show_ctas: true })} />
          <AddTile icon={ImageIcon} label="Categories Wall (grid)" onClick={() => addBlock({ type: "categories_wall", view: "grid", columns: 3 })} />
          <AddTile icon={List} label="Categories Wall (list)" onClick={() => addBlock({ type: "categories_wall", view: "list" })} />
          <AddTile icon={LinkIcon} label="Categories Wall (links)" onClick={() => addBlock({ type: "categories_wall", view: "links" })} />
          <AddTile icon={Grid} label="Products (grid)" onClick={() => addBlock({ type: "products", source: "all", view: "grid_3", show_price: true })} />
          <AddTile icon={List} label="Products (list)" onClick={() => addBlock({ type: "products", source: "all", view: "list" })} />
          <AddTile icon={LinkIcon} label="Products (links)" onClick={() => addBlock({ type: "products", source: "all", view: "links" })} />
          <AddTile icon={Type} label="Text" onClick={() => addBlock({ type: "text", content_md: "Your text…", align: "start" })} />
        </div>
      </section>

      {/* sortable list of blocks */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={blocks.map((_, i) => `b-${i}`)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {blocks.map((b, i) => (
              <SortableItem key={`b-${i}`} id={`b-${i}`}>
                <BlockCard
                  index={i}
                  block={b as any}
                  onRemove={() => removeAt(i)}
                  onToggle={() => toggleAt(i)}
                  onChange={(patch) => updateAt(i, patch)}
                />
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// ------------- atoms & editors -------------
function AddTile({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm hover:bg-neutral-50">
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

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`inline-flex h-6 w-11 items-center rounded-full border px-0.5 transition ${checked ? "bg-neutral-900 text-white border-neutral-900" : "bg-white border-black/10"}`}
    >
      <span className={`h-5 w-5 rounded-full bg-white shadow transition ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

function BlockCard({
  index,
  block,
  onRemove,
  onToggle,
  onChange,
}: {
  index: number;
  block: LandingBlock & { _hidden?: boolean };
  onRemove: () => void;
  onToggle: () => void;
  onChange: (patch: Partial<LandingBlock>) => void;
}) {
  const [open, setOpen] = useState(true);
  const hidden = !!block._hidden;

  const Icon = useMemo(() => {
    switch (block.type) {
      case "hero": return Frame;
      case "categories_wall": return ImageIcon;
      case "products": return Grid;
      case "text": return Type;
      default: return Layers;
    }
  }, [block.type]);

  return (
    <div className={`rounded-2xl border bg-white shadow-sm ${hidden ? "opacity-70" : ""} border-black/10`}>
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <GripVertical className="h-4 w-4 text-neutral-400" />
          <Icon className="h-4 w-4" />
          <span>
            {block.type === "hero" && "Hero"}
            {block.type === "categories_wall" && "Category cover wall"}
            {block.type === "products" && "Products"}
            {block.type === "text" && "Text"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onToggle} className="rounded-xl border border-black/10 bg-white p-2 hover:bg-neutral-50" title={hidden ? "Show block" : "Hide block"}>
            {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button onClick={() => setOpen(v => !v)} className="rounded-xl border border-black/10 bg-white p-2 hover:bg-neutral-50" title={open ? "Collapse" : "Expand"}>
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button onClick={onRemove} className="rounded-xl border border-black/10 bg-white p-2 hover:bg-neutral-50" title="Remove">
            <TriangleAlert className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </div>

      {open && (
        <div className="grid gap-3 border-t border-black/10 p-3 sm:grid-cols-2">
          {block.type === "hero" && (
            <>
              <Row label="Dense">
                <Switch checked={(block as any).dense ?? false} onChange={(v) => onChange({ dense: v } as any)} />
              </Row>
              <Row label="Show avatar">
                <Switch checked={(block as any).show_avatar ?? true} onChange={(v) => onChange({ show_avatar: v } as any)} />
              </Row>
              <Row label="Show socials">
                <Switch checked={(block as any).show_socials ?? true} onChange={(v) => onChange({ show_socials: v } as any)} />
              </Row>
              <Row label="Show CTAs">
                <Switch checked={(block as any).show_ctas ?? true} onChange={(v) => onChange({ show_ctas: v } as any)} />
              </Row>
            </>
          )}

          {block.type === "categories_wall" && (
            <>
              <Row label="View">
                <select
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                  value={(block as any).view ?? "grid"}
                  onChange={(e) => onChange({ view: e.target.value as GridMode } as any)}
                >
                  <option value="grid">grid</option>
                  <option value="list">list</option>
                  <option value="links">links</option>
                </select>
              </Row>
              {(block as any).view !== "grid" ? null : (
                <Row label="Columns">
                  <select
                    className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                    value={(block as any).columns ?? 3}
                    onChange={(e) => onChange({ columns: Number(e.target.value) as any } as any)}
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </Row>
              )}
              <Row label="Limit (optional)">
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                  value={(block as any).limit ?? ""}
                  onChange={(e) => onChange({ limit: e.target.value ? Number(e.target.value) : undefined } as any)}
                />
              </Row>
            </>
          )}

          {block.type === "products" && (
            <>
              <Row label="Source">
                <select
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                  value={typeof (block as any).source === "string" ? "all" : "category"}
                  onChange={(e) => onChange({ source: e.target.value === "all" ? "all" : { category_id: "" } } as any)}
                >
                  <option value="all">All products</option>
                  <option value="category">Specific category</option>
                </select>
              </Row>
              {typeof (block as any).source !== "string" && (
                <Row label="Category ID">
                  <input
                    className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                    value={(block as any).source?.category_id ?? ""}
                    onChange={(e) => onChange({ source: { category_id: e.target.value } } as any)}
                  />
                </Row>
              )}
              <Row label="View">
                <select
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                  value={(block as any).view}
                  onChange={(e) => onChange({ view: e.target.value as GridMode } as any)}
                >
                  <option value="grid">grid</option>
                  <option value="grid_1">grid_1</option>
                  <option value="grid_2">grid_2</option>
                  <option value="grid_3">grid_3</option>
                  <option value="list">list</option>
                  <option value="links">links</option>
                </select>
              </Row>
              <Row label="Show price">
                <Switch checked={(block as any).show_price ?? false} onChange={(v) => onChange({ show_price: v } as any)} />
              </Row>
              <Row label="Show caption">
                <Switch checked={(block as any).show_caption ?? false} onChange={(v) => onChange({ show_caption: v } as any)} />
              </Row>
              <Row label="Limit (optional)">
                <input
                  type="number"
                  min={1}
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                  value={(block as any).limit ?? ""}
                  onChange={(e) => onChange({ limit: e.target.value ? Number(e.target.value) : undefined } as any)}
                />
              </Row>
              <Row label="CTA">
                <select
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                  value={(block as any).cta ?? "product"}
                  onChange={(e) => onChange({ cta: e.target.value as any } as any)}
                >
                  <option value="product">Product page / Link</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="none">None</option>
                </select>
              </Row>
              <Row label="Show category navbar above products">
                <Switch
                  checked={(block as any).show_category_nav ?? false}
                  onChange={(v) => onChange({ show_category_nav: v } as any)}
                />
              </Row>
              {(block as any).show_category_nav && (
                <Row label="Navbar style">
                  <select
                    className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                    value={(block as any).category_nav_style ?? "auto"}
                    onChange={(e) => onChange({ category_nav_style: e.target.value as any } as any)}
                  >
                    <option value="auto">Auto (from theme)</option>
                    <option value="chips">Chips</option>
                    <option value="pills">Pills</option>
                    <option value="square">Square buttons</option>
                    <option value="cards">Cards</option>
                  </select>
                </Row>
              )}
            </>
          )}

          {block.type === "text" && (
            <>
              <Row label="Content (Markdown)">
              <div className="sm:col-span-2">
                <MarkdownEditor
                  label="Text"
                  value={block.content_md ?? ""}
                  onChange={(md) => onChange({ content_md: md })}                  
                  placeholder="Text"
                  rows={4}
                />
              </div>
              </Row>
              <Row label="Align">
                <select
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                  value={(block as any).align ?? "start"}
                  onChange={(e) => onChange({ align: e.target.value as any } as any)}
                >
                  <option value="start">Start</option>
                  <option value="center">Center</option>
                </select>
              </Row>
            </>
          )}
        </div>
      )}
    </div>
  );
}
