"use client";

import React, {useEffect, useRef, useState} from "react";
import {
    Button,
    Card,
    CardBody,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    SortDescriptor,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure
} from "@nextui-org/react";
import {
    CornerUpLeft,
    Download,
    FilePlus,
    FileText,
    FolderOpen,
    FolderPlus,
    Image as ImageIcon,
    Pencil,
    RefreshCw,
    Trash2
} from "lucide-react";
import {toast} from "sonner";
import {
    createFile,
    deleteFile,
    FileItem,
    getDownloadUrl,
    getFileContent,
    getFiles,
    getViewUrl,
    saveFileContent
} from "@/api/fileManager";
import {TOKEN_KEY} from "@/utils/request";
import {useSearchParams} from "next/dist/client/components/navigation";
import {useRouter} from "next/navigation";
// --- 辅助函数：判断是否为图片 ---
const isImageFile = (filename: string) => {
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(filename);
};

export default function FilePage() {
    // 状态管理
    const router =          useRouter();
    const searchParams = useSearchParams();
    const initialPath = searchParams.get("path") ? decodeURIComponent(searchParams.get("path")!) : "";
    const [currentPath, setCurrentPath] = useState<string>(initialPath);
    const [inputPath, setInputPath] = useState<string>(initialPath);
    const [fileList, setFileList] = useState<FileItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "name",     // 默认按名称排序
        direction: "ascending", // 默认升序
    });


    const sortedItems = React.useMemo(() => {
        return [...fileList].sort((a: FileItem, b: FileItem) => {
            // 规则1: 文件夹始终在文件前面 (符合大多数文件管理器习惯)
            // 如果你不想要这个功能，可以删掉这个 if 块
            if (a.type !== b.type) {
                return a.type === "folder" ? -1 : 1;
            }

            // 规则2: 根据当前选择的列进行排序
            let first = a;
            let second = b;
            let cmp = 0;

            switch (sortDescriptor.column) {
                case "name":
                    // 字符串比较
                    cmp = first.name.localeCompare(second.name);
                    break;
                case "date":
                    // 时间比较 (假设 date 是字符串，如果是标准格式可以直接比，
                    // 最好后端返回 timestamp 或 mtime 字段，这里先按字符串比)
                    cmp = first.date < second.date ? -1 : first.date > second.date ? 1 : 0;
                    break;
                case "size":
                    // 大小比较：必须使用 rawSize (数字)，不能用显示的大小字符串 ("10 KB" < "2 MB" 是错的)
                    // 代码第214行用到了 rawSize，说明对象里有这个属性
                    cmp = (first.rawSize || 0) - (second.rawSize || 0);
                    break;
                default:
                    cmp = 0;
            }

            // 处理升序/降序
            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [sortDescriptor, fileList]);

    // 模态框控制
    const {isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateChange} = useDisclosure();
    const {isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditChange} = useDisclosure();
    const {isOpen: isImgOpen, onOpen: onImgOpen, onClose: onImgClose, onOpenChange: onImgChange} = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onOpenChange: onDeleteChange } = useDisclosure();

    // 临时状态
    const [createType, setCreateType] = useState<"file" | "folder">("file");
    const [newItemName, setNewItemName] = useState("");
    const [editingFile, setEditingFile] = useState<{ path: string; name: string } | null>(null);
    const [editorContent, setEditorContent] = useState("");
    const [isImgLoading, setIsImgLoading] = useState(false);
    const [previewImgUrl, setPreviewImgUrl] = useState("");
    const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // 引用
    const isBackRef = useRef(false);

    useEffect(() => {
        // 构建新的查询参数
        const params = new URLSearchParams(searchParams.toString());
        if (currentPath) {
            params.set("path", currentPath);
        } else {
            params.delete("path"); // 如果是根目录，移除参数让 URL 更干净
        }

        router.replace(`?${params.toString()}`, { scroll: false });

        // 同时更新输入框和发起请求
        setInputPath(currentPath);
        fetchFiles(currentPath);
    }, [currentPath]); // 依赖项只留 currentPath

    // 4. (可选) 监听 URL 变化 (比如用户点击浏览器的前进/后退按钮)
    // 这样浏览器的后退按钮也能正常工作了
    useEffect(() => {
        const urlPath = searchParams.get("path") ? decodeURIComponent(searchParams.get("path")!) : "";
        if (urlPath !== currentPath) {
            setCurrentPath(urlPath);
        }
    }, [searchParams]);

    // 监听后退键逻辑
    useEffect(() => {
        if (isImgOpen) {
            // 1. 打开 Modal 时，往浏览器历史推入一个状态
            window.history.pushState({ imgModal: true }, '', window.location.href);

            const handlePopState = () => {
                // 2. 监听到后退事件（手机后退键或浏览器后退按钮）
                isBackRef.current = true; // 标记：这是由后退键触发的
                onImgClose();             // 关闭弹窗
            };

            window.addEventListener('popstate', handlePopState);

            return () => {
                window.removeEventListener('popstate', handlePopState);
                // 3. 关闭 Modal 时，如果不是通过后退键关闭的（比如点了关闭按钮），
                // 我们需要手动 history.back() 把第1步推入的那个状态抵消掉
                if (!isBackRef.current) {
                    window.history.back();
                }
                isBackRef.current = false; // 重置标记
            };
        }
    }, [isImgOpen, onImgClose]);


    useEffect(() => {
        return () => {
            if (previewImgUrl) {
                window.URL.revokeObjectURL(previewImgUrl);
            }
        };
    }, [previewImgUrl]);

    // 辅助函数：带鉴权的 Blob 获取
    const fetchBlobWithAuth = async (url: string) => {
        const token = localStorage.getItem(TOKEN_KEY);
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = token;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.blob();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 只有当正在编辑模式打开时才生效
            if (!isEditOpen) return;

            // 检测 Ctrl + S (Windows/Linux) 或 Command + S (Mac)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault(); // 阻止浏览器默认的“保存网页”行为
                console.log("触发快捷键保存");
                handleSaveContent(() => {
                });
            }
        };

        // 添加监听
        window.addEventListener('keydown', handleKeyDown);

        // 清理监听
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isEditOpen, editorContent, editingFile]); // 依赖项很重要，确保能拿到最新的 content

    // 初始化加载
    useEffect(() => {
        fetchFiles(currentPath);
        setInputPath(currentPath);
    }, [currentPath]);

    // --- API 交互 ---

    // 1. 获取文件列表
    const fetchFiles = async (path: string) => {
        setIsLoading(true);
        try {
            const res = await getFiles(path);
            if (res.success && res.data) {
                setFileList(res.data);
            } else {
                toast.error(res.message || "加载失败");
            }
        } catch (error) {
            console.error(error);
            toast.error("网络错误");
        } finally {
            setIsLoading(false);
        }
    };

    // 2. 创建文件/文件夹
    const handleCreate = async (onClose: () => void) => {
        if (!newItemName.trim()) return toast.warning("名称不能为空");
        try {
            const res = await createFile(currentPath, newItemName, createType === "folder");
            if (res.success) {
                toast.success("创建成功");
                onClose();
                fetchFiles(currentPath);
                setNewItemName("");
            } else {
                toast.error(res.message);
            }
        } catch (e) {
            toast.error("请求失败");
        }
    };

    // 3. 删除文件
    // 3.1 用户点击列表中的垃圾桶图标 -> 打开确认框
    const handleDeleteClick = (file: FileItem) => {
        setFileToDelete(file); // 记录要删谁
        onDeleteOpen();        // 打开弹窗
    };

    // 3.2 用户在弹窗里点击“确定” -> 执行 API
    const handleConfirmDelete = async () => {
        if (!fileToDelete) return;

        setIsDeleting(true); // 开启按钮 loading
        try {
            const res = await deleteFile(fileToDelete.path);
            if (res.success) {
                toast.success("删除成功");
                fetchFiles(currentPath); // 刷新列表
                onDeleteChange();        // 关闭弹窗 (NextUI 的 onClose 逻辑)
            } else {
                toast.error(res.message);
            }
        } catch (e) {
            toast.error("删除失败");
        } finally {
            setIsDeleting(false); // 关闭 loading
            setFileToDelete(null); // 清理状态
        }
    };


    // 4. 打开编辑器
    const openEditor = async (file: FileItem) => {
        // 检查大小，防止浏览器卡死 (比如 > 1MB 不让编辑)
        if (file.rawSize > 1024 * 1024) {
            toast.warning("文件过大，不支持在线编辑");
            return;
        }

        try {
            const res = await getFileContent(file.path);
            if (res.success && res.data) {
                setEditorContent(res.data.content);
                setEditingFile({path: file.path, name: file.name});
                onEditOpen();
            } else {
                toast.error(res.message);
            }
        } catch (e) {
            toast.error("读取文件失败");
        }
    };

    // 5. 保存文件
    const handleSaveContent = async (onClose: () => void) => {
        if (!editingFile) return;
        try {
            const res = await saveFileContent(editingFile.path, editorContent);
            if (res.success) {
                toast.success("保存成功");
                onClose();
            } else {
                toast.error(res.message);
            }
        } catch (e) {
            toast.error("保存失败");
        }
    };

    // 6. 处理行点击 (单击进入目录，单击预览图片)
    const handleRowClick = async (file: FileItem) => {
        if (file.type === "folder") {
            setCurrentPath(file.path);
        } else if (isImageFile(file.name)) {
            // 打开弹窗并显示加载状态
            onImgOpen();
            setIsImgLoading(true);
            setPreviewImgUrl(""); // 先清空旧图片

            try {
                // 获取原始 URL
                const originalUrl = getViewUrl(file.path);

                // 使用带鉴权的 fetch 获取图片 Blob
                const blob = await fetchBlobWithAuth(originalUrl);

                // 创建本地预览 URL
                const objectUrl = URL.createObjectURL(blob);
                setPreviewImgUrl(objectUrl);
            } catch (e) {
                console.error("预览图片失败", e);
                toast.error("无法加载图片预览");
                // 失败关闭弹窗
                onImgChange();
            } finally {
                setIsImgLoading(false);
            }
        } else if (file.editable) {
            openEditor(file);
        } else {
            // 普通文件单击暂时不做操作
        }
    };

    // 7. 下载
    const handleDownload = async (file: FileItem) => {
        const toastId = toast.loading("正在准备下载...");
        try {
            const downloadUrl = getDownloadUrl(file.path);

            // 使用带鉴权的 fetch 获取文件 Blob
            const blob = await fetchBlobWithAuth(downloadUrl);

            // 创建下载链接
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.name; // 强制指定文件名
            document.body.appendChild(link);
            link.click();

            // 清理
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("下载开始", { id: toastId });
        } catch (e) {
            console.error("下载失败", e);
            toast.error("下载失败，请检查权限或网络", { id: toastId });
        }
    };

    // 8. 路径回退逻辑
    const handleGoUp = () => {
        if (!currentPath || currentPath === "/") return;
        // 简单处理：根据分隔符截取
        // Windows: D:\project\src -> D:\project
        // Linux: /var/www/html -> /var/www
        const separator = currentPath.includes("/") ? "/" : "\\";
        const lastIndex = currentPath.lastIndexOf(separator);

        if (lastIndex <= 0) {
            // 如果只剩根目录 (如 D:\ 或 /)
            setCurrentPath(""); // 空字符串代表列出根驱动器
        } else {
            setCurrentPath(currentPath.substring(0, lastIndex));
        }
    };

    return (
        <div className="flex flex-col h-full gap-4 px-6 pb-4">
            {/* 顶部路径栏 */}
            <Card className="bg-white/80 border-none shadow-sm flex-none">
                <CardBody className="py-2 px-4 flex flex-row items-center gap-2">
                    <Button isIconOnly size="sm" variant="light" onPress={handleGoUp} isDisabled={!currentPath}>
                        <CornerUpLeft size={18}/>
                    </Button>
                    <Input
                        size="sm"
                        value={inputPath}
                        onValueChange={setInputPath}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') setCurrentPath(inputPath);
                        }}
                        placeholder="输入路径按回车跳转..."
                        startContent={<span className="text-pink-400 mr-1">/</span>}
                        className="flex-1"
                        classNames={{inputWrapper: "bg-gray-100/50 hover:bg-gray-100"}}
                    />
                </CardBody>
            </Card>

            {/* 工具栏 */}
            <div className="flex gap-2">
                <Button
                    className="bg-pink-400 text-white font-bold"
                    startContent={<FilePlus size={18}/>}
                    onPress={() => {
                        setCreateType("file");
                        onCreateOpen();
                    }}
                >
                    新建文件
                </Button>
                <Button
                    className="bg-pink-400 text-white font-bold"
                    startContent={<FolderPlus size={18}/>}
                    onPress={() => {
                        setCreateType("folder");
                        onCreateOpen();
                    }}
                >
                    新建文件夹
                </Button>
                <Button
                    className="bg-blue-400 text-white font-bold min-w-0 px-4"
                    startContent={<RefreshCw size={18} className={isLoading ? "animate-spin" : ""}/>}
                    onPress={() => fetchFiles(currentPath)}
                >
                    刷新
                </Button>
            </div>

            {/* 文件列表 */}
            <Card className="bg-white/80 border-none shadow-sm flex-1 overflow-hidden">
                <CardBody className="p-0">
                    <Table
                        removeWrapper
                        aria-label="File Manager Table"
                        className="h-full overflow-auto"
                        selectionMode="none" // 改为 none 避免点击行就选中
                        color="secondary"
                        isHeaderSticky
                        sortDescriptor={sortDescriptor}
                        onSortChange={setSortDescriptor}
                    >
                        <TableHeader>
                            <TableColumn key="name" allowsSorting>名称</TableColumn>
                            <TableColumn key="date" allowsSorting>修改时间</TableColumn>
                            <TableColumn key="size" allowsSorting>大小</TableColumn>
                            <TableColumn width={120} align="center">操作</TableColumn>
                        </TableHeader>
                        <TableBody
                            items={sortedItems}
                            loadingContent={<Spinner label="加载中..." color="secondary"/>}
                            isLoading={isLoading}
                            emptyContent={"暂无文件"}
                        >
                            {(file) => (
                                <TableRow key={file.id}
                                          className={`
                                            ${file.type !== 'folder' || file.editable ? 'cursor-pointer hover:bg-muted/50' : ''} 
                                            transition-colors
                                        `}>
                                    <TableCell>
                                        {/* 点击名称区域触发进入文件夹/预览 */}
                                        <div
                                            className="flex items-center gap-3 w-full h-full py-2 select-none"
                                            onClick={() => handleRowClick(file)}
                                        >
                                            {file.type === 'folder' ? (
                                                <FolderOpen size={20}
                                                            className="text-yellow-500 fill-yellow-500 flex-shrink-0"/>
                                            ) : isImageFile(file.name) ? (
                                                <ImageIcon size={20} className="text-purple-400 flex-shrink-0"/>
                                            ) : (
                                                <FileText size={20} className="text-gray-400 flex-shrink-0"/>
                                            )}
                                            <span className="text-gray-700 font-medium truncate">{file.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell
                                        className="text-gray-500 text-sm whitespace-nowrap">{file.date}</TableCell>
                                    <TableCell
                                        className="text-gray-500 text-sm whitespace-nowrap">{file.size}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2 justify-center">
                                            {/* 编辑按钮：仅文件可用 */}
                                            {file.editable && (
                                                <Button isIconOnly size="sm" variant="light"
                                                        onPress={() => openEditor(file)}>
                                                    <Pencil size={16} className="text-blue-400 hover:text-blue-600"/>
                                                </Button>
                                            )}

                                            {/* 下载按钮：仅文件可用 */}
                                            {file.type === 'file' && (
                                                <Button isIconOnly size="sm" variant="light"
                                                        onPress={() => handleDownload(file)}>
                                                    <Download size={16}
                                                              className="text-green-500 hover:text-green-700"/>
                                                </Button>
                                            )}

                                            {/* 删除按钮 */}
                                        <Button isIconOnly size="sm" variant="light"
                                        onPress={() => handleDeleteClick(file)}>
                                        <Trash2 size={16} className="text-red-400 hover:text-red-600"/>
                                    </Button>
                                </div>
                                </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {/* --- 弹窗组件区域 --- */}

            {/* 1. 新建弹窗 */}
            <Modal isOpen={isCreateOpen} onOpenChange={onCreateChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>新建{createType === 'folder' ? '文件夹' : '文件'}</ModalHeader>
                            <ModalBody>
                                <Input
                                    autoFocus
                                    label="名称"
                                    placeholder={`请输入${createType === 'folder' ? '文件夹' : '文件'}名称`}
                                    value={newItemName}
                                    onValueChange={setNewItemName}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>取消</Button>
                                <Button color="secondary" onPress={() => handleCreate(onClose)}>确定</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* 2. 编辑器弹窗 */}
            <Modal isOpen={isEditOpen} onOpenChange={onEditChange} size="5xl" scrollBehavior="inside">
                <ModalContent className="h-[80vh]">
                    {(onClose) => (
                        <>
                            <ModalHeader className="border-b">正在编辑: {editingFile?.name}</ModalHeader>
                            <ModalBody className="p-0 flex-1 bg-[#1e1e1e]">
                                {/* 简易代码编辑器外观 */}
                                <textarea
                                    className="w-full h-full bg-transparent text-gray-200 p-4 font-mono text-sm outline-none resize-none"
                                    value={editorContent}
                                    onChange={(e) => setEditorContent(e.target.value)}
                                    spellCheck={false}
                                />
                            </ModalBody>
                            <ModalFooter className="border-t">
                                <Button variant="light" onPress={onClose}>关闭</Button>
                                <Button color="secondary" onPress={() => handleSaveContent(onClose)}>保存更改</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* 3. 图片预览弹窗 */}
            <Modal isOpen={isImgOpen} onOpenChange={onImgChange} size="2xl">
                <ModalContent>
                    {() => (
                        <>
                            <ModalBody className="flex justify-center items-center p-4 min-h-[300px]">
                                {isImgLoading ? (
                                    <Spinner size="lg" color="secondary" label="正在加载图片..." />
                                ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={previewImgUrl}
                                        alt="preview"
                                        className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                                        // Modification 4: 移除了 onLoad 中的 revokeObjectURL，
                                        // 交给了上面的 useEffect 处理，这样更安全。
                                    />
                                )}
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>


            {/* 4. 删除确认弹窗 */}
            <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteChange} backdrop="blur">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">确认删除</ModalHeader>
                            <ModalBody>
                                <p>
                                    你确定要删除
                                    <span className="font-bold text-red-500 mx-1">
                                        {fileToDelete?.name}
                                    </span>
                                    吗？
                                </p>
                                <p className="text-sm text-gray-500">
                                    此操作无法撤销，文件将被永久移除。
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    取消
                                </Button>
                                <Button
                                    color="danger"
                                    onPress={handleConfirmDelete}
                                    isLoading={isDeleting} // 显示转圈圈
                                >
                                    确认删除
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
