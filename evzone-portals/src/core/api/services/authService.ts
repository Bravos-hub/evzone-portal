/**
 * Authentication Service
 * Handles authentication-related API calls
 */

import { apiClient } from '../client'
import type { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenRequest } from '../types'

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Backend wraps response in { success: true, data: ... }
    const wrappedResponse = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/register', data, { skipAuth: true })
    
    // Extract the actual response from the wrapped structure
    const response = wrappedResponse.data || wrappedResponse as unknown as AuthResponse
    
    // Store tokens after successful registration
    if (response.accessToken && response.refreshToken) {
      apiClient.setTokens(response.accessToken, response.refreshToken, response.user)
    }
    
    return response
  },

  /**
   * Login with email/phone and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    // Backend wraps response in { success: true, data: ... }
    const wrappedResponse = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/login', data, { skipAuth: true })
    
    // Extract the actual response from the wrapped structure
    const response = wrappedResponse.data || wrappedResponse as unknown as AuthResponse
    
    // Store tokens after successful login
    if (response.accessToken && response.refreshToken) {
      apiClient.setTokens(response.accessToken, response.refreshToken, response.user)
    }
    
    return response
  },

  /**
   * Refresh access token
   */
  async refresh(refreshToken: string): Promise<AuthResponse> {
    // Backend wraps response in { success: true, data: ... }
    const wrappedResponse = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      '/auth/refresh',
      { refreshToken } as RefreshTokenRequest,
      { skipAuth: true }
    )
    
    // Extract the actual response from the wrapped structure
    const response = wrappedResponse.data || wrappedResponse as unknown as AuthResponse
    
    // Update stored tokens
    if (response.accessToken && response.refreshToken) {
      apiClient.setTokens(response.accessToken, response.refreshToken, response.user)
    }
    
    return response
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      // Even if logout fails on server, clear local tokens
      console.error('Logout error:', error)
    } finally {
      // Always clear local tokens
      apiClient.clearAuth()
    }
  },

  /**
   * Send OTP
   */
  async sendOtp(data: { email?: string; phone?: string; type: string }): Promise<{ message: string }> {
    return apiClient.post('/auth/otp/send', data, { skipAuth: true })
  },

  /**
   * Verify OTP
   */
  async verifyOtp(data: { email?: string; phone?: string; code: string; type: string }): Promise<AuthResponse> {
    // Backend wraps response in { success: true, data: ... }
    const wrappedResponse = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/otp/verify', data, { skipAuth: true })
    
    // Extract the actual response from the wrapped structure
    const response = wrappedResponse.data || wrappedResponse as unknown as AuthResponse
    
    // Store tokens after successful OTP verification
    if (response.accessToken && response.refreshToken) {
      apiClient.setTokens(response.accessToken, response.refreshToken, response.user)
    }
    
    return response
  },

  /**
   * Social login (Google)
   */
  async googleLogin(token: string): Promise<AuthResponse> {
    // Backend wraps response in { success: true, data: ... }
    const wrappedResponse = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/social/google', { token }, { skipAuth: true })
    
    // Extract the actual response from the wrapped structure
    const response = wrappedResponse.data || wrappedResponse as unknown as AuthResponse
    
    if (response.accessToken && response.refreshToken) {
      apiClient.setTokens(response.accessToken, response.refreshToken, response.user)
    }
    
    return response
  },

  /**
   * Social login (Apple)
   */
  async appleLogin(token: string): Promise<AuthResponse> {
    // Backend wraps response in { success: true, data: ... }
    const wrappedResponse = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/social/apple', { token }, { skipAuth: true })
    
    // Extract the actual response from the wrapped structure
    const response = wrappedResponse.data || wrappedResponse as unknown as AuthResponse
    
    if (response.accessToken && response.refreshToken) {
      apiClient.setTokens(response.accessToken, response.refreshToken, response.user)
    }
    
    return response
  },
}

