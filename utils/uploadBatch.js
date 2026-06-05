/**
 * 上传事务工具 — 确保上传 + 数据库写入的原子性
 * - 新上传的文件注册到 _newFiles，任意步骤失败时 rollback() 清理
 * - 被替换的旧文件注册到 _oldFiles，全部成功后 commit() 清理
 */
const uploadApi = require('./uploadApi.js');

function noop() {}

function UploadBatch() {
  this._newFiles = [];
  this._oldFiles = [];
}

UploadBatch.prototype.trackUpload = function (fileID) {
  if (fileID) this._newFiles.push(fileID);
  return fileID;
};

UploadBatch.prototype.replaceOnSuccess = function (fileID) {
  if (fileID && fileID.startsWith('cloud://')) this._oldFiles.push(fileID);
};

UploadBatch.prototype.rollback = function () {
  var files = this._newFiles;
  this._newFiles = [];
  files.forEach(function (fid) {
    uploadApi.deleteFile(fid).catch(noop);
  });
};

UploadBatch.prototype.commit = function () {
  var files = this._oldFiles;
  this._oldFiles = [];
  files.forEach(function (fid) {
    uploadApi.deleteFile(fid).catch(noop);
  });
};

module.exports = UploadBatch;
