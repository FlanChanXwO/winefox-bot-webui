import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // 开启静态导出模式
  output: 'export',
  trailingSlash: true,
  // 关闭图片优化
  images: {
    unoptimized: true,
  },
  generateEtags: false,
  // 配置缓存头 (仅对 next start 启动的服务有效，Nginx 需要单独配)
  async headers() {
    return [
      {
        source: '/:path*', // 所有路径
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 这些带哈希的文件可以永久缓存
          },
        ],
      },
    ]
  },
};

export default nextConfig;
