"use client";

import React from "react";
import { X, ExternalLink } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

interface SlipPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

export function SlipPreviewModal({
  isOpen,
  onClose,
  imageUrl,
  title = "หลักฐานการชำระเงิน (สลิป)",
}: SlipPreviewModalProps) {
  if (!isOpen || !imageUrl) return null;

  const fullUrl = getImageUrl(imageUrl);

  return (
    <div 
      className="fixed inset-0 z-50 !m-0 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-h-[90vh] max-w-3xl w-full flex flex-col rounded-xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3 bg-neutral-50">
          <h3 className="text-sm font-semibold text-neutral-900 truncate">
            {title}
          </h3>
          <div className="flex items-center gap-1.5">
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900 transition-colors"
              title="เปิดในแท็บใหม่"
            >
              <ExternalLink size={14} />
              เปิดรูปเต็ม
            </a>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Image Content */}
        <div className="flex flex-1 items-center justify-center overflow-auto bg-neutral-900/5 p-4 min-h-[300px] max-h-[calc(90vh-100px)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullUrl}
            alt="Payment Slip"
            className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain shadow-md"
          />
        </div>
      </div>
    </div>
  );
}
