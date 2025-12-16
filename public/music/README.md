# 背景音乐说明

## 如何添加背景音乐

1. 将你的音乐文件（MP3格式）放到这个文件夹中
2. 重命名为 `christmas-bgm.mp3` 或者修改 `App.tsx` 中的文件名

## 推荐音乐格式

- **格式**: MP3
- **比特率**: 128-192 kbps（避免文件过大）
- **时长**: 2-5分钟（会自动循环播放）

## 更换音乐步骤

### 方法一：直接替换（推荐）
1. 准备好你的音乐文件（MP3格式）
2. 重命名为 `christmas-bgm.mp3`
3. 复制到 `public/music/` 文件夹
4. 刷新网页即可

### 方法二：修改代码
1. 将音乐文件放到 `public/music/` 文件夹，例如 `my-song.mp3`
2. 打开 `App.tsx` 文件
3. 找到这一行：
   ```tsx
   <MusicControl audioSrc="/music/christmas-bgm.mp3" />
   ```
4. 修改为：
   ```tsx
   <MusicControl audioSrc="/music/my-song.mp3" />
   ```
5. 保存并刷新网页

## 免费圣诞音乐资源

- [YouTube Audio Library](https://www.youtube.com/audiolibrary)
- [Incompetech](https://incompetech.com/music/royalty-free/)
- [Free Music Archive](https://freemusicarchive.org/)
- [Pixabay Music](https://pixabay.com/music/)

**注意**: 使用音乐前请确认版权和使用许可。
