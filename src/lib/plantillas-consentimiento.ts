export const PLANTILLAS_CONSENTIMIENTO: Record<string, string> = {
  General:
    "Declaro que he sido informado(a) de manera clara sobre el diagnóstico, el tratamiento propuesto, " +
    "sus beneficios, riesgos y alternativas. Autorizo al personal de Laboratorio y Consultorio Dental " +
    "a realizar el procedimiento descrito, entendiendo que ningún tratamiento dental está exento de riesgos.",
  Cirugía:
    "Declaro que he sido informado(a) sobre el procedimiento quirúrgico a realizar, sus riesgos " +
    "(incluyendo pero no limitado a sangrado, infección, inflamación y molestia postoperatoria), " +
    "beneficios esperados y alternativas de tratamiento. Autorizo la realización de dicho procedimiento.",
  Endodoncia:
    "Declaro que he sido informado(a) sobre el tratamiento de conductos (endodoncia) a realizar, " +
    "incluyendo la posibilidad de requerir sesiones adicionales, el riesgo de fractura de instrumental " +
    "o de la pieza dental, y la necesidad de una restauración posterior. Autorizo el procedimiento.",
  Extracción:
    "Declaro que he sido informado(a) sobre la necesidad de extraer la pieza dental indicada, los " +
    "riesgos asociados (sangrado, infección, dolor postoperatorio, posible necesidad de tratamiento " +
    "adicional) y las indicaciones de cuidado posterior. Autorizo la realización de la extracción.",
};

export const TIPOS_CONSENTIMIENTO = Object.keys(PLANTILLAS_CONSENTIMIENTO);
