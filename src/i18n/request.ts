// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // 🟢 显式提供安全的默认语言，防止 locale 意外传入 undefined 或不合法字符串
  const currentLocale = locale || 'zh';

  return {
    // 🟢 显式指定 .default 规避 TypeScript 的模块解析警告
    locale: currentLocale,
    messages: (await import(`../messages/${currentLocale}.json`)).default
  };
});