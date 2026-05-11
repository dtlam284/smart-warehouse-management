import { authService } from '@/services/admin/accessService'

export class AuthService {
  static login = authService.login
  static refresh = authService.refresh
  static logout = authService.logout
  // static logoutAll = authService.logoutAll
  // static getMe = authService.getMe
  // static updateMe = authService.updateMe
  static getSessions = authService.getSessions
  static revokeSession = authService.revokeSession
  static getStoredTokens = authService.getStoredTokens
  static setStoredTokens = authService.setStoredTokens
  static clearStoredTokens = authService.clearStoredTokens
}
