// 引入登录状态管理工具
const auth = require('./utils/auth.js');

App({
  onLaunch: function () {
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-d9gqdwuj082ecda5d',
        traceUser: true
      });
    } else {
      console.warn('当前基础库不支持 wx.cloud，云存储视频地址将无法自动转换。');
    }

    // 小程序启动时检查登录状态
    this.checkLoginStatus();
  },

  /**
   * 检查登录状态，未登录则跳转登录页
   */
  checkLoginStatus: function () {
    if (!auth.isLoggedIn()) {
      // 未登录，重定向到登录页（禁止返回）
      wx.reLaunch({
        url: '/pages/login/login'
      });
    } else {
      this.globalData.userInfo = auth.getUserInfo();
      wx.reLaunch({
        url: '/pages/home/home'
      });
    }
  },

  globalData: {
    userInfo: null // 全局存储用户信息
  }
});
