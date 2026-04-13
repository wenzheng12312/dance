const mock = require('../../utils/mock.js');
const auth = require('../../utils/auth.js');
const app = getApp();

Page({
  data: {
    userName: '',
    courseList: []
  },

  onLoad: function () {
    // 1. 设置用户昵称
    const userInfo = auth.getUserInfo();
    this.setData({ userName: userInfo.name });
    
    // 2. 加载课程列表
    this.loadCourseList();
  },

  /**
   * 加载课程列表数据
   */
  loadCourseList: async function() {
    wx.showLoading({ title: '加载中...' });
    
    const res = await mock.getCourseList();
    
    wx.hideLoading();
    
    if (res.success) {
      this.setData({ courseList: res.data });
    }
  },

  /**
   * 跳转到视频播放页
   */
  goToVideo: function(e) {
    const courseId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/video-player/video-player?id=${courseId}`
    });
  },

  /**
   * 退出登录
   */
  handleLogout: function() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          auth.logout();
          wx.reLaunch({ url: '/pages/login/login' });
        }
      }
    });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function() {
    this.loadCourseList().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});