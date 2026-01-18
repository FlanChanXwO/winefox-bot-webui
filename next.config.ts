import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // 开启静态导出模式
  output: 'export',
  // 关闭图片优化
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
