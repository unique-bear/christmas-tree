# 🎄 Arix Signature Interactive Christmas Tree

一个交互式 3D 圣诞树项目，带有照片相框、粒子效果和背景音乐。

An interactive 3D Christmas tree project with photo frames, particle effects, and background music.

## ⚠️ 常见报错 (Common Errors)

**Error 1**: `Access to script at 'file:///...' blocked by CORS policy`
**原因**: 直接双击打开了 HTML 文件。
**解决**: 必须使用本地服务器（见下方）。

**Error 2**: `Failed to load module script ... MIME type of "application/octet-stream"`
**原因**: 默认的 Python 服务器无法正确识别 `.tsx` 文件类型。
**解决**: 请使用项目中提供的 `service_2.py` 脚本启动。

---

## 1. 文件夹结构 / Folder Structure

```
/ (Project Root)
  ├── service_2.py     <-- 确保此文件存在 (Make sure this exists)
  ├── index.html
  ├── index.tsx
  ├── App.tsx
  ├── types.ts
  ├── constants.ts
  ├── components/
  │   ├── Scene.tsx
  │   └── ...
  └── public/
      └── Image/
          └── ...
```

## 2. 启动本地服务器 / Start Local Server

**请务必使用 `service_2.py`，而不是 `python -m http.server`。**
**Please use `service_2.py` instead of the default command.**

1. 打开终端 (Terminal)。
2. `cd` 进入项目根目录。
3. 运行：

```bash
# Mac / Linux
python3 service_2.py

# Windows
python service_2.py
```

4. 在浏览器打开: **`http://localhost:8000`**

## 3. 添加背景音乐 / Add Background Music

1. 将你的音乐文件（MP3格式）放到 `public/music/` 文件夹
2. 重命名为 `christmas-bgm.mp3`
3. 刷新页面，点击右上角的播放按钮

详细说明请查看 `public/music/README.md`

## 4. 使用本地图片 / Using Local Images

项目默认使用 `public/Image/` 文件夹中的本地图片（img1.jpeg 到 img6.jpeg）。
更换照片只需替换这些文件即可。

## 5. 部署到线上 / Deploy Online

查看 `DEPLOYMENT.md` 获取详细的部署指南，支持：
- ✅ Vercel（推荐）
- ✅ Netlify
- ✅ GitHub Pages

## 6. 功能特性 / Features

- 🎄 3D 交互式圣诞树
- 🖼️ 照片相框展示（支持 6 张照片）
- ✨ 粒子效果和装饰球
- 🎵 背景音乐控制（右上角开关）
- 🎨 两种模式切换（散开/树形）
- 📱 响应式设计
