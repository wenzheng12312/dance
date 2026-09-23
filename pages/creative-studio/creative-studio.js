const mock = require('../../utils/mock.js');

// 答辩演示用固定视频 — 无论选择什么动作组合，从 result_1 ~ result_5 中随机播放其一
const DEMO_VIDEO_BASE = 'cloud://cloud1-d9gqdwuj082ecda5d.636c-cloud1-d9gqdwuj082ecda5d-1368111602/course/video/';
const DEMO_VIDEO_COUNT = 5;

// 随机取一个演示视频序号，避开 excludeIndex（上次用过的那个），避免连续两次播放同一个
function pickDemoVideoIndex(excludeIndex) {
  const candidates = [];
  for (let i = 1; i <= DEMO_VIDEO_COUNT; i++) {
    if (i !== excludeIndex) {
      candidates.push(i);
    }
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

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

    // 候选顺序：先随机挑一个（避开上次用过的），拿不到链接再依次试其余几个
    const firstChoice = pickDemoVideoIndex(this.lastDemoIndex);
    const candidates = [firstChoice];
    for (let i = 1; i <= DEMO_VIDEO_COUNT; i++) {
      if (i !== firstChoice) {
        candidates.push(i);
      }
    }

    this.setData({ generating: true, outputReady: true, demoVideoUrl: '' });
    this.tryDemoVideos(candidates);
  },

  // 依次尝试候选视频，取第一个能拿到临时链接的；全部失败才提示错误
  tryDemoVideos: function(candidates) {
    const that = this;

    if (candidates.length === 0) {
      wx.showToast({ title: '视频加载失败，请重试', icon: 'none' });
      this.setData({ generating: false, outputReady: false });
      return;
    }

    const index = candidates[0];
    const fileID = `${DEMO_VIDEO_BASE}result_${index}.mp4`;

    wx.cloud.callFunction({
      name: 'courseAdmin',
      data: { action: 'getTempUrl', data: { fileID: fileID } }
    }).then(function(res) {
      const result = res.result;
      const tempUrl = (result && result.data) ? result.data.tempFileURL : '';

      if (!tempUrl) {
        // 这个视频拿不到链接（可能没上传），换下一个候选重试
        console.warn('演示视频不可用，尝试下一个：result_' + index + '.mp4');
        that.tryDemoVideos(candidates.slice(1));
        return;
      }

      that.lastDemoIndex = index;
      setTimeout(function() {
        that.setData({
          generating: false,
          demoVideoUrl: tempUrl
        });
      }, 2500);
    }).catch(function(err) {
      console.error('云函数调用失败：', err);
      that.tryDemoVideos(candidates.slice(1));
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
