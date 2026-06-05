const dbApi = require('../../utils/dbApi.js');
const uploadApi = require('../../utils/uploadApi.js');

Page({
  data: {
    courseId: null,
    course: null
  },

  onLoad: function (options) {
    var id = options.id;
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      return;
    }
    this.setData({ courseId: id });
    this.loadCourseDetail();
  },

  loadCourseDetail: async function () {
    wx.showLoading({ title: '加载中...' });

    try {
      var res = await dbApi.getCourseDetail(this.data.courseId);
      if (!res.success) {
        wx.hideLoading();
        wx.showToast({ title: res.message || '加载失败', icon: 'none' });
        return;
      }

      var course = res.data;
      // 将 cloud:// 文件 ID 转为临时 HTTPS 链接（<video> 组件必须转换）
      var ids = [];
      if (course.videoUrl && course.videoUrl.startsWith('cloud://')) ids.push(course.videoUrl);
      if (course.cover && course.cover.startsWith('cloud://')) ids.push(course.cover);

      if (ids.length > 0) {
        var urlMap = await uploadApi.getTempUrls(ids);
        if (urlMap[course.videoUrl]) course.videoUrl = urlMap[course.videoUrl];
        if (urlMap[course.cover]) course.cover = urlMap[course.cover];
      }

      this.setData({ course: course });
      wx.setNavigationBarTitle({ title: course.title });
      wx.hideLoading();
    } catch (err) {
      wx.hideLoading();
      console.error('加载课程详情失败：', err);
      wx.showToast({ title: '加载失败，请重试', icon: 'none' });
    }
  }
});