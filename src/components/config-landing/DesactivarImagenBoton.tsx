"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { desactivarImagenGaleria } from "@/actions/landing";

export default function DesactivarImagenBoton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      await desactivarImagenGaleria(id);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-xs text-red-500 hover:underline disabled:opacity-50"
    >
      Quitar
    </button>
  );
}
