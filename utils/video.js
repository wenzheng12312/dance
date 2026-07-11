/**
 * 视频地址工具
 * 统一把数据库/Mock 返回的 videoUrl 转成 video 组件可直接播放的地址。
 */

/**
 * 将微信云存储 fileID 转换为临时 HTTPS 地址。
 * @param {string} videoUrl 数据库保存的视频地址，可能是 cloud:// 或 http(s)
 * @returns {Promise<string>} video 组件可用的视频地址
 */
function convertVideoUrl(videoUrl) {
  return new Promise(function(resolve, reject) {
    if (!videoUrl) {
      reject(new Error('视频地址为空'));
      return;
    }

    // 已经是 HTTP/HTTPS 地址，直接给 video 组件使用。
    if (/^https?:\/\//.test(videoUrl)) {
      resolve(videoUrl);
      return;
    }

    // 微信云存储 fileID 需要通过云函数换成临时 HTTPS 地址。
    // 不能在客户端直接 getTempFileURL，否则“仅创建者可读”权限下会 STORAGE_EXCEED_AUTHORITY。
    if (videoUrl.indexOf('cloud://') === 0) {
      if (typeof wx === 'undefined' || !wx.cloud || !wx.cloud.callFunction) {
        reject(new Error('当前环境未初始化微信云开发，无法转换云存储视频地址'));
        return;
      }

      wx.cloud.callFunction({
        name: 'getVideoUrl',
        data: { videoUrl: videoUrl }
      }).then(function(res) {
        var result = res.result || {};
        if (result.success && result.data && result.data.videoUrl) {
          resolve(result.data.videoUrl);
        } else {
          reject(new Error(result.message || '云存储视频地址转换失败'));
        }
      }).catch(function(err) {
        console.error('转换云存储视频地址失败：', err);
        reject(err);
      });
      return;
    }

    // 其他格式保持兼容，直接返回给调用方，由页面错误处理提示用户。
    resolve(videoUrl);
  });
}

module.exports = {
  convertVideoUrl: convertVideoUrl
};
