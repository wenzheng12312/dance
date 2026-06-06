const dbApi = require('../../utils/dbApi.js');
const uploadApi = require('../../utils/uploadApi.js');
const auth = require('../../utils/auth.js');

const UPLOAD_TIMEOUT = 60000;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise(function (_, reject) {
      setTimeout(function () { reject(new Error('TIMEOUT')); }, ms);
    })
  ]);
}

Page({
  data: {
    formTitle: '',
    formDescription: '',
    formDuration: '',
    coverTempPath: '',
    coverFileID: '',
    videoTempPath: '',
    videoFileName: '',
    submitting: false
  },

  onLoad: function () {
    var userInfo = auth.getUserInfo();
    if (!userInfo || userInfo.role !== 'teacher') {
      wx.showToast({ title: '仅教师可访问', icon: 'none', duration: 2000 });
      setTimeout(function () {
        wx.reLaunch({ url: '/pages/home/home' });
      }, 2000);
    }
  },

  onTitleInput: function (e) {
    this.setData({ formTitle: e.detail.value });
  },

  onDescInput: function (e) {
    this.setData({ formDescription: e.detail.value });
  },

  onDurationInput: function (e) {
    this.setData({ formDuration: e.detail.value });
  },

  chooseCover: function () {
    if (this.data.submitting) return;
    var that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: function (res) {
        that.setData({ coverTempPath: res.tempFiles[0].tempFilePath });
      }
    });
  },

  chooseVideo: function () {
    if (this.data.submitting) return;
    var that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album'],
      success: function (res) {
        var file = res.tempFiles[0];
        if (file.size > 100 * 1024 * 1024) {
          wx.showToast({ title: '视频过大，请压缩后上传', icon: 'none' });
          return;
        }
        that.setData({
          videoTempPath: file.tempFilePath,
          videoFileName: file.tempFilePath.split('/').pop() || ''
        });
      }
    });
  },

  clearCover: function () {
    this.setData({ coverTempPath: '', coverFileID: '' });
  },

  clearVideo: function () {
    this.setData({ videoTempPath: '', videoFileName: '' });
  },

  handleSubmit: async function () {
    var d = this.data;

    if (!d.formTitle || !d.formDescription || !d.formDuration) {
      wx.showToast({ title: '请填写完整的课程信息', icon: 'none' });
      return;
    }
    if (!d.coverTempPath && !d.coverFileID) {
      wx.showToast({ title: '请选择课程封面', icon: 'none' });
      return;
    }
    if (!d.videoTempPath) {
      wx.showToast({ title: '请选择课程视频', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    wx.showLoading({ title: '上传封面中...', mask: true });

    var coverFileID = d.coverFileID;
    var videoFileID = '';

    try {
      if (d.coverTempPath) {
        coverFileID = await withTimeout(
          uploadApi.uploadCourseCover(d.coverTempPath),
          UPLOAD_TIMEOUT
        );
      }

      wx.showLoading({ title: '上传视频中...', mask: true });
      videoFileID = await withTimeout(
        uploadApi.uploadCourseVideo(d.videoTempPath),
        UPLOAD_TIMEOUT
      );

      if (!coverFileID || !coverFileID.startsWith('cloud://')) {
        throw new Error('封面上传结果异常，请重试');
      }
      if (!videoFileID || !videoFileID.startsWith('cloud://')) {
        throw new Error('视频上传结果异常，请重试');
      }

      wx.showLoading({ title: '保存中...', mask: true });
      var res = await dbApi.addCourse({
        title: d.formTitle,
        description: d.formDescription,
        duration: d.formDuration,
        coverUrl: coverFileID,
        videoUrl: videoFileID
      });

      wx.hideLoading();
      wx.showToast({ title: '上传成功', icon: 'success' });

      // 清空表单
      this.setData({
        formTitle: '',
        formDescription: '',
        formDuration: '',
        coverTempPath: '',
        coverFileID: '',
        videoTempPath: '',
        videoFileName: ''
      });

    } catch (err) {
      wx.hideLoading();
      var msg = '上传失败，请重试';
      if (err) {
        if (err.message === 'TIMEOUT') msg = '上传超时，请检查网络后重试';
        else if (err.errMsg) msg = err.errMsg;
        else if (err.message) msg = err.message;
      }
      wx.showToast({ title: msg, icon: 'none', duration: 3000 });
      console.error('上传失败：', err);
    }

    this.setData({ submitting: false });
  }
});
