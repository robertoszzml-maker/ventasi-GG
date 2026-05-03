import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "../ui/badge";

interface PresupuestoResumenProps {
    form: any;  // El formulario (por ejemplo, react-hook-form o el objeto de datos)
    items: any[];  // Lista de ítems
}

export function PresupuestoResumen({ form, items }: PresupuestoResumenProps) {
    return (
        <Card>
            <CardHeader className="rounded-t-lg border-b bg-muted mb-4">
                <CardTitle>Resumen del Presupuesto</CardTitle>
                <CardDescription>Revisa la información antes de crear el presupuesto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Información General */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <h3 className="text-lg font-semibold mb-2">Información General</h3>
                        <dl className="space-y-2">
                            <div className="flex justify-between">
                                <dt className="font-medium text-muted-foreground">Fecha:</dt>
                                <dd>{form.watch('fecha')}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="font-medium text-muted-foreground">Cliente:</dt>
                                <dd>{form.watch('cliente')?.nombre || "-"}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="font-medium text-muted-foreground">Comprador:</dt>
                                <dd>{form.watch('comprador') || "-"}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="font-medium text-muted-foreground">Área:</dt>
                                <dd>{form.watch('area')?.nombre || "-"}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="font-medium text-muted-foreground ">Proceso general:</dt>
                                <dd ><Badge>{form.watch('procesoGeneral')?.nombre || "-"}</Badge></dd>
                            </div>
                        </dl>
                    </div>

                    {/* Proceso */}
                    <div className="bg-secondary p-4 rounded-lg border border-neutral">
                        <h3 className="text-lg font-semibold mb-2">Estado</h3>
                        <dl className="space-y-2">


                            <div className="flex justify-between">
                                <dt className="font-medium text-muted-foreground">Diseño:</dt>
                                <dd>{form.watch('disenoSolicitar') ? "Solicitado" : "No solicitado"}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="font-medium text-muted-foreground">Costeo técnico:</dt>
                                <dd>
                                    <Badge variant={form.watch('costeoEstatus') === 'completo' ? 'success' : 'destructive'}>
                                        {form.watch('costeoEstatus') === 'completo' ? 'COMPLETO' : 'PENDIENTE'}
                                    </Badge>
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="font-medium text-muted-foreground">Costeo Comercial:</dt>
                                <dd>
                                    <Badge variant={form.watch('costeoComercialEstatus') === 'completo' ? 'success' : 'destructive'}>
                                        {form.watch('costeoComercialEstatus') === 'completo' ? 'COMPLETO' : 'PENDIENTE'}
                                    </Badge>
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="font-medium text-muted-foreground">Facturacion:</dt>
                                <dd>
                                    {form.watch('facturacionEstatus') === 'total' && (
                                        <Badge variant="success">TOTAL</Badge>
                                    )}
                                    {form.watch('facturacionEstatus') === 'parcial' && (
                                        <Badge variant="destructive">PARCIAL</Badge>
                                    )}
                                    {form.watch('facturacionEstatus') === 'pendiente' || !form.watch('facturacionEstatus') && (
                                        <Badge variant="warning">PENDIENTE</Badge>
                                    )}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="font-medium text-muted-foreground">Cobranza:</dt>
                                <dd>
                                    {form.watch('cobranzaEstatus') === 'total' && (
                                        <Badge variant="success">TOTAL</Badge>
                                    )}
                                    {form.watch('cobranzaEstatus') === 'parcial' && (
                                        <Badge variant="destructive">PARCIAL</Badge>
                                    )}
                                    {form.watch('cobranzaEstatus') === 'pendiente' || !form.watch('cobranzaEstatus') && (
                                        <Badge variant="warning">PENDIENTE</Badge>
                                    )}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="font-medium text-muted-foreground">Producción:</dt>
                                <dd>
                                    <Badge variant={form.watch('produccionEstatus') === 'completo' ? 'success' : 'destructive'}>
                                        {form.watch('produccionEstatus') === 'completo' ? 'COMPLETO' : 'PENDIENTE'}
                                    </Badge>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <Separator />

                {/* Resumen de Ítems */}
                <div className="">
                    <h3 className="text-lg font-semibold mb-4">Ítems ({items.length})</h3>
                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={index} className="bg-secondary p-3 rounded-lg border border-neutral">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">
                                        Ítem {index + 1}: {item.descripcion}
                                    </span>
                                    <span>Cantidad: {item.cantidad}</span>
                                </div>
                                {item.detalles && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {item.detalles.length > 100 ? `${item.detalles.substring(0, 100)}...` : item.detalles}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
