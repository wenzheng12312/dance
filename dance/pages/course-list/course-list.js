const dbApi = require('../../utils/dbApi.js');
const auth = require('../../utils/auth.js');
const app = getApp();

Page({
  data: {
    userName: '',
    courseList: []
  },

  onLoad: function () {
    var userInfo = auth.getUserInfo();
    this.setData({ userName: userInfo.name });
    this.loadCourseList();
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

  goToVideo: function (e) {
    var courseId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/video-player/video-player?id=' + courseId
    });
  },

  handleLogout: function () {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: function (res) {
        if (res.confirm) {
          auth.logout();
          wx.reLaunch({ url: '/pages/login/login' });
        }
      }
    });
  },

  onPullDownRefresh: function () {
    this.loadCourseList().then(function () {
      wx.stopPullDownRefresh();
    });
  }
});