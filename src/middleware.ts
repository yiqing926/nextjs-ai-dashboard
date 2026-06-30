// src/middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // 支持的语言列表
  locales: ['en', 'zh'],
  // 默认语言
  defaultLocale: 'zh'
});

export const config = {
  // 匹配所有需要国际化的路由路径，跳过 api, _next 等静态文件
  matcher: ['/', '/(de|en|zh)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};