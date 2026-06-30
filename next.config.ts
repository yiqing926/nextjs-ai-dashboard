import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* 保持你原有的配置项不变 */
};

export default withNextIntl(nextConfig);