export const TIPO_MOVIMIENTO = {
    IN: 'IN',
    OUT: 'OUT',
    AJUSTE: 'AJUSTE',
    RESERVA: 'RESERVA',
    PRESTAMO: 'PRESTAMO',
    DEVOLUCION: 'DEVOLUCION',
} as const

export const UNIDADES: Record<string, string> = {
    UN: "Unidad (UN)",
    KG: "Kilogramo (KG)",
    G: "Gramo (G)",
    L: "Litro (L)",
    ML: "Mililitro (ML)",
    M: "Metro (M)",
    M2: "Metro cuadrado (M2)",
    M3: "Metro cúbico (M3)",
    CJ: "Caja (CJ)",
    PQT: "Paquete (PQT)",
    PAR: "Par (PAR)",
    ROL: "Rollo (ROL)",
    BOT: "Botella (BOT)",
    LAT: "Lata (LAT)",
    LB: "Libra (LB)"

}