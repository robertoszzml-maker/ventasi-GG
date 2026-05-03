"use client";
import { EnvioNotificacion } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  MessageCircle,
  FileText,
  Hash,
  CalendarDays,
  AtSign,
  AlertCircle,
  Clock,
  BookOpen,
  MessageSquare,
  UserCircle2,
} from "lucide-react";
import { formatDate, formatTime } from "@/utils/date";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

type Props = {
  data: EnvioNotificacion;
};

const ESTADO_CONFIG = {
  enviado: { label: "Enviado", variant: "success" as const },
  error: { label: "Error", variant: "destructive" as const },
  pendiente: { label: "Pendiente", variant: "outline" as const },
};

const MODELO_LABEL: Record<string, string> = {
  factura: "Factura",
  presupuesto: "Presupuesto",
  contrato: "Contrato",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
      {children}
    </p>
  );
}

function Campo({
  icon: Icon,
  label,
  children,
}: {
  icon?: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      {Icon && (
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border bg-muted/40">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      )}
      <div className="min-w-0 space-y-0.5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium leading-tight">{children}</div>
      </div>
    </div>
  );
}

export function EnvioNotificacionDetail({ data }: Props) {
  const CanalIcon = data.canal === "whatsapp" ? MessageCircle : Mail;
  const estadoConfig = ESTADO_CONFIG[data.estado] ?? ESTADO_CONFIG.pendiente;
  const modeloLabel = MODELO_LABEL[data.modelo] ?? data.modelo;

  return (
    <div className="space-y-6 ">
      {/* ── Banner de estado ── */}
      <div className="rounded-lg border bg-muted/20 px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background border">
            <CanalIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              {data.canal === "whatsapp" ? "WhatsApp" : "Email"}
            </p>
            {data.emailDestinatario && (
              <p className="text-xs text-muted-foreground">
                {data.emailDestinatario}
              </p>
            )}
          </div>
        </div>
        <Badge variant={estadoConfig.variant}>{estadoConfig.label}</Badge>
      </div>

      {/* ── Detalles del envío ── */}
      <div>
        <SectionTitle>Detalles del envío</SectionTitle>
        <div className="rounded-lg border divide-y">
          <div className="grid grid-cols-2 gap-5 px-4 py-4">
            <Campo icon={CanalIcon} label="Canal">
              {data.canal === "whatsapp" ? "WhatsApp" : "Email"}
            </Campo>

            {data.emailDestinatario ? (
              <Campo icon={AtSign} label="Destinatario">
                {data.emailDestinatario}
              </Campo>
            ) : (
              <Campo icon={AtSign} label="Destinatario">
                <span className="text-muted-foreground font-normal">
                  No especificado
                </span>
              </Campo>
            )}

            <Campo icon={Hash} label="Tipo de entidad">
              {modeloLabel}
            </Campo>

            <Campo icon={Hash} label="Referencia">
              {modeloLabel} #{data.modeloId}
            </Campo>
          </div>

          {/* Línea de tiempos y auditoría */}
          <div className="grid grid-cols-2 gap-5 px-4 py-4">
            <Campo icon={CalendarDays} label="Registrado">
              {data.createdAt ? formatTime(data.createdAt) : "—"}
            </Campo>

            <Campo icon={Clock} label="Fecha de envío">
              {data.fechaEnvio ? (
                formatDate(data.fechaEnvio)
              ) : (
                <span className="text-muted-foreground font-normal">
                  Pendiente
                </span>
              )}
            </Campo>

            {data.createdByUser && (
              <Campo icon={UserCircle2} label="Registrado por">
                {data.createdByUser.nombre}
              </Campo>
            )}
          </div>
        </div>
      </div>

      {/* ── Plantilla ── */}
      <div>
        <SectionTitle>Plantilla utilizada</SectionTitle>
        <div className="rounded-lg border px-4 py-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border bg-muted/40">
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="text-sm font-medium">
                {data.plantilla?.nombre ?? (
                  <span className="text-muted-foreground font-normal">
                    Sin plantilla
                  </span>
                )}
              </p>
            </div>
          </div>

          {data.plantilla?.descripcion && (
            <div className="flex items-start gap-2.5">
              <div className="h-6 w-6 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Descripción</p>
                <p className="text-sm text-muted-foreground">
                  {data.plantilla.descripcion}
                </p>
              </div>
            </div>
          )}

          {data.plantilla?.asunto && (
            <div className="flex items-start gap-2.5">
              <div className="h-6 w-6 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Asunto original</p>
                <p className="text-sm">{data.plantilla.asunto}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mensaje ── */}
      <div>
        <SectionTitle>Mensaje</SectionTitle>
        <div className="space-y-2">
          {data.asuntoResuelto && (
            <div className="rounded-lg border px-4 py-3 flex items-start gap-2.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border bg-muted/40">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Asunto</p>
                <p className="text-sm font-medium">{data.asuntoResuelto}</p>
              </div>
            </div>
          )}

          <div className="rounded-lg border overflow-hidden">
            <div className="px-4 py-2.5 border-b bg-muted/30 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">
                Cuerpo del mensaje
              </p>
            </div>
            <RichTextEditor
              value={data.cuerpoResuelto}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {data.error && (
        <div>
          <SectionTitle>Error</SectionTitle>
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-destructive/20 flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-destructive" />
              <p className="text-xs font-medium text-destructive">
                Detalle del error
              </p>
            </div>
            <pre className="px-4 py-3 text-sm text-destructive whitespace-pre-wrap font-mono">
              {data.error}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
