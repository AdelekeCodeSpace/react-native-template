export interface Token {
  access: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

/** Shape returned by GET /auth/me — adjust to match your backend. */
export interface User {
  email: string;
  full_name?: string;
}
