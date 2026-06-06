const mock = require('../../utils/mock.js');

// 答辩演示用固定视频 — 无论选择什么动作组合，生成的都是此视频
const DEMO_CLOUD_FILE_ID = 'cloud://cloud1-d9gqdwuj082ecda5d.636c-cloud1-d9gqdwuj082ecda5d-1368111602/course/video/result_1.mp4';

Page({
  data: {
    units: [],
    selectedUnits: [],
    pieceName: '',
    savedCount: 0,
    outputReady: false,
    generating: false,
    demoVideoUrl: ''
  },

  onLoad: function() {
    const savedPieces = wx.getStorageSync('dance_creative_pieces') || [];
    this.setData({ savedCount: savedPieces.length });
    this.loadUnits();
  },

  loadUnits: async function() {
    wx.showLoading({ title: '加载中...' });
    const res = await mock.getCreativeUnits();
    wx.hideLoading();

    if (res.success) {
      this.setData({ units: res.data });
    }
  },

  addUnit: function(e) {
    const id = e.currentTarget.dataset.id;
    const unit = this.data.units.find(item => String(item.id) === String(id));
    if (!unit) return;

    const selectedUnits = this.data.selectedUnits.concat(Object.assign({}, unit, {
      key: `${unit.id}-${Date.now()}-${this.data.selectedUnits.length}`
    }));

    this.setData({
      selectedUnits,
      pieceName: this.createPieceName(selectedUnits),
      outputReady: false,
      generating: false,
      demoVideoUrl: ''
    });
  },

  clearPiece: function() {
    this.setData({
      selectedUnits: [],
      pieceName: '',
      outputReady: false,
      generating: false,
      demoVideoUrl: ''
    });
  },

  generateVideo: function() {
    if (this.data.selectedUnits.length === 0) {
      wx.showToast({ title: '请先选择动作单元', icon: 'none' });
      return;
    }

    this.setData({ generating: true, outputReady: true, demoVideoUrl: '' });

    var that = this;
    wx.cloud.callFunction({
      name: 'courseAdmin',
      data: { action: 'getTempUrl', data: { fileID: DEMO_CLOUD_FILE_ID } }
    }).then(function(res) {
      var result = res.result;
      console.log('云函数返回：', JSON.stringify(result));
      var tempUrl = (result && result.data) ? result.data.tempFileURL : '';

      if (!tempUrl) {
        wx.showToast({ title: '视频链接获取失败', icon: 'none' });
        that.setData({ generating: false, outputReady: false });
        return;
      }

      setTimeout(function() {
        that.setData({
          generating: false,
          demoVideoUrl: tempUrl
        });
      }, 2500);
    }).catch(function(err) {
      console.error('云函数调用失败：', err);
      wx.showToast({ title: '视频加载失败，请重试', icon: 'none' });
      that.setData({ generating: false, outputReady: false });
    });
  },

  replayVideo: function() {
    const videoCtx = wx.createVideoContext('outputVideo');
    if (videoCtx) {
      videoCtx.seek(0);
      videoCtx.play();
    }
  },

  savePiece: async function() {
    if (this.data.selectedUnits.length === 0) {
      wx.showToast({ title: '请先选择动作单元', icon: 'none' });
      return;
    }

    const res = await mock.saveCreativePiece({
      name: this.data.pieceName,
      units: this.data.selectedUnits.map(item => item.name)
    });

    if (res.success) {
      this.setData({ savedCount: this.data.savedCount + 1 });
      wx.showToast({ title: '作品已保存', icon: 'success' });
    }
  },

  createPieceName: function(units) {
    const names = units.slice(0, 3).map(item => item.name).join('');
    return `${names}共创片段`;
  }
});
