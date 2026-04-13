const mock = require('../../utils/mock.js');

Page({
  data: {
    courseId: null,
    course: null
  },

  onLoad: function (options) {
    // 1. 获取上一页传来的课程ID
    const id = options.id;
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      return;
    }

    this.setData({ courseId: id });
    
    // 2. 加载课程详情
    this.loadCourseDetail();
  },

  /**
   * 加载课程详情
   */
  loadCourseDetail: async function() {
    wx.showLoading({ title: '加载中...' });
    
    const res = await mock.getCourseDetail(this.data.courseId);
    
    wx.hideLoading();
    
    if (res.success) {
      this.setData({ course: res.data });
      // 动态设置导航栏标题
      wx.setNavigationBarTitle({ title: res.data.title });
    }
  }
});