const mock = require('../../utils/mock.js');
const auth = require('../../utils/auth.js');

Page({
  data: {
    userName: '',
    role: 'student',
    roleName: '学生',
    resourceList: [],
    activeType: 'all',
    keyword: '',
    categories: [
      { type: 'all', name: '全部' },
      { type: 'lesson', name: '教案' },
      { type: 'video', name: '分解视频' },
      { type: 'courseware', name: '课件模板' }
    ]
  },

  onLoad: function () {
    const userInfo = auth.getUserInfo() || {};
    this.setData({
      userName: userInfo.name || '同学',
      role: userInfo.role || 'student',
      roleName: userInfo.roleName || '学生'
    });
    this.loadResourceList();
  },

  /**
   * 加载备课资源数据
   */
  loadResourceList: async function() {
    wx.showLoading({ title: '加载中...' });

    const res = await mock.getResourceList(this.data.activeType, this.data.keyword);

    wx.hideLoading();

    if (res.success) {
      this.setData({ resourceList: res.data });
    }
  },

  /**
   * 切换资源分类
   */
  selectCategory: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ activeType: type });
    this.loadResourceList();
  },

  /**
   * 搜索资源
   */
  onKeywordInput: function(e) {
    this.setData({ keyword: e.detail.value });
    this.loadResourceList();
  },

  /**
   * 打开资源
   */
  openResource: function(e) {
    const id = e.currentTarget.dataset.id;
    const type = e.currentTarget.dataset.type;
    if (type !== 'video') {
      wx.navigateTo({
        url: `/pages/resource-detail/resource-detail?id=${id}`
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/video-player/video-player?id=${id}`
    });
  },

  /**
   * 一键调用资源
   */
  useResource: function(e) {
    const id = e.currentTarget.dataset.id;
    const resource = this.data.resourceList.find(item => String(item.id) === String(id));
    if (!resource) {
      return;
    }

    mock.useResource(resource).then(() => {
      wx.showToast({
        title: this.data.role === 'teacher' ? '已加入备课记录' : '已加入学习记录',
        icon: 'success'
      });
    });
  },

  /**
   * 返回首页
   */
  goHome: function() {
    wx.navigateBack();
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function() {
    this.loadResourceList().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});
