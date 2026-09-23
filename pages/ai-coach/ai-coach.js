const mock = require('../../utils/mock.js');
const uploadApi = require('../../utils/uploadApi.js');
const videoUtil = require('../../utils/video.js');
const danceAnalyzeApi = require('../../utils/danceAnalyzeApi.js');

function getErrorMessage(error, fallback) {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  return error.message || error.errMsg || fallback;
}

Page({
  data: {
    actions: [],
    activeActionId: null,
    selectedAction: null,
    uploadedVideo: null,
    videoFileID: '',
    videoUrl: '',
    uploading: false,
    analyzing: false,
    analysisResult: null,
    resultFormat: '',
    errorMessage: ''
  },

  onLoad: function() {
    this.loadActions();
  },

  loadActions: async function() {
    wx.showLoading({ title: '加载中...' });
    try {
      const res = await mock.getCoachActions();
      if (res.success && res.data.length > 0) {
        this.setData({
          actions: res.data,
          activeActionId: res.data[0].id,
          selectedAction: res.data[0]
        });
      }
    } catch (error) {
      console.error('加载动作列表失败：', error);
      wx.showToast({ title: '动作列表加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  selectAction: function(e) {
    if (this.data.uploading || this.data.analyzing) return;
    const id = e.currentTarget.dataset.id;
    const selectedAction = this.data.actions.find(item => String(item.id) === String(id));
    if (!selectedAction) return;

    this.setData({
      activeActionId: selectedAction.id,
      selectedAction,
      analysisResult: null,
      resultFormat: '',
      errorMessage: ''
    });
  },

  recordVideo: function() {
    this.chooseVideo(['camera']);
  },

  uploadVideo: function() {
    this.chooseVideo(['album']);
  },

  chooseVideo: function(sourceType) {
    if (this.data.uploading || this.data.analyzing) return;

    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType,
      maxDuration: 30,
      camera: 'back',
      success: async (res) => {
        const file = res.tempFiles && res.tempFiles[0];
        if (!file) return;

        this.setData({
          uploadedVideo: {
            tempFilePath: file.tempFilePath,
            size: file.size,
            duration: file.duration || 0,
            source: sourceType[0],
            name: sourceType[0] === 'camera' ? '手机录制视频' : '本地上传视频'
          },
          videoFileID: '',
          videoUrl: '',
          uploading: true,
          analysisResult: null,
          resultFormat: '',
          errorMessage: ''
        });

        wx.showLoading({ title: '正在上传视频', mask: true });
        let toastOptions;
        try {
          const fileID = await uploadApi.uploadDanceVideo(file.tempFilePath);
          console.log('原始 fileID:', fileID);
          this.setData({ videoFileID: fileID });
          toastOptions = { title: '视频上传成功', icon: 'success' };
        } catch (error) {
          console.error('练习视频上传失败：', error);
          const message = getErrorMessage(error, '视频上传失败，请重试');
          this.setData({ errorMessage: message });
          toastOptions = { title: '视频上传失败', icon: 'none' };
        } finally {
          wx.hideLoading();
          this.setData({ uploading: false });
        }

        wx.showToast(toastOptions);
      },
      fail: (error) => {
        const message = getErrorMessage(error, '未选择视频');
        if (message.indexOf('cancel') === -1) {
          console.error('选择练习视频失败：', error);
          wx.showToast({ title: '视频选择失败', icon: 'none' });
        }
      }
    });
  },

  analyzeVideo: async function() {
    if (!this.data.selectedAction) {
      wx.showToast({ title: '请先选择动作', icon: 'none' });
      return;
    }

    if (!this.data.videoFileID) {
      wx.showToast({ title: '请先上传练习视频', icon: 'none' });
      return;
    }

    if (this.data.uploading || this.data.analyzing) return;

    this.setData({
      analyzing: true,
      analysisResult: null,
      resultFormat: '',
      errorMessage: ''
    });
    wx.showLoading({ title: 'AI正在分析动作', mask: true });

    let toastOptions;
    try {
      danceAnalyzeApi.getEndpoint();
    
      const playableVideoUrl =
        await videoUtil.convertVideoUrl(this.data.videoFileID);
    
      if (!/^https:\/\//i.test(playableVideoUrl)) {
        throw new Error('未能获取可供 AI 访问的 HTTPS 视频地址');
      }
    
      console.log('可播放视频地址已获取');
      console.log('发送给 FC 的视频地址：', playableVideoUrl);
      console.log('动作类型：', this.data.selectedAction.name);
    
      this.setData({
        videoUrl: playableVideoUrl
      });
    
      const result = await danceAnalyzeApi.analyzeDance(
        playableVideoUrl,
        this.data.selectedAction.name
      );
    
      console.log('AI分析成功');
      console.log('FC返回结果：', result);
    
      this.setData({
        analysisResult: result.data,
        resultFormat: result.format || 'json'
      });
    
      toastOptions = {
        title: '动作建议已生成',
        icon: 'success'
      };
    
    } catch (error) {
      console.error('生成动作建议失败：', error);
    
      const message = getErrorMessage(
        error,
        '动作分析失败，请稍后重试'
      );
    
      this.setData({
        errorMessage: message
      });
    
      toastOptions = {
        title: message,
        icon: 'none',
        duration: 3000
      };
    
    } finally {
      wx.hideLoading();
    
      this.setData({
        analyzing: false
      });
    }

    wx.showToast(toastOptions);
  }
});
