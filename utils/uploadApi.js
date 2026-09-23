/**
 * 云存储上传工具类
 * 统一封装文件上传到微信云存储的逻辑
 */

/**
 * 基础上传方法
 * @param {string} filePath 本地临时文件路径
 * @param {string} cloudPath 云存储目标路径
 * @returns {Promise<string>} resolve 返回 fileID
 */
function uploadFile(filePath, cloudPath) {
  return new Promise((resolve, reject) => {
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath,
      success: (res) => {
        resolve(res.fileID);
      },
      fail: (err) => {
        console.error('上传失败：', err);
        reject(err);
      }
    });
  });
}

/**
 * 生成唯一文件名
 */
function generateFileName(ext) {
  return Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '.' + ext;
}

module.exports = {

  /**
   * 上传用户头像
   * @param {string} filePath 本地临时文件路径
   * @returns {Promise<string>} resolve 返回 fileID
   */
  uploadAvatar: function (filePath) {
    const cloudPath = 'avatar/' + generateFileName('png');
    return uploadFile(filePath, cloudPath);
  },

  /**
   * 上传课程封面
   * @param {string} filePath 本地临时文件路径
   * @returns {Promise<string>} resolve 返回 fileID
   */
  uploadCourseCover: function (filePath) {
    const cloudPath = 'course/cover/' + generateFileName('png');
    return uploadFile(filePath, cloudPath);
  },

  /**
   * 上传课程视频
   * @param {string} filePath 本地临时文件路径
   * @returns {Promise<string>} resolve 返回 fileID
   */
  uploadCourseVideo: function (filePath) {
    const cloudPath = 'course/video/' + generateFileName('mp4');
    return uploadFile(filePath, cloudPath);
  },

  /**
   * 上传 AI 动作陪练视频
   * @param {string} filePath 本地临时视频路径
   * @returns {Promise<string>} resolve 返回 cloud:// fileID
   */
  uploadDanceVideo: function (filePath) {
    const pathWithoutQuery = String(filePath || '').split('?')[0];
    const matched = pathWithoutQuery.match(/\.([a-zA-Z0-9]+)$/);
    const ext = matched ? matched[1].toLowerCase() : 'mp4';
    const cloudPath = 'ai-coach/video/' + generateFileName(ext);
    return uploadFile(filePath, cloudPath);
  },

  /**
   * 删除云存储文件（尽力清理，不抛异常）
   * @param {string} fileID 云存储 fileID
   * @returns {Promise} resolve 表示清理完成（无论成功失败）
   */
  deleteFile: function (fileID) {
    return new Promise(function (resolve) {
      if (!fileID || !fileID.startsWith('cloud://')) {
        resolve();
        return;
      }
      wx.cloud.deleteFile({
        fileList: [fileID]
      }).then(function (res) {
        if (res.fileList && res.fileList[0] && res.fileList[0].status !== 0) {
          console.warn('删除文件失败：', res.fileList[0]);
        }
        resolve();
      }).catch(function (err) {
        console.warn('删除文件异常：', err);
        resolve();
      });
    });
  },

  /**
   * 将 cloud:// 文件 ID 转为临时 HTTPS 链接
   * <video> 组件不支持 cloud://，必须转换；<image> 也建议转换
   * @param {string|string[]} fileIDs 云存储 fileID 或 fileID 数组
   * @returns {Promise<object>} resolve 返回 { fileID: tempUrl } 映射
   */
  getTempUrls: function (fileIDs) {
    var ids = Array.isArray(fileIDs) ? fileIDs : [fileIDs];
    return wx.cloud.getTempFileURL({ fileList: ids }).then(function (res) {
      var map = {};
      (res.fileList || []).forEach(function (f) {
        map[f.fileID] = f.tempFileURL;
      });
      return map;
    });
  }

};
