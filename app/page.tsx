import { redirect } from 'next/navigation';

export default function RootPage() {
  // 当用户访问根路径 '/' 时，服务器会自动将其重定向到 '/dashboard'
  redirect('/dashboard');
}