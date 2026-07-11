/**
 * 云存储视频临时链接云函数
 *
 * 说明：
 * - 客户端直接调用 wx.cloud.getTempFileURL 时，若云存储权限是“仅创建者可读”，
 *   可能返回 STORAGE_EXCEED_AUTHORITY。
 * - 云函数运行在服务端，具备管理员权限，可以为合法 fileID 生成临时 HTTPS 地址。
 */
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

/**
 * @param {object} event
 * @param {string} event.videoUrl 课程表中保存的视频地址，支持 cloud:// 或 http(s)
 * @param {string} event.fileID 兼容旧调用字段，等价于 videoUrl
 */
exports.main = async function(event) {
  const inputUrl = event.videoUrl || event.fileID || '';

  if (!inputUrl) {
    return {
      success: false,
      message: '视频地址为空',
      data: { videoUrl: '' }
    };
  }

  // 已经是 HTTPS/HTTP 地址时直接返回，保持调用方数据结构稳定。
  if (/^https?:\/\//.test(inputUrl)) {
    return {
      success: true,
      message: '视频地址无需转换',
      data: { videoUrl: inputUrl }
    };
  }

  if (inputUrl.indexOf('cloud://') !== 0) {
    return {
      success: false,
      message: '不支持的视频地址格式',
      data: { videoUrl: inputUrl }
    };
  }

  try {
    const urlRes = await cloud.getTempFileURL({
      fileList: [inputUrl]
    });
    const file = urlRes.fileList && urlRes.fileList[0];

    if (!file || !file.tempFileURL) {
      return {
        success: false,
        message: '云存储视频临时地址为空',
        data: { videoUrl: inputUrl }
      };
    }

    return {
      success: true,
      message: '获取视频临时地址成功',
      data: { videoUrl: file.tempFileURL }
    };
  } catch (err) {
    console.error('getVideoUrl 转换失败：', err);
    return {
      success: false,
      message: '获取视频临时地址失败：' + (err.message || err.errMsg || ''),
      data: { videoUrl: inputUrl }
    };
  }
};
