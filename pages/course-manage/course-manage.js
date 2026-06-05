const dbApi = require('../../utils/dbApi.js');
const uploadApi = require('../../utils/uploadApi.js');
const UploadBatch = require('../../utils/uploadBatch.js');
const auth = require('../../utils/auth.js');
const app = getApp();

const UPLOAD_TIMEOUT = 30000;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise(function (_, reject) {
      setTimeout(function () {
        reject(new Error('TIMEOUT'));
      }, ms);
    })
  ]);
}

Page({
  data: {
    mode: 'list',
    courseList: [],

    editingId: null,
    formTitle: '',
    formDescription: '',
    formDuration: '',
    formCoverFileID: '',
    formCoverTempPath: '',
    formVideoFileID: '',
    formVideoTempPath: '',
    formVideoSize: 0,
    formSubmitting: false
  },

  onLoad: function () {
    if (!this.checkAdmin()) return;
    this.loadCourseList();
  },

  onShow: function () {
    if (!this.checkAdmin()) return;
    if (this.data.mode === 'list') {
      this.loadCourseList();
    }
  },

  onPullDownRefresh: function () {
    this.loadCourseList().then(function () {
      wx.stopPullDownRefresh();
    });
  },

  checkAdmin: function () {
    var userInfo = auth.getUserInfo();
    if (!userInfo || userInfo.role !== 'teacher') {
      wx.showToast({ title: '无教师权限', icon: 'none', duration: 2000 });
      setTimeout(function () {
        wx.reLaunch({ url: '/pages/home/home' });
      }, 2000);
      return false;
    }
    return true;
  },

  loadCourseList: async function () {
    wx.showLoading({ title: '加载中...' });
    try {
      var res = await dbApi.getCourseList();
      if (res && res.success) {
        this.setData({ courseList: res.data });
      }
    } catch (err) {
      console.error('加载课程列表失败：', err);
    }
    wx.hideLoading();
  },

  openCreateForm: function () {
    this.setData({
      mode: 'form',
      editingId: null,
      formTitle: '',
      formDescription: '',
      formDuration: '',
      formCoverFileID: '',
      formCoverTempPath: '',
      formVideoFileID: '',
      formVideoTempPath: '',
      formVideoSize: 0
    });
  },

  openEditForm: function (e) {
    var courseId = e.currentTarget.dataset.id;
    var course = this.data.courseList.find(function (c) { return c.id === courseId; });
    if (!course) return;

    this.setData({
      mode: 'form',
      editingId: courseId,
      formTitle: course.title,
      formDescription: course.description,
      formDuration: course.duration,
      formCoverFileID: course.cover,
      formCoverTempPath: '',
      formVideoFileID: course.videoUrl,
      formVideoTempPath: ''
    });
  },

  backToList: function () {
    this.setData({ mode: 'list' });
    this.loadCourseList();
  },

  // ========== 表单输入绑定 ==========

  onTitleInput: function (e) {
    this.setData({ formTitle: e.detail.value });
  },

  onDescInput: function (e) {
    this.setData({ formDescription: e.detail.value });
  },

  onDurationInput: function (e) {
    this.setData({ formDuration: e.detail.value });
  },

  // ========== 文件选择 ==========

  chooseCover: function () {
    if (this.data.formSubmitting) return;
    var that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: function (res) {
        var tempFilePath = res.tempFiles[0].tempFilePath;
        that.setData({
          formCoverTempPath: tempFilePath
        });
      }
    });
  },

  chooseVideo: function () {
    if (this.data.formSubmitting) return;
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
          formVideoTempPath: file.tempFilePath,
          formVideoSize: file.size
        });
      }
    });
  },

  // ========== 保存 ==========

  handleSave: async function () {
    var that = this;
    var d = this.data;

    if (!d.formTitle || !d.formDescription || !d.formDuration) {
      wx.showToast({ title: '请填写完整的课程信息', icon: 'none' });
      return;
    }
    if (!d.formCoverFileID && !d.formCoverTempPath) {
      wx.showToast({ title: '请选择课程封面', icon: 'none' });
      return;
    }
    if (!d.formVideoFileID && !d.formVideoTempPath) {
      wx.showToast({ title: '请选择课程视频', icon: 'none' });
      return;
    }

    this.setData({ formSubmitting: true });
    wx.showLoading({ title: '正在上传封面...', mask: true });

    var coverFileID = d.formCoverFileID;
    var videoFileID = d.formVideoFileID;
    var batch = new UploadBatch();

    try {
      if (d.formCoverTempPath) {
        coverFileID = await withTimeout(
          uploadApi.uploadCourseCover(d.formCoverTempPath),
          UPLOAD_TIMEOUT
        );
        batch.trackUpload(coverFileID);
      }

      wx.showLoading({ title: '正在上传视频...', mask: true });
      if (d.formVideoTempPath) {
        videoFileID = await withTimeout(
          uploadApi.uploadCourseVideo(d.formVideoTempPath),
          UPLOAD_TIMEOUT
        );
        batch.trackUpload(videoFileID);
      }

      if (!coverFileID || !coverFileID.startsWith('cloud://')) {
        throw new Error('封面上传结果异常，请重试');
      }
      if (!videoFileID || !videoFileID.startsWith('cloud://')) {
        throw new Error('视频上传结果异常，请重试');
      }

      if (d.editingId && d.formCoverTempPath && d.formCoverFileID) {
        batch.replaceOnSuccess(d.formCoverFileID);
      }
      if (d.editingId && d.formVideoTempPath && d.formVideoFileID) {
        batch.replaceOnSuccess(d.formVideoFileID);
      }

      wx.showLoading({ title: '正在保存...', mask: true });
      var courseData = {
        title: d.formTitle,
        description: d.formDescription,
        duration: d.formDuration,
        coverUrl: coverFileID,
        videoUrl: videoFileID
      };

      var res;
      if (d.editingId) {
        res = await dbApi.updateCourse(d.editingId, courseData);
      } else {
        res = await dbApi.addCourse(courseData);
      }

      wx.hideLoading();
      wx.showToast({ title: res.message, icon: 'success' });

      batch.commit();
      this.backToList();

    } catch (err) {
      wx.hideLoading();
      batch.rollback();

      var msg = '保存失败，请重试';
      if (err) {
        if (err.message === 'TIMEOUT') {
          msg = '上传超时，请检查网络后重试';
        } else if (err.errMsg) {
          msg = err.errMsg;
        } else if (err.message) {
          msg = err.message;
        }
      }
      wx.showToast({ title: msg, icon: 'none', duration: 3000 });
      console.error('保存课程失败：', err);
    }

    this.setData({ formSubmitting: false });
  },

  // ========== 删除 ==========

  handleDelete: function (e) {
    var courseId = e.currentTarget.dataset.id;
    var that = this;
    wx.showModal({
      title: '确认删除',
      content: '删除后将无法恢复，确定要删除该课程吗？',
      success: function (res) {
        if (res.confirm) {
          that.doDelete(courseId);
        }
      }
    });
  },

  doDelete: async function (courseId) {
    wx.showLoading({ title: '删除中...' });
    try {
      var res = await dbApi.deleteCourse(courseId);
      if (res && res.success) {
        var course = this.data.courseList.find(function (c) { return c.id === courseId; });
        if (course) {
          uploadApi.deleteFile(course.cover);
          uploadApi.deleteFile(course.videoUrl);
        }
        wx.hideLoading();
        wx.showToast({ title: '已删除', icon: 'success' });
        this.loadCourseList();
      } else {
        wx.hideLoading();
        wx.showToast({ title: (res && res.message) || '删除失败', icon: 'none' });
      }
    } catch (err) {
      wx.hideLoading();
      console.error('删除课程失败：', err);
      wx.showToast({ title: '删除失败，请重试', icon: 'none' });
    }
  }
});
