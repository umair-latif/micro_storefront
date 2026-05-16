"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, Eye, Loader2, RotateCcw, Send, Save, TriangleAlert } from "lucide-react";
import type { LandingBlock, StorefrontConfig } from "@/lib/types";
import {
  getStorefrontLandingBlocks,
  mergeStorefrontConfig,
  normalizeStorefrontConfig,
} from "@/lib/storefront-config";
import {
  publishStorefrontDraftAction,
  restorePublishedStorefrontAction,
  saveStorefrontDraftAction,
} from "../actions";
import LandingEditor from "./LandingEditor";
import StorefrontPresetEditor from "./StorefrontPresetEditor";

type TopSection = NonNullable<StorefrontConfig["top_section"]>;

function stableStringify(value: unknown) {
  return JSON.stringify(sortObject(value));
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObject);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value as Record<string, unknown>)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = sortObject((value as Record<string, unknown>)[key]);
      return acc;
    }, {});
}

function isSameConfig(a: StorefrontConfig, b: StorefrontConfig) {
  return stableStringify(normalizeStorefrontConfig(a)) === stableStringify(normalizeStorefrontConfig(b));
}

export default function StorefrontDraftBuilder({
  profileId,
  slug,
  initialDraftConfig,
  publishedConfig,
  hasStoredDraft,
  publishedAt,
  draftUpdatedAt,
}: {
  profileId: string;
  slug: string;
  initialDraftConfig: StorefrontConfig;
  publishedConfig: StorefrontConfig;
  hasStoredDraft: boolean;
  publishedAt?: string | null;
  draftUpdatedAt?: string | null;
}) {
  const [draft, setDraft] = useState<StorefrontConfig>(() => normalizeStorefrontConfig(initialDraftConfig));
  const [savedDraft, setSavedDraft] = useState<StorefrontConfig>(() => normalizeStorefrontConfig(initialDraftConfig));
  const [published, setPublished] = useState<StorefrontConfig>(() => normalizeStorefrontConfig(publishedConfig));
  const [draftExists, setDraftExists] = useState(hasStoredDraft);
  const [lastDraftSave, setLastDraftSave] = useState<string | null | undefined>(draftUpdatedAt);
  const [lastPublish, setLastPublish] = useState<string | null | undefined>(publishedAt);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const hasUnsavedDraftEdits = useMemo(() => !isSameConfig(draft, savedDraft), [draft, savedDraft]);
  const hasUnpublishedChanges = useMemo(() => !isSameConfig(draft, published), [draft, published]);
  const blocks = useMemo(() => getStorefrontLandingBlocks(draft), [draft]);
  const statusLabel = hasUnsavedDraftEdits
    ? "Unpublished changes"
    : hasUnpublishedChanges
      ? "Draft saved"
      : "Published";
  const statusClass = hasUnsavedDraftEdits
    ? "bg-amber-50 text-amber-800 border-amber-200"
    : hasUnpublishedChanges
      ? "bg-blue-50 text-blue-800 border-blue-200"
      : "bg-emerald-50 text-emerald-800 border-emerald-200";

  function updateDraft(next: StorefrontConfig) {
    setDraft(normalizeStorefrontConfig(next));
    setMessage(null);
    setError(null);
  }

  function updateBlocks(nextBlocks: LandingBlock[]) {
    updateDraft(mergeStorefrontConfig(draft, { landing_blocks: nextBlocks }));
  }

  function updateTopSection(nextTopSection: TopSection) {
    updateDraft(mergeStorefrontConfig(draft, { top_section: nextTopSection }));
  }

  function saveDraft() {
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const nextDraft = normalizeStorefrontConfig(draft);
      const result = await saveStorefrontDraftAction(profileId, nextDraft);
      if (!result.ok) {
        setError("error" in result ? result.error : "Could not save draft.");
        return;
      }
      setSavedDraft(nextDraft);
      setDraftExists(true);
      setLastDraftSave(new Date().toISOString());
      setMessage("Draft saved");
    });
  }

  function previewDraft() {
    const previewWindow = window.open("", "_blank", "noopener,noreferrer");
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const nextDraft = normalizeStorefrontConfig(draft);
      if (hasUnsavedDraftEdits || !draftExists) {
        const saveResult = await saveStorefrontDraftAction(profileId, nextDraft);
        if (!saveResult.ok) {
          if (previewWindow) previewWindow.close();
          setError("error" in saveResult ? saveResult.error : "Could not save draft preview.");
          return;
        }
        setSavedDraft(nextDraft);
        setDraftExists(true);
        setLastDraftSave(new Date().toISOString());
      }
      const previewUrl = `/admin/storefront/preview?store=${encodeURIComponent(profileId)}`;
      if (previewWindow) {
        previewWindow.location.href = previewUrl;
      } else {
        window.open(previewUrl, "_blank", "noopener,noreferrer");
      }
      setMessage("Draft preview opened");
    });
  }

  function publishDraft() {
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const nextDraft = normalizeStorefrontConfig(draft);
      let draftToPublish = nextDraft;
      if (hasUnsavedDraftEdits || !draftExists) {
        const saveResult = await saveStorefrontDraftAction(profileId, nextDraft);
        if (!saveResult.ok) {
          setError("error" in saveResult ? saveResult.error : "Could not save draft.");
          return;
        }
        setSavedDraft(nextDraft);
        setDraftExists(true);
        setLastDraftSave(new Date().toISOString());
      } else {
        draftToPublish = savedDraft;
      }

      const result = await publishStorefrontDraftAction(profileId);
      if (!result.ok) {
        setError("error" in result ? result.error : "Could not publish changes.");
        return;
      }
      setPublished(draftToPublish);
      setDraft(draftToPublish);
      setSavedDraft(draftToPublish);
      setLastPublish(new Date().toISOString());
      setMessage("Changes published");
    });
  }

  function restorePublished() {
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const result = await restorePublishedStorefrontAction(profileId);
      if (!result.ok) {
        setError("error" in result ? result.error : "Could not restore published version.");
        return;
      }
      const restored = normalizeStorefrontConfig(published);
      setDraft(restored);
      setSavedDraft(restored);
      setDraftExists(true);
      setLastDraftSave(new Date().toISOString());
      setMessage("Published version restored");
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}>
                {statusLabel}
              </span>
              {pending ? (
                <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Working...
                </span>
              ) : null}
              {message ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {message}
                </span>
              ) : null}
              {error ? (
                <span className="inline-flex items-center gap-1 text-xs text-amber-700">
                  <TriangleAlert className="h-3.5 w-3.5" /> {error}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-neutral-500">
              Edit your draft here. Visitors see the published storefront until you publish changes.
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              {lastPublish ? `Last published ${new Date(lastPublish).toLocaleString()}` : "Not published yet"}
              {lastDraftSave ? ` · Draft saved ${new Date(lastDraftSave).toLocaleString()}` : ""}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:shrink-0">
            <button
              type="button"
              onClick={previewDraft}
              disabled={pending}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Eye className="h-4 w-4" /> Preview Draft
            </button>
            <button
              type="button"
              onClick={saveDraft}
              disabled={pending || !hasUnsavedDraftEdits}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> Save Draft
            </button>
            <button
              type="button"
              onClick={publishDraft}
              disabled={pending || !hasUnpublishedChanges}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              <Send className="h-4 w-4" /> Publish Changes
            </button>
            <button
              type="button"
              onClick={restorePublished}
              disabled={pending || (!hasUnpublishedChanges && !hasUnsavedDraftEdits)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm font-medium hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" /> Restore Published
            </button>
          </div>
        </div>
      </section>

      <StorefrontPresetEditor config={draft} onConfigChange={updateDraft} />

      <details className="rounded-2xl border border-black/10 bg-white shadow-sm">
        <summary className="cursor-pointer list-none px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                3
              </div>
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Customize sections</h2>
                <p className="mt-1 text-xs text-neutral-500">Fine-tune your draft page sections.</p>
              </div>
            </div>
            <span className="rounded-full border border-black/10 px-3 py-1 text-xs text-neutral-600">
              Optional
            </span>
          </div>
        </summary>
        <div className="border-t border-black/10 p-4">
          <LandingEditor
            initialBlocks={blocks}
            initialTopSection={draft.top_section}
            onBlocksChange={updateBlocks}
            onTopSectionChange={updateTopSection}
          />
        </div>
      </details>

      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
              4
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900">Preview & publish</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Open the published storefront visitors currently see.
              </p>
            </div>
          </div>
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-neutral-50"
          >
            View published store
          </a>
        </div>
      </section>
    </div>
  );
}
