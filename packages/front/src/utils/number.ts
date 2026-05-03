export const formatCurrency = (value: number) => {
    if (!value) return '0.00'
    return new Intl.NumberFormat("es-AR", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)
}

export const formatMoney = (value: number) => {
    if (!value) return '0.00'

    return "$ " + new Intl.NumberFormat("es-AR", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)
}
