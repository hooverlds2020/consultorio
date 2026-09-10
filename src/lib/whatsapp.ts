/**
 * Construye un enlace wa.me con mensaje precargado. No usa la API de
 * pago de WhatsApp Business — simplemente abre una conversación normal
 * con el texto ya escrito, para que el recepcionista solo confirme y
 * presione enviar.
 */
export function construirLinkWhatsapp(telefono: string, mensaje: string): string {
  // Deja solo dígitos. Si parece un número mexicano de 10 dígitos sin
  // código de país, le antepone 52 (México) para que wa.me lo reconozca.
  const soloDigitos = telefono.replace(/\D/g, "");
  const numeroConCodigo = soloDigitos.length === 10 ? `52${soloDigitos}` : soloDigitos;
  const mensajeCodificado = encodeURIComponent(mensaje);
  return `https://wa.me/${numeroConCodigo}?text=${mensajeCodificado}`;
}

export function mensajeRecordatorioCita(params: {
  nombrePaciente: string;
  fecha: Date | string;
  horaInicio: Date | string;
  tipoTratamiento: string;
}): string {
  const fechaTexto = new Date(params.fecha).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const horaTexto = new Date(params.horaInicio).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    `Hola ${params.nombrePaciente}, te recordamos tu cita el ${fechaTexto} a las ${horaTexto} ` +
    `para ${params.tipoTratamiento} en Consultorio Dental. ¡Te esperamos!`
  );
}
