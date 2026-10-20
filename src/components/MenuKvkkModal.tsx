"use client";

type Props = {
  baslik: string;
  metin: string;
  onKapat: () => void;
};

export function MenuKvkkModal({ baslik, metin, onKapat }: Props) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal
      onClick={onKapat}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-semibold">{baslik}</h2>
          <button
            type="button"
            onClick={onKapat}
            className="rounded-full border border-line px-2 py-1 text-sm"
          >
            Kapat
          </button>
        </div>
        <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted">{metin}</div>
      </div>
    </div>
  );
}
