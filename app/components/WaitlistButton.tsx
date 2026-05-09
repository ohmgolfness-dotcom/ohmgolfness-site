"use client";

import { useModal } from "@/app/context/ModalContext";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function WaitlistButton({ children, className, style }: Props) {
  const { openModal } = useModal();
  return (
    <button type="button" onClick={openModal} className={className} style={style}>
      {children}
    </button>
  );
}
