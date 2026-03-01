# KMAT — Korean Meeting AI Translator

韩语会议 AI 实时翻译工具。通过浏览器语音识别捕获韩语发言，调用 Claude AI 实时翻译为中文或英文，并提供书签、摘要、术语表等辅助功能。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **AI**: Anthropic Claude 3 Haiku
- **语音识别**: Web Speech API（需 Chrome 浏览器）
- **存储**: localStorage

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local，填入你的 Anthropic API Key

# 3. 启动开发服务器
npm run dev
```

打开 http://localhost:3000 即可使用。

## 功能

- **实时翻译**: 韩语语音 → 中文/英文文字，双栏实时显示
- **会议管理**: 开始/暂停/结束会议，自动计时
- **书签**: 录音中随时标记重要段落（星标/问题/置顶）
- **会议摘要**: 结束会议时自动生成 AI 摘要（要点/决定/待办）
- **完整记录**: 查看带时间戳的双语逐段记录
- **术语表**: 添加领域专用术语，提升翻译准确度
- **设置**: 切换目标语言、调整字号、暗色/亮色主题
- **导出**: 一键复制摘要为 Markdown

## 项目结构

```
app/
├── api/
│   ├── translate/route.ts    # 翻译 API
│   └── summary/route.ts      # 摘要生成 API
├── components/
│   ├── NavHeader.tsx          # 导航栏
│   ├── BookmarkFAB.tsx        # 书签浮动按钮
│   ├── BookmarkBadge.tsx      # 书签类型图标
│   ├── SummaryCard.tsx        # 摘要卡片
│   └── ThemeProvider.tsx      # 主题切换
├── lib/
│   └── storage.ts             # localStorage 工具
├── bookmarks/page.tsx         # 书签页
├── glossary/page.tsx          # 术语表页
├── settings/page.tsx          # 设置页
├── summary/page.tsx           # 摘要页
├── transcript/page.tsx        # 记录页
├── page.tsx                   # 会议主页
├── layout.tsx                 # 根布局
├── globals.css                # 全局样式
└── types.ts                   # 类型定义
```
