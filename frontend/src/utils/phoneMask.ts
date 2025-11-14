// phoneMask.ts
// Função para aplicar máscara de telefone brasileiro (XX) XXXXX-XXXX ou (XX) XXXX-XXXX

export function phoneMask(value: string): string {
  // Remove todos os caracteres que não são dígitos
  const digits = value.replace(/\D/g, '');

  // Limita a quantidade de dígitos (máximo 11: 2 para DDD + 5 ou 4 para número + 4 para número final)
  const maxLength = 11;
  const limitedDigits = digits.substring(0, maxLength);

  // Aplica a máscara conforme o número de dígitos
  if (limitedDigits.length > 6) {
    // Formato (XX) XXXXX-XXXX (para celulares com 9 dígitos no número)
    return limitedDigits.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2$3-$4');
  } else if (limitedDigits.length > 2) {
    // Formato (XX) XXXX-X (parte inicial)
    return limitedDigits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  } else if (limitedDigits.length > 0) {
    // Formato (XX)
    return limitedDigits.replace(/(\d{0,2})/, '($1)');
  }

  return '';
}

// Função para remover a máscara e retornar apenas os dígitos
export function unmaskPhone(value: string): string {
  return value.replace(/\D/g, '');
}