// 引入登录状态管理工具
const auth = require('./utils/auth.js');

App({
  onLaunch: function () {
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
