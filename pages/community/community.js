const mock = require('../../utils/mock.js');
const auth = require('../../utils/auth.js');

Page({
  data: {
    tabs: [
      { type: 'all', name: '全部' },
      { type: 'share', name: '经验分享' },
      { type: 'remote', name: '远程指导' },
      { type: 'research', name: '教研记录' }
    ],
    activeType: 'all',
    posts: [],
    userName: '老师',
    role: 'student',
    roleName: '学生'
  },

  onLoad: function() {
    const userInfo = auth.getUserInfo() || {};
    this.setData({
      userName: userInfo.name || '老师',
      role: userInfo.role || 'student',
      roleName: userInfo.roleName || '学生'
    });
    this.loadPosts();
  },

  selectTab: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ activeType: type });
    this.loadPosts(type);
  },

  loadPosts: async function(type) {
    wx.showLoading({ title: '加载中...' });
    const res = await mock.getCommunityPosts(type || this.data.activeType);
    wx.hideLoading();

    if (res.success) {
      this.setData({ posts: res.data });
    }
  },

  publishPost: async function() {
    if (this.data.role !== 'teacher') {
      wx.showModal({
        title: '暂无发言权限',
        content: '学生账号可以浏览教师社区内容，但暂不能发布教研动态。',
        showCancel: false
      });
      return;
    }

    const res = await mock.publishCommunityPost({
      type: this.data.activeType === 'all' ? 'share' : this.data.activeType,
      title: '本地发布：课堂共创复盘',
      author: this.data.userName,
      summary: '这是一条演示发布内容，已保存到本机微信缓存，重新进入社区仍会显示。'
    });

    if (res.success) {
      wx.showToast({ title: '发布成功', icon: 'success' });
      this.loadPosts(this.data.activeType);
    }
  }
});
