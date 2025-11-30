/**
 * Utilitário para lidar com inputs numéricos de forma segura
 * Permite apagar valores (incluindo 0) e converte apenas quando necessário
 */

/**
 * Converte valor de input numérico para número ou string vazia
 * Permite apagar o valor completamente, incluindo quando é 0
 */
export const parseNumberInput = (value: string): number | '' => {
  if (value === '' || value === null || value === undefined) {
    return '';
  }
  const parsed = Number(value);
  return isNaN(parsed) ? '' : parsed;
};

/**
 * Converte valor para exibição em input numérico
 * Mantém string vazia se o valor for 0 e permitir vazio
 */
export const formatNumberForInput = (value: number | '' | null | undefined): string => {
  if (value === '' || value === null || value === undefined) {
    return '';
  }
  return String(value);
};

/**
 * Valida e converte valor numérico para envio ao backend
 * Retorna 0 se vazio e o campo não for obrigatório, ou lança erro se obrigatório
 */
export const prepareNumberForSubmit = (
  value: number | '',
  required: boolean = false,
  defaultValue: number = 0
): number => {
  if (value === '') {
    if (required) {
      throw new Error('Campo numérico obrigatório não pode estar vazio');
    }
    return defaultValue;
  }
  return value;
};





