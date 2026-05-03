'use client';

import { useState, useCallback, useEffect } from 'react';
import { EtiquetaConfig, CONFIG_DEFAULT } from '@/lib/etiqueta';

const STORAGE_KEY = 'etiqueta_config';

export function useEtiquetaConfig() {
  const [config, setConfigState] = useState<EtiquetaConfig>(CONFIG_DEFAULT);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setConfigState({ ...CONFIG_DEFAULT, ...JSON.parse(raw) });
    } catch {
      // localStorage no disponible, usa defaults
    }
  }, []);

  const setConfig = useCallback((siguiente: EtiquetaConfig) => {
    setConfigState(siguiente);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(siguiente));
    } catch {
      // noop
    }
  }, []);

  return { config, setConfig };
}
