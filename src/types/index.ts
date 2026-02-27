export interface User {
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
}
