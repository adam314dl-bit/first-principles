"use client";
import { renderMath } from "@/lib/renderMath";

interface MathTextProps {
  text: string;
  className?: string;
}

export default function MathText({ text, className = "" }: MathTextProps) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: renderMath(text) }}
    />
  );
}
