import request, {Result} from "@/utils/request";
import { getApiConfig } from "@/utils/config";

// 后端返回的文件对象结构
export interface FileItem {
    id: string;
    name: string;
    path: string;
    date: string;
    size: string;
    type: "file" | "folder";
    editable: boolean;
    rawSize: number;
}

// 1. 获取列表
export const getFiles = (path: string = "") => {
    return request.get<Result<FileItem[]>>("/api/file/list", { params: { path } });
};

// 2. 新建文件/文件夹
export const createFile = (path: string, name: string, isFolder: boolean) => {
    return request.post<Result<string>>("/api/file/create", { path, name, isFolder });
};

// 3. 删除
export const deleteFile = (path: string) => {
    return request.delete<Result<string>>("/api/file/delete", { params: { path } });
};

// 4. 获取文本内容
export const getFileContent = (path: string) => {
    return request.get<Result<{ content: string }>>("/api/file/content", { params: { path } });
};

// 5. 保存文本
export const saveFileContent = (path: string, content: string) => {
    return request.post<Result<string>>("/api/file/save", { path, content });
};

// 6. 获取下载链接 (直接拼接 URL)
export const getDownloadUrl = (path: string) => {
    const { baseUrl } = getApiConfig();
    return `${baseUrl}/api/file/download?path=${encodeURIComponent(path)}`;
};

// 7. 获取预览链接
export const getViewUrl = (path: string) => {
    const { baseUrl } = getApiConfig();
    return `${baseUrl}/api/file/view?path=${encodeURIComponent(path)}`;
};
