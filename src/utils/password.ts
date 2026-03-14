export interface PasswordRules {
  minLength: boolean  // 8자 이상
  hasUpper: boolean   // 대문자 포함
  hasSpecial: boolean // 특수문자 포함
}

export function checkPasswordRules(pw: string): PasswordRules {
  return {
    minLength: pw.length >= 8,
    hasUpper:  /[A-Z]/.test(pw),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(pw),
  }
}

export function isPasswordValid(pw: string): boolean {
  const r = checkPasswordRules(pw)
  return r.minLength && r.hasUpper && r.hasSpecial
}
