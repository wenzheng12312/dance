const mock = require('../../utils/mock.js');
const videoUtil = require('../../utils/video.js');

Page({
  data: {
    courseId: null,
    course: null,
    videoError: ''
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

    try {
      const res = await mock.getCourseDetail(this.data.courseId);

      if (res.success && res.data) {
        const course = Object.assign({}, res.data);

        try {
          // 数据库可能保存 cloud:// fileID，这里统一转换成 video 组件可播放的 HTTPS 地址。
          course.rawVideoUrl = course.videoUrl;
          course.videoUrl = await videoUtil.convertVideoUrl(course.videoUrl);
          this.setData({ course: course, videoError: '' });
        } catch (err) {
          console.error('视频地址处理失败：', err);
          this.setData({
            course: course,
            videoError: '视频地址转换失败，请检查云存储 fileID、云开发初始化或视频域名配置。'
          });
          wx.showToast({ title: '视频地址异常', icon: 'none' });
        }

        wx.setNavigationBarTitle({ title: course.title });
      } else {
        wx.showToast({ title: res.message || '课程不存在', icon: 'none' });
      }
    } catch (err) {
      console.error('加载课程详情失败：', err);
      wx.showToast({ title: '加载课程失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 视频播放失败提示
   */
  onVideoError: function() {
    this.setData({
      videoError: '视频加载失败。当前使用远程测试视频，请在微信开发者工具中关闭域名校验，或上线前配置合法视频域名。'
    });
    wx.showToast({ title: '视频加载失败', icon: 'none' });
  }
});
