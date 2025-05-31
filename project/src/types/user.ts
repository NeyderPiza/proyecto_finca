export interface User {
  email: string;
  password: string;
}

export interface UserState {
  isAuthenticated: boolean;
  user: User | null;
}
