import request from "@/utils/request";

// 定义请求体接口
interface LoginRequest {
    username: string; // 根据你的后端 LoginRequest 定义
    password: string;
}

// 定义重置密码请求体接口
interface ResetPasswordRequest {
    recoveryCode: string;
    newPassword: string;
}

export const login = async (data: LoginRequest) => {
    try {
        return await request.post<void>('/api/login', data);
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

export const resetPassword = async (data: ResetPasswordRequest) => {
    try {
        return await request.put<void>('/api/reset-password', data);
    } catch (error) {
        console.error('Reset password failed:', error);
        throw error;
    }
}
