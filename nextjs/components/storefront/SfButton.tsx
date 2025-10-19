"use client";
import * as React from "react";
import Link from "next/link";
import { buttonClasses } from "@/lib/theme";
import type { ButtonStyle, ButtonShadow, ButtonTone } from "@/lib/types";

type Common = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties; // CSS, not "button style"
  size?: "sm" | "md" | "lg";
  btnStyle?: ButtonStyle;
  btnShadow?: ButtonShadow;
  btnTone?: ButtonTone;
  fullWidth?: boolean;
};

type ButtonProps =
  | (Common & { href: string; onClick?: never })
  | (Common & { href?: never; onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"] });

export default function SfButton(props: ButtonProps) {
  const cls = buttonClasses({
    style: props.btnStyle,
    shadow: props.btnShadow,
    tone: props.btnTone,
    size: props.size,
    fullWidth: props.fullWidth,
  }) + (props.className ? ` ${props.className}` : "");

  if ("href" in props && props.href) {
    const { href, children, style } = props;
    return (
      <Link href={href} className={cls} style={style}>
        {children}
      </Link>
    );
  }
  const { onClick, children, style } = props as any;
  return (
    <button type="button" onClick={onClick} className={cls} style={style}>
      {children}
    </button>
  );
}
