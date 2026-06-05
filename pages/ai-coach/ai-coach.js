const mock = require('../../utils/mock.js');

Page({
  data: {
    actions: [],
    activeActionId: null,
    selectedAction: null,
    result: null,
    isDetecting: false
  },

  onLoad: function() {
    this.loadActions();
  },

  loadActions: async function() {
    wx.showLoading({ title: '加载中...' });
    const res = await mock.getCoachActions();
    wx.hideLoading();

    if (res.success && res.data.length > 0) {
      this.setData({
        actions: res.data,
        activeActionId: res.data[0].id,
        selectedAction: res.data[0],
        result: null
      });
    }
  },

  selectAction: function(e) {
    const id = e.currentTarget.dataset.id;
    const selectedAction = this.data.actions.find(item => String(item.id) === String(id));
    this.setData({
      activeActionId: selectedAction.id,
      selectedAction,
      result: null
    });
  },

  startCoach: async function() {
    if (!this.data.selectedAction || this.data.isDetecting) {
      return;
    }

    this.setData({ isDetecting: true, result: null });
    wx.showLoading({ title: '检测中...' });

    const res = await mock.getCoachResult(this.data.selectedAction.id);

    wx.hideLoading();
    this.setData({
      isDetecting: false,
      result: res.success ? res.data : null
    });

    if (res.success) {
      wx.showToast({ title: '检测完成', icon: 'success' });
    }
  }
});
