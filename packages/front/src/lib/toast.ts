// src/lib/toast.ts

type ToastVariant = 'default' | 'destructive';

type ToastParams = {
    title: string;
    description?: string;
    variant?: ToastVariant;
};

type ToastFn = (params: ToastParams) => void;

let showToast: ToastFn | null = null;

export function setToast(fn: ToastFn) {
    showToast = fn;
}

export function triggerToast(params: ToastParams) {
    if (showToast) {
        showToast(params);
    } else {
        console.warn("Toast no está inicializado aún");
    }
}
