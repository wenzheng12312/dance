/**
 * 登录状态管理工具 - 封装本地存储操作
 */

const TOKEN_KEY = 'dance_student_token';
const USER_KEY = 'dance_student_info';

module.exports = {
  /**
   * 保存登录状态
   * @param {object} userInfo 用户信息
   */
  setLoginInfo: function(userInfo) {
    wx.setStorageSync(TOKEN_KEY, 'mock_token_' + userInfo.id); // 模拟Token
    wx.setStorageSync(USER_KEY, userInfo);
  },

  /**
   * 判断是否已登录
   * @returns {boolean}
   */
  isLoggedIn: function() {
    return !!wx.getStorageSync(TOKEN_KEY);
  },

  /**
   * 获取当前登录用户信息
   * @returns {object}
   */
  getUserInfo: function() {
    return wx.getStorageSync(USER_KEY);
  },

  /**
   * 退出登录
   */
  logout: function() {
    wx.removeStorageSync(TOKEN_KEY);
    wx.removeStorageSync(USER_KEY);
  }
};