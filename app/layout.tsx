import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PHOTOCLINIC AI 이미지 디렉터",
  description: "포토클리닉 스타일의 병원 브랜딩 이미지 방향을 AI로 제안하고 실제 촬영 상담까지 연결합니다."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
