const mock = require('../../utils/mock.js');

Page({
  data: {
    actions: [],
    activeActionId: null,
    selectedAction: null,
    uploadedVideo: null,
    result: null,
    isAnalyzing: false
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
        uploadedVideo: null,
        result: null
      });
    }
  },

  selectAction: function(e) {
    const id = e.currentTarget.dataset.id;
    const selectedAction = this.data.actions.find(item => String(item.id) === String(id));
    if (!selectedAction) {
      return;
    }

    this.setData({
      activeActionId: selectedAction.id,
      selectedAction,
      result: null
    });
  },

  recordVideo: function() {
    this.chooseVideo(['camera']);
  },

  uploadVideo: function() {
    this.chooseVideo(['album']);
  },

  chooseVideo: function(sourceType) {
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType,
      maxDuration: 60,
      camera: 'back',
      success: (res) => {
        const file = res.tempFiles && res.tempFiles[0];
        if (!file) {
          return;
        }

        this.setData({
          uploadedVideo: {
            tempFilePath: file.tempFilePath,
            size: file.size,
            duration: file.duration || 0,
            source: sourceType[0],
            name: sourceType[0] === 'camera' ? '手机录制视频' : '本地上传视频'
          },
          result: null
        });
      },
      fail: () => {
        wx.showToast({ title: '未选择视频', icon: 'none' });
      }
    });
  },

  analyzeVideo: async function() {
    if (!this.data.selectedAction) {
      wx.showToast({ title: '请先选择动作', icon: 'none' });
      return;
    }

    if (!this.data.uploadedVideo) {
      wx.showToast({ title: '请先录制或上传视频', icon: 'none' });
      return;
    }

    if (this.data.isAnalyzing) {
      return;
    }

    this.setData({ isAnalyzing: true, result: null });
    wx.showLoading({ title: '生成建议中...' });

    const res = await mock.getCoachSuggestions(this.data.selectedAction.id, this.data.uploadedVideo);

    wx.hideLoading();
    this.setData({
      isAnalyzing: false,
      result: res.success ? res.data : null
    });

    if (res.success) {
      wx.showToast({ title: '建议已生成', icon: 'success' });
    }
  }
});
