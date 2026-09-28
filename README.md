# kuaishanwuliao
## 媒体网站说明

适合手机扫码访问的静态媒体网页，可直接通过 GitHub Pages 发布。当前没有上传实际媒体。

## 发布

将本目录文件放入目标 GitHub 仓库，在 Settings → Pages 中选择 Deploy from a branch，再选择存放文件的分支及 /(root)。以 GitHub 实际显示并成功访问的网址作为二维码目标，勿使用仓库代码浏览地址。

目标网站：https://veritas123-s.github.io/kuaishanwuliao/ 。发布状态以 GitHub Pages 和实际访问结果为准。

## 添加内容

1. 将媒体上传到 media/。
2. 编辑 media.json 的 entries 数组，例如：

```json
{
  "title": "我们的影像馆",
  "entries": [
    {"id": "0121", "type": "image", "title": "合影", "src": "media/photo.jpg", "alt": "合影", "description": "在这里填写图片介绍。"},
    {"id": "0122", "type": "audio", "title": "声音记录", "src": "media/audio.mp3"},
    {"id": "0123", "type": "video", "title": "视频记录", "src": "media/video.mp4"}
  ]
}
```

以上文件名为格式示例，需实际上传对应文件后再使用。每个 id 唯一且固定，以字符串保存前导零。照片建议 JPG/PNG/WebP；音频建议 MP3；视频建议浏览器兼容的 MP4（H.264 视频、AAC 音频）。播放器不自动播放。

二维码可以指向首页，也可以指向“首页网址?id=0121”直达某条内容。印刷后保持网址和 id 不变，更新相同条目的媒体即可。附图中的二维码只是参考，并未复制或修改它们的目标。

## 托管边界

网页和媒体发布后可被公众访问，请只上传准备公开的素材。较大视频不宜直接存入 Git 仓库；可在 src 填写公开且稳定的 HTTPS 媒体直链。不要使用会过期的临时下载链接。

官方发布说明：https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
