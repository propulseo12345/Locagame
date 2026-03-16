const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  error: (message: string, error?: unknown) => {
    if (isDev) {
      console.error(message, error);
    } else {
      // En prod : message générique uniquement, jamais le détail
      console.error(message);
    }
  },
};
