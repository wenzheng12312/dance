// 引入登录状态管理工具
const auth = require('./utils/auth.js');

App({
  onLaunch: function () {
    // 云开发初始化（必须配置env）
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-d9gqdwuj082ecda5d',  // 👈 微信云开发环境ID！
        traceUser: true
      })
    }

    // 小程序启动时检查登录状态
    this.checkLoginStatus();
  },

  checkLoginStatus: function () {
    if (!auth.isLoggedIn()) {
      wx.reLaunch({
        url: '/pages/login/login'
      });
    }
  },

  globalData: {
    userInfo: null
  }
});