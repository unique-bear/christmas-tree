# 🎄 圣诞树项目部署指南

本文档将指导你如何将这个交互式圣诞树项目部署到线上。

---

## 📋 目录

1. [准备工作](#准备工作)
2. [部署到 Vercel（推荐）](#部署到-vercel推荐)
3. [部署到 Netlify](#部署到-netlify)
4. [部署到 GitHub Pages](#部署到-github-pages)
5. [更换背景音乐](#更换背景音乐)
6. [更换照片](#更换照片)
7. [常见问题](#常见问题)

---

## 准备工作

### 1. 确保项目可以本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000 确认正常运行
```

### 2. 添加背景音乐（可选）

将你的音乐文件（MP3格式）放到 `public/music/` 文件夹：

```bash
# 创建音乐文件夹（如果不存在）
mkdir -p public/music

# 复制你的音乐文件并重命名
cp /path/to/your/music.mp3 public/music/christmas-bgm.mp3
```

### 3. 添加你的照片（可选）

将你的照片放到 `public/Image/` 文件夹：

```bash
# 照片应该命名为 img1.jpeg, img2.jpeg, ... img6.jpeg
cp /path/to/photo1.jpg public/Image/img1.jpeg
cp /path/to/photo2.jpg public/Image/img2.jpeg
# ... 依此类推
```

### 4. 构建项目

```bash
npm run build
```

构建完成后，会生成 `dist` 文件夹，这就是要部署的静态文件。

---

## 部署到 Vercel（推荐）

Vercel 是最简单快速的部署方式，完全免费。

### 方法一：通过 GitHub（推荐）

1. **将项目推送到 GitHub**

```bash
# 初始化 git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 创建 GitHub 仓库后，推送代码
git remote add origin https://github.com/你的用户名/你的仓库名.git
git branch -M main
git push -u origin main
```

2. **在 Vercel 部署**

   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Deploy"

3. **完成！**
   - Vercel 会自动检测 Vite 项目并配置
   - 几分钟后，你会得到一个 `https://你的项目名.vercel.app` 的网址
   - 每次推送到 GitHub，Vercel 会自动重新部署

### 方法二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel

# 部署到生产环境
vercel --prod
```

---

## 部署到 Netlify

Netlify 也是一个优秀的免费托管平台。

### 方法一：拖拽部署

1. 构建项目：
   ```bash
   npm run build
   ```

2. 访问 [netlify.com](https://www.netlify.com)

3. 登录后，将 `dist` 文件夹拖拽到 Netlify 的部署区域

4. 完成！你会得到一个 `https://随机名称.netlify.app` 的网址

### 方法二：通过 GitHub

1. 将项目推送到 GitHub（参考 Vercel 的步骤）

2. 在 Netlify 中：
   - 点击 "New site from Git"
   - 选择 GitHub
   - 选择你的仓库
   - 配置构建设置：
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - 点击 "Deploy site"

3. 完成！每次推送到 GitHub，Netlify 会自动重新部署

---

## 部署到 GitHub Pages

GitHub Pages 是完全免费的静态网站托管服务。

### 步骤

1. **安装 gh-pages 包**

```bash
npm install --save-dev gh-pages
```

2. **修改 `package.json`**

添加以下内容：

```json
{
  "homepage": "https://你的用户名.github.io/你的仓库名",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. **修改 `vite.config.ts`**

添加 base 配置：

```typescript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/你的仓库名/',  // 添加这一行
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    // ... 其他配置
  };
});
```

4. **部署**

```bash
npm run deploy
```

5. **启用 GitHub Pages**
   - 访问你的 GitHub 仓库
   - 进入 Settings → Pages
   - Source 选择 `gh-pages` 分支
   - 保存

6. 访问 `https://你的用户名.github.io/你的仓库名`

---

## 更换背景音乐

### 方法一：直接替换文件（推荐）

1. 准备你的音乐文件（MP3格式，建议 128-192 kbps）
2. 重命名为 `christmas-bgm.mp3`
3. 替换 `public/music/christmas-bgm.mp3`
4. 重新构建并部署：
   ```bash
   npm run build
   npm run deploy  # 或推送到 GitHub
   ```

### 方法二：修改代码

1. 将音乐文件放到 `public/music/`，例如 `my-song.mp3`

2. 编辑 `App.tsx`：
   ```tsx
   // 找到这一行
   <MusicControl audioSrc="/music/christmas-bgm.mp3" />
   
   // 改为
   <MusicControl audioSrc="/music/my-song.mp3" />
   ```

3. 重新构建并部署

### 免费音乐资源

- [YouTube Audio Library](https://www.youtube.com/audiolibrary) - 免费无版权音乐
- [Incompetech](https://incompetech.com/music/royalty-free/) - 免费音乐库
- [Pixabay Music](https://pixabay.com/music/) - 免费音乐和音效

---

## 更换照片

### 步骤

1. 准备 6 张照片（JPEG 格式，建议尺寸 1024x768 或类似比例）

2. 重命名为：
   - `img1.jpeg`
   - `img2.jpeg`
   - `img3.jpeg`
   - `img4.jpeg`
   - `img5.jpeg`
   - `img6.jpeg`

3. 替换 `public/Image/` 文件夹中的文件

4. 重新构建并部署：
   ```bash
   npm run build
   npm run deploy  # 或推送到 GitHub
   ```

### 调整照片数量

如果你想使用不同数量的照片，编辑 `components/PhotoFrames.tsx`：

```tsx
// 找到这个数组
const PHOTO_URLS = [
  "/Image/img1.jpeg",
  "/Image/img2.jpeg",
  "/Image/img3.jpeg",
  "/Image/img4.jpeg",
  "/Image/img5.jpeg",
  "/Image/img6.jpeg"
];

// 添加或删除路径
```

---

## 常见问题

### Q: 部署后音乐无法播放？

**A**: 检查以下几点：
1. 音乐文件是否在 `public/music/` 文件夹中
2. 文件名是否正确（区分大小写）
3. 浏览器是否阻止了自动播放（需要用户点击播放按钮）

### Q: 部署后照片无法显示？

**A**: 检查：
1. 照片是否在 `public/Image/` 文件夹中
2. 文件扩展名是否为 `.jpeg`（不是 `.jpg`）
3. 文件名是否正确（`img1.jpeg` 到 `img6.jpeg`）

### Q: 如何自定义域名？

**A**: 
- **Vercel**: Settings → Domains → Add Domain
- **Netlify**: Site settings → Domain management → Add custom domain
- **GitHub Pages**: 在仓库根目录添加 `CNAME` 文件，内容为你的域名

### Q: 部署后页面空白？

**A**: 检查：
1. 浏览器控制台是否有错误
2. 如果使用 GitHub Pages，确保 `vite.config.ts` 中的 `base` 配置正确
3. 确保所有依赖都已安装：`npm install`

### Q: 如何更新已部署的网站？

**A**:
- **Vercel/Netlify (GitHub)**: 推送代码到 GitHub，会自动重新部署
- **手动部署**: 重新运行 `npm run build` 和部署命令
- **GitHub Pages**: 运行 `npm run deploy`

### Q: 文件太大，部署很慢？

**A**: 优化建议：
1. 压缩照片（使用 [TinyPNG](https://tinypng.com/) 或类似工具）
2. 使用较低比特率的音乐文件（128 kbps 足够）
3. 删除不需要的文件

---

## 🎉 完成！

现在你的圣诞树项目已经成功部署到线上了！

分享你的网址给朋友和家人，祝你圣诞快乐！🎄✨

---

## 📞 需要帮助？

如果遇到问题，可以：
1. 检查浏览器控制台的错误信息
2. 查看部署平台的构建日志
3. 确保本地 `npm run build` 可以成功构建

**祝部署顺利！** 🚀
