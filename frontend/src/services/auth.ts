import api from './api';
import type { User } from '../types';

export async function login(email: string, password: string): Promise<string> {
  const res = await api.post('/auth/login', { email, password });
  return res.data.access_token as string;
}

export async function register(name: string, email: string, password: string): Promise<void> {
  await api.post('/auth/register', { name, email, password });
}

export async function fetchMe(token?: string): Promise<User> {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
  const res = await api.get('/auth/me', config);
  return res.data as User;
}
