export const calcularIva = (monto: number) => {
    if (!monto) return 0;
    const tasaIva = 1.21; // 21% de IVA
    return +(Number(monto) * tasaIva).toFixed(2);
}