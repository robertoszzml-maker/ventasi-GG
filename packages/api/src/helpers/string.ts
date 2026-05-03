import { TIPO_NOTIFICACION } from "@/constants/notificaciones";
import { Notificacion } from "@/modules/notificacion/entities/notificacion.entity";

export function capitalizarPrimeraLetra(str?: string) {
  if (!str) return str; // Manejo de cadena vacía
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function notaNotificacion(notificacion: Notificacion) {
  let nota: string = ''
  if (!Boolean(notificacion.nota?.trim())) {
    switch (notificacion.tipoNotificacion) {
      case TIPO_NOTIFICACION.PRESUPUESTO:
        nota = notificacionMensajeChat(notificacion)
        break;
      case TIPO_NOTIFICACION.MENSAJE:
        nota = notificacionMensajeChat(notificacion)
        break;
      case TIPO_NOTIFICACION.ALQUILER:
        nota = '' // notificacionMensajeAlquiler(notificacion)
        break;
      case TIPO_NOTIFICACION.PRESUPUESTO_FECHA:
        nota = ''
        break;
      default:
        nota = ''
        break;
    }
  } else {
    nota = notificacion.nota ?? ''
  }
  return nota
}

function notificacionMensajeChat(notificacion: Notificacion) {
  let nota: string = ''
  let tipoLabel = ''

  // Mapear el tipo a un label más amigable
  switch (notificacion.tipo) {
    case 'presupuesto':
      tipoLabel = 'Presupuesto'
      break
    case 'alquiler':
      tipoLabel = 'Alquiler'
      break
    case 'solcom':
      tipoLabel = 'Solicitud de Compra'
      break
    default:
      tipoLabel = capitalizarPrimeraLetra(notificacion.tipo)
  }

  if (notificacion?.usuarioDestinoId) {
    nota = `Tenés una mención en el chat del ${tipoLabel} (#${notificacion.tipoId})`
  } else {
    nota = `Existen nuevos mensajes en en el chat de: ${tipoLabel} (#${notificacion.tipoId})`
  }
  return nota
}
