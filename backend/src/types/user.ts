export enum UserRoles {
    ADMIN = 'ADMIN',
    STUDENT = 'STUDENT',
    TEACHER = 'TEACHER',
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRoles;
}