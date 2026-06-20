import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lumina Studio · 8 大蓝海赛道 · AI 原生产品矩阵",
  description: "AI 原生蓝海产品矩阵 — 灵性陪伴 · 儿童故事书 · AI 目录站 · Prompt 库，基于 240+ 实时市场数据筛选的 8 大蓝海赛道。",
  keywords: ["AI占星", "塔罗占卜", "解梦", "命理", "玄学", "AI儿童故事书", "AI目录站", "AI Prompt", "Lumina Studio", "蓝海创业"],
  authors: [{ name: "Lumina Studio" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Lumina Studio · 8 大蓝海赛道 AI 原生产品矩阵",
    description: "AI 灵性陪伴 · 儿童故事书 · AI 目录站 · Prompt 库 — 一个平台，八个蓝海",
    siteName: "Lumina Studio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumina Studio",
    description: "AI 原生蓝海产品矩阵 · 8 大赛道",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
