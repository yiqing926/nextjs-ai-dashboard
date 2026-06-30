import "./globals.css";

// src/app/[locale]/layout.tsx
import {NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // 🟢 强类型定义
}

export default async function LocaleLayout({children, params}: LayoutProps) {
  const { locale } = await params;
  
  // 如果用户输入的语言不在支持的列表里，直接报 404
  if (!['en', 'zh'].includes(locale)) notFound();


  let messages;
    // 降级兜底：万一路径不对，尝试从当前同级或邻近目录去撞
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (err) {
    console.error("未能找到语言包，请检查 messages 文件夹位置", err);
    messages = {};
  }

  return (
    <html lang={locale}>
      <body>
        {/* 用 Provider 包裹，确保 Client 端的组件也能直接用翻译 */}
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}