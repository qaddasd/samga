/** @type {import('next').NextConfig} */
const nextConfig = {
  // Режим для деплоя на Vercel
  output: "standalone",
  // Отключаем все проверки при сборке
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Уменьшаем таймаут для ускорения сборки
  staticPageGenerationTimeout: 30,
};

module.exports = nextConfig;
