/** Onde gravar a preferência para ela valer por cima do default da extensão. */
export type GhostConfigTarget = "workspaceFolder" | "workspace" | "global";

export interface LanguageSettingInspect<T> {
  workspaceFolderLanguageValue?: T;
  workspaceLanguageValue?: T;
}

export interface SettingInspect<T> {
  workspaceFolderValue?: T;
  workspaceValue?: T;
  globalValue?: T;
}

export const GHOST_INLINE_SUGGEST_KEY = "editor.inlineSuggest.enabled";
export const CURSOR_CPP_DISABLED_KEY = "cursor.cpp.disabledLanguages";

/** Escopo mais específico que já define a chave. Sem isso, grava no usuário. */
export function resolveLanguageSettingTarget<T>(
  inspected: LanguageSettingInspect<T> | undefined
): GhostConfigTarget {
  if (inspected?.workspaceFolderLanguageValue !== undefined) return "workspaceFolder";
  if (inspected?.workspaceLanguageValue !== undefined) return "workspace";
  return "global";
}

export function resolveSettingTarget<T>(
  inspected: SettingInspect<T> | undefined
): GhostConfigTarget {
  if (inspected?.workspaceFolderValue !== undefined) return "workspaceFolder";
  if (inspected?.workspaceValue !== undefined) return "workspace";
  return "global";
}

export function valueAtTarget<T>(
  inspected: SettingInspect<T> | undefined,
  target: GhostConfigTarget
): T | undefined {
  switch (target) {
    case "workspaceFolder":
      return inspected?.workspaceFolderValue;
    case "workspace":
      return inspected?.workspaceValue;
    case "global":
      return inspected?.globalValue;
    default: {
      const unreachable: never = target;
      return unreachable;
    }
  }
}

/**
 * Lista de linguagens com Tab do Cursor bloqueado.
 * `undefined` = não alterar (setting ausente, ou a lista já está no estado pedido).
 */
export function nextCursorDisabledLanguages(
  current: readonly string[] | undefined,
  languageId: string,
  ghostEnabled: boolean
): string[] | undefined {
  if (current === undefined) return undefined;
  const next = ghostEnabled
    ? current.filter((id) => id !== languageId)
    : current.includes(languageId)
      ? [...current]
      : [...current, languageId];
  if (next.length === current.length && next.every((id, index) => id === current[index])) {
    return undefined;
  }
  return next;
}
