const mock = require('../../utils/mock.js');

const FRAME_COUNT = 12;
const FRAME_INTERVAL = 180;

function buildFrames(frameDir) {
  const frames = [];
  for (let i = 1; i <= FRAME_COUNT; i += 1) {
    const index = i < 10 ? `0${i}` : `${i}`;
    frames.push(`${frameDir}/frame-${index}.jpg`);
  }
  return frames;
}

Page({
  data: {
    units: [],
    selectedUnits: [],
    pieceName: '',
    savedCount: 0,
    outputReady: false,
    isPlayingSequence: false,
    currentClipIndex: 0,
    currentFrameIndex: 0,
    previewFrameUrl: '',
    previewUnitName: '',
    videoError: ''
  },

  onLoad: function() {
    const savedPieces = wx.getStorageSync('dance_creative_pieces') || [];
    this.setData({ savedCount: savedPieces.length });
    this.loadUnits();
  },

  onUnload: function() {
    this.stopFrameTimer();
  },

  loadUnits: async function() {
    wx.showLoading({ title: '加载中...' });
    const res = await mock.getCreativeUnits();
    wx.hideLoading();

    if (res.success) {
      const units = res.data.map(item => Object.assign({}, item, {
        frames: buildFrames(item.frameDir)
      }));
      this.setData({ units });
    }
  },

  addUnit: function(e) {
    const id = e.currentTarget.dataset.id;
    const unit = this.data.units.find(item => String(item.id) === String(id));
    if (!unit) {
      return;
    }

    const selectedUnits = this.data.selectedUnits.concat(Object.assign({}, unit, {
      key: `${unit.id}-${Date.now()}-${this.data.selectedUnits.length}`
    }));

    this.stopFrameTimer();
    this.setData({
      selectedUnits,
      pieceName: this.createPieceName(selectedUnits),
      outputReady: false,
      isPlayingSequence: false,
      currentClipIndex: 0,
      currentFrameIndex: 0,
      previewFrameUrl: '',
      previewUnitName: '',
      videoError: ''
    });
  },

  clearPiece: function() {
    this.stopFrameTimer();
    this.setData({
      selectedUnits: [],
      pieceName: '',
      outputReady: false,
      isPlayingSequence: false,
      currentClipIndex: 0,
      currentFrameIndex: 0,
      previewFrameUrl: '',
      previewUnitName: '',
      videoError: ''
    });
  },

  generateVideo: function() {
    if (this.data.selectedUnits.length === 0) {
      wx.showToast({ title: '请先选择动作单元', icon: 'none' });
      return;
    }

    this.playClipAt(0);
    wx.showToast({ title: '已生成片段预览', icon: 'success' });
  },

  playClipAt: function(index) {
    const unit = this.data.selectedUnits[index];
    if (!unit || !unit.frames || unit.frames.length === 0) {
      this.stopFrameTimer();
      this.setData({
        isPlayingSequence: false,
        videoError: '当前动作没有可播放的帧素材'
      });
      return;
    }

    this.stopFrameTimer();
    this.setData({
      outputReady: true,
      isPlayingSequence: true,
      currentClipIndex: index,
      currentFrameIndex: 0,
      previewFrameUrl: unit.frames[0],
      previewUnitName: unit.name,
      videoError: ''
    });

    this.startFrameTimer();
  },

  startFrameTimer: function() {
    this.stopFrameTimer();
    this.frameTimer = setInterval(() => {
      this.advanceFrame();
    }, FRAME_INTERVAL);
  },

  stopFrameTimer: function() {
    if (this.frameTimer) {
      clearInterval(this.frameTimer);
      this.frameTimer = null;
    }
  },

  advanceFrame: function() {
    const unit = this.data.selectedUnits[this.data.currentClipIndex];
    if (!unit || !unit.frames) {
      this.stopFrameTimer();
      this.setData({ isPlayingSequence: false });
      return;
    }

    const nextFrameIndex = this.data.currentFrameIndex + 1;
    if (nextFrameIndex < unit.frames.length) {
      this.setData({
        currentFrameIndex: nextFrameIndex,
        previewFrameUrl: unit.frames[nextFrameIndex]
      });
      return;
    }

    const nextClipIndex = this.data.currentClipIndex + 1;
    if (nextClipIndex < this.data.selectedUnits.length) {
      this.playClipAt(nextClipIndex);
      return;
    }

    this.stopFrameTimer();
    this.setData({ isPlayingSequence: false });
    wx.showToast({ title: '片段播放完成', icon: 'none' });
  },

  replayVideo: function() {
    if (this.data.selectedUnits.length === 0) {
      wx.showToast({ title: '请先选择动作单元', icon: 'none' });
      return;
    }
    this.playClipAt(0);
  },

  savePiece: async function() {
    if (this.data.selectedUnits.length === 0) {
      wx.showToast({ title: '请先选择动作单元', icon: 'none' });
      return;
    }

    const res = await mock.saveCreativePiece({
      name: this.data.pieceName,
      units: this.data.selectedUnits.map(item => item.name),
      frameDirs: this.data.selectedUnits.map(item => item.frameDir)
    });

    if (res.success) {
      this.setData({
        savedCount: this.data.savedCount + 1
      });
      wx.showToast({ title: '作品已保存', icon: 'success' });
    }
  },

  createPieceName: function(units) {
    const names = units.slice(0, 3).map(item => item.name).join('');
    return `${names}共创片段`;
  }
});
