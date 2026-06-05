const mock = require('../../utils/mock.js');

Page({
  data: {
    units: [],
    selectedUnits: [],
    pieceName: '',
    savedCount: 0
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
    if (!unit) {
      return;
    }

    const selectedUnits = this.data.selectedUnits.concat(Object.assign({}, unit, {
      key: `${unit.id}-${Date.now()}-${this.data.selectedUnits.length}`
    }));

    this.setData({
      selectedUnits,
      pieceName: this.createPieceName(selectedUnits)
    });
  },

  clearPiece: function() {
    this.setData({
      selectedUnits: [],
      pieceName: ''
    });
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
