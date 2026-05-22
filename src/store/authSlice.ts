import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { adminApi } from '../api/adminApi';
import type { AdminUser } from '../types/api';

const TOKEN_KEY = 'nexgen_admin_token';
const USER_KEY = 'nexgen_admin_user';

interface AuthState {
  token: string | null;
  admin: AdminUser | null;
  loading: boolean;
  error: string | null;
}

function loadStored(): Pick<AuthState, 'token' | 'admin'> {
  const token = localStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(USER_KEY);
  let admin: AdminUser | null = null;
  if (raw) {
    try {
      admin = JSON.parse(raw);
    } catch {
      admin = null;
    }
  }
  if (token && isTokenExpired(token)) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return { token: null, admin: null };
  }
  return { token, admin };
}

function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    if (!decoded.exp) return false;
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export const loginAdmin = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await adminApi.login(email, password);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.admin));
      return data;
    } catch (e) {
      return rejectWithValue(e instanceof Error ? e.message : 'Login failed');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState: { ...loadStored(), loading: false, error: null } as AuthState,
  reducers: {
    logout(state) {
      state.token = null;
      state.admin = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.admin = action.payload.admin;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Login failed';
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

export function selectIsAuthenticated(state: { auth: AuthState }) {
  const { token } = state.auth;
  return Boolean(token && !isTokenExpired(token));
}
