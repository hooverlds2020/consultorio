"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState, useTransition } from "react";
import { guardarConfigTelegram, enviarMensajePruebaTelegram } from "@/actions/telegram";
import type { EstadoTelegram } from "@/actions/telegram";

const estadoInicial: EstadoTelegram = { ok: false };

function BotonGuardar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 px-5 bg-clinica-azul text-white rounded-lg font-medium hover:bg-clinica-azulOscuro transition disabled:opacity-60"
    >
      {pending ? "Guardando..." : "Guardar"}
    </button>
  );
}

export default function TelegramConfigForm({
  botTokenGuardado,
  chatIdGuardado,
}: {
  botTokenGuardado: boolean;
  chatIdGuardado: string;
}) {
  const [estado, formAction] = useFormState(guardarConfigTelegram, estadoInicial);
  const [isPendingPrueba, startTransitionPrueba] = useTransition();
  const [resultadoPrueba, setResultadoPrueba] = useState<EstadoTelegram | null>(null);

  function handleProbar() {
    setResultadoPrueba(null);
    startTransitionPrueba(async () => {
      const resultado = await enviarMensajePruebaTelegram({ ok: false });
      setResultadoPrueba(resultado);
    });
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 space-y-2">
        <p className="font-medium">Cómo conseguir estos dos datos (una sola vez, 5 minutos):</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>
            En Telegram, busca <strong>@BotFather</strong>, mándale <code>/newbot</code>, ponle un
            nombre — te va a dar un <strong>token</strong> (algo como{" "}
            <code>123456:ABC-xyz</code>). Cópialo abajo.
          </li>
          <li>
            Busca a tu bot recién creado (con el nombre que le pusiste) y mándale cualquier
            mensaje, ej. "hola" — así "lo activas".
          </li>
          <li>
            Busca <strong>@userinfobot</strong>, mándale <code>/start</code> — te va a dar tu{" "}
            <strong>Chat ID</strong> (un número). Cópialo abajo.
          </li>
        </ol>
      </div>

      <form action={formAction} className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
        {estado.ok && <p className="text-green-600 text-sm">Guardado ✓</p>}
        {estado.mensaje && <p className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{estado.mensaje}</p>}

        <div>
          <label className="block text-sm text-gray-700 mb-1">Token del bot</label>
          <input
            type="text"
            name="botToken"
            placeholder={botTokenGuardado ? "Ya guardado — escribe uno nuevo para cambiarlo" : "123456:ABC-xyz..."}
            className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Chat ID</label>
          <input
            type="text"
            name="chatId"
            defaultValue={chatIdGuardado}
            placeholder="987654321"
            className="w-full h-11 border border-gray-300 rounded-lg px-3 text-[16px]"
          />
        </div>
        <BotonGuardar />
      </form>

      {botTokenGuardado && (
        <div className="bg-white rounded-xl border shadow-sm p-5">
          {resultadoPrueba?.ok && <p className="text-green-600 text-sm mb-2">Enviado ✓ — revisa tu Telegram.</p>}
          {resultadoPrueba && !resultadoPrueba.ok && (
            <p className="text-red-600 text-sm mb-2">{resultadoPrueba.mensaje}</p>
          )}
          <button
            onClick={handleProbar}
            disabled={isPendingPrueba}
            className="h-11 px-5 border border-clinica-azul text-clinica-azul rounded-lg font-medium hover:bg-clinica-azulClaro transition disabled:opacity-60"
          >
            {isPendingPrueba ? "Enviando..." : "Enviar mensaje de prueba"}
          </button>
        </div>
      )}
    </div>
  );
}
