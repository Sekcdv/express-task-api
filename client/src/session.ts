export const TOKEN_KEY = 'task-api.access-token';

export const readToken = (): string | null => sessionStorage.getItem(TOKEN_KEY);

export const saveToken = (token: string): void => {
    sessionStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
    sessionStorage.removeItem(TOKEN_KEY);
};
