# Winefox Bot WebUI

这是一个为 Winefox Bot 量身打造的现代化Web用户界面，旨在提供一个直观、高效的方式来管理和监控您的BOT。

## ✨ 功能特性

*   **实时监控**: 在主控台页面实时查看BOT的运行日志和状态。
*   **多标签页管理**: 仿VSCode的标签页设计，轻松管理多个BOT或任务。
*   **响应式设计**: 无论是桌面还是移动设备，都能获得良好的使用体验。
*   **可定制化**: 基于现代前端技术栈（Next.js, React, TailwindCSS），易于扩展和定制。
*   **安全的登录**: 通过专属登录页面确保只有授权用户才能访问。

## 📸 页面截图

### 1. 登录页面 (`/login`)

用户通过此页面访问WebUI。简洁明了的设计，聚焦于安全验证。

![登录页面截图](https://storage.googleapis.com/generativeai-assets/project-screenshots/login.png)

### 2. 主控台页面 (`/`)

登录后，用户将进入主控台。这是核心交互界面，您可以在这里监控和管理BOT。

*   **顶部标签栏**: 轻松切换不同的BOT实例或功能模块。
*   **日志输出区**: 实时显示BOT的详细日志信息。
*   **侧边栏**: (如果设计中有) 用于导航和快速访问不同功能。

![主控台页面截图](https://storage.googleapis.com/generativeai-assets/project-screenshots/console.png)

## 🚀 快速开始

### 环境要求

*   Node.js >= 22.0.0
*   pnpm (或 npm/yarn)

### 安装与启动

1.  **克隆代码库**
    ```bash
    git clone https://github.com/FlanChanXwO/winefox-bot-webui
    cd winefox-bot-webui
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **启动开发服务器**
    ```bash
    npm run dev
    ```

    现在，您可以在浏览器中打开 `http://localhost:3000` 来访问WebUI。

## 🛠️ 技术栈

本项目的构建基于以下现代前端技术：

*   **[Next.js](https://nextjs.org/)**: React 框架，提供服务端渲染、静态站点生成等能力。
*   **[React](https://react.dev/)**: 用于构建用户界面的JavaScript库。
*   **[Tailwind CSS](https://tailwindcss.com/)**: 一个功能类优先的CSS框架，用于快速构建自定义设计。
*   **[TypeScript](https://www.typescriptlang.org/)**: 为JavaScript添加了类型系统，增强了代码的可维护性。
*   **[Aceternity UI](https://ui.aceternity.com/)** & **[NextUI](https://nextui.org/)**: 精美的React组件库，用于快速构建高质量的界面。

## 🤝 参与贡献
欢迎提交 [Pull Request](https://github.com/FlanChanXwO/winefox-bot-webui/pulls) 或 [Issue](https://github.com/FlanChanXwO/winefox-bot-webui/issues)！

## 📄 开源协议
[GNU Affero General Public License v3.0](https://github.com/FlanChanXwO/winefox-bot-webui/blob/main/LICENSE)
