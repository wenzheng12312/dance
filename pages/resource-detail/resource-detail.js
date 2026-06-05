const mock = require('../../utils/mock.js');
const auth = require('../../utils/auth.js');

Page({
  data: {
    resource: null,
    role: 'student'
  },

  onLoad: function(options) {
    const userInfo = auth.getUserInfo() || {};
    this.setData({ role: userInfo.role || 'student' });
    this.loadResource(options.id);
  },

  loadResource: async function(id) {
    if (!id) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '加载中...' });
    const res = await mock.getResourceDetail(id);
    wx.hideLoading();

    if (res.success && res.data) {
      this.setData({ resource: res.data });
      wx.setNavigationBarTitle({ title: res.data.title });
    } else {
      wx.showToast({ title: res.message || '资源不存在', icon: 'none' });
    }
  },

  useResource: async function() {
    if (!this.data.resource) {
      return;
    }

    await mock.useResource(this.data.resource);
    wx.showToast({
      title: this.data.role === 'teacher' ? '已加入备课记录' : '已加入学习记录',
      icon: 'success'
    });
  }
});
