"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { desactivarTestimonio } from "@/actions/landing";

export default function DesactivarTestimonioBoton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      await desactivarTestimonio(id);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-xs text-red-500 hover:underline disabled:opacity-50"
    >
      Quitar de la web
    </button>
  );
}
