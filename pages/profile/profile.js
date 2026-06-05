const auth = require('../../utils/auth.js');
const dbApi = require('../../utils/dbApi.js');
const uploadApi = require('../../utils/uploadApi.js');
const UploadBatch = require('../../utils/uploadBatch.js');

Page({
  data: {
    userName: '',
    studentId: '',
    role: '',
    avatarUrl: ''
  },

  onShow: function () {
    this.loadUserInfo();
  },

  loadUserInfo: function () {
    const userInfo = auth.getUserInfo();
    if (userInfo) {
      const avatarUrl = userInfo.avatar;
      this.setData({
        userName: userInfo.name,
        studentId: userInfo.studentId,
        role: userInfo.role,
        avatarUrl: avatarUrl
      });
    }
  },

  chooseAvatar: function () {
    const that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success(res) {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        var batch = new UploadBatch();

        wx.showLoading({ title: '上传中...' });

        uploadApi.uploadAvatar(tempFilePath)
          .then(function (fileID) {
            batch.trackUpload(fileID);

            var userInfo = auth.getUserInfo();
            var oldAvatar = userInfo.avatar;
            if (oldAvatar) {
              batch.replaceOnSuccess(oldAvatar);
            }

            return dbApi.updateUserAvatar(userInfo.id, fileID).then(function () {
              batch.commit();
              userInfo.avatar = fileID;
              auth.setLoginInfo(userInfo);
              that.setData({ avatarUrl: fileID });
              wx.hideLoading();
              wx.showToast({ title: '头像更新成功', icon: 'success' });
            });
          })
          .catch(function () {
            batch.rollback();
            wx.hideLoading();
            wx.showToast({ title: '头像上传失败，请检查网络', icon: 'none' });
          });
      }
    });
  }
});
