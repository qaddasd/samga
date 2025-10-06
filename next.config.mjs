/** @type {import('next').NextConfig} */
const nextConfig = {
  // Отключаем строгую проверку типов и линтинг при сборке
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  // Настройка вывода в зависимости от типа сборки
  ...(process.env.BUILD_TYPE === 'static' 
    ? {
        output: 'export',
        // Обходим ограничения с изображениями для статического экспорта
        images: {
          unoptimized: true,
          remotePatterns: [
            {
              protocol: 'https',
              hostname: '**',
            },
          ],
        },
        // Исключаем API маршруты для статической сборки и настраиваем дополнительные опции
        experimental: {
          webpackBuildWorker: true,
          // Добавляем новые опции для улучшения экспорта
          clientRouterFilter: true,
          optimizePackageImports: ['@phosphor-icons/react', 'lucide-react', '@tanstack/react-query']
        },
        distDir: '.next',
        // Отключаем генерацию ETag заголовков
        generateEtags: false,
        // Отключаем trailing slash
        trailingSlash: false
      }
    : {
        // Конфигурация для обычного веб-приложения
        images: {
          domains: ['app.samga.kz'],
          remotePatterns: [
            {
              protocol: 'https',
              hostname: '**',
            },
          ],
        },
        experimental: {
          webpackBuildWorker: true,
          clientRouterFilter: true,
          optimizePackageImports: ['@phosphor-icons/react', 'lucide-react', '@tanstack/react-query']
        }
      }
  ),
  // Отключаем строгий режим для устранения предупреждений React
  reactStrictMode: false,
};

export default nextConfig; 