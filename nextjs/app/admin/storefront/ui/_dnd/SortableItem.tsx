"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";

function toTransformString(t: { x: number; y: number } | null) {
  if (!t) return undefined;
  // avoids TypeScript issues with CSS.Transform typings
  return `translate3d(${t.x}px, ${t.y}px, 0)`;
}

export function SortableItem({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: toTransformString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
