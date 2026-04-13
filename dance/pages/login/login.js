// 引入Mock接口和登录工具
const mock = require('../../utils/mock.js');
const auth = require('../../utils/auth.js');
const app = getApp();

Page({
  data: {
    studentId: '', // 输入的学号
    password: '',  // 输入的密码
    isLoading: false // 登录按钮loading状态
  },

  /**
   * 监听学号输入
   */
  onStudentIdInput: function(e) {
    this.setData({ studentId: e.detail.value });
  },

  /**
   * 监听密码输入
   */
  onPasswordInput: function(e) {
    this.setData({ password: e.detail.value });
  },

  /**
   * 处理登录点击
   */
  handleLogin: async function() {
    // 1. 简单的前端校验
    if (!this.data.studentId || !this.data.password) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    // 2. 显示loading
    this.setData({ isLoading: true });

    // 3. 调用Mock登录接口
    const res = await mock.login(this.data.studentId, this.data.password);
    
    // 4. 关闭loading
    this.setData({ isLoading: false });

    // 5. 处理登录结果
    if (res.success) {
      // 保存登录状态
      auth.setLoginInfo(res.data);
      // 更新全局用户信息
      app.globalData.userInfo = res.data;
      
      wx.showToast({ title: '登录成功', icon: 'success' });
      
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        wx.reLaunch({ url: '/pages/course-list/course-list' });
      }, 1000);
    } else {
      wx.showToast({ title: res.message, icon: 'none' });
    }
  }
});