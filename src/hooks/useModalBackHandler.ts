import {useEffect, useRef} from 'react';

/**
 * 监听浏览器后退事件来关闭模态框
 * @param isOpen 模态框当前是否打开
 * @param onClose 关闭模态框的回调函数
 */
export const useModalBackHandler = (isOpen: boolean, onClose: () => void) => {
    // 使用 ref 来避免闭包陷阱，确保在事件处理中能拿到最新的 onClose
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            // 1. Modal 打开时，向历史记录推入一个状态
            // 这里使用 null 作为 state，'' 作为 title（大多数浏览器忽略），当前 URL
            window.history.pushState(null, '', window.location.href);

            // 2. 定义处理函数：当用户点击后退时触发
            const handlePopState = () => {
                // 用户按了后退键，直接调用关闭逻辑
                onCloseRef.current();
            };

            // 3. 添加监听
            window.addEventListener('popstate', handlePopState);

            // 4. 清理函数
            return () => {
                window.removeEventListener('popstate', handlePopState);
                // 注意：这里我们不做 history.back()，因为有两种情况：
                // a. 用户按后退键 -> 触发 popstate -> 组件卸载/关闭 -> 历史记录已经回退了，不需要操作。
                // b. 用户点关闭按钮 -> isOpen 变 false -> 组件重渲染。这时候需要在组件侧手动处理回退（见下方组件实现）。
            };
        }
    }, [isOpen]);
};
