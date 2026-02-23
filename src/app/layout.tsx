import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "데이트메이트 | AI 데이트 코스 플래너",
  description: "AI가 만드는 완벽한 데이트 코스. 결정 피로는 끝, 오늘의 최적 코스를 AI가 결정해드립니다.",
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FF6B52',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased bg-neutral-50">
        <div className="mx-auto max-w-app min-h-screen bg-white relative shadow-lg">
          {children}
        </div>
      </body>
    </html>
  );
}
