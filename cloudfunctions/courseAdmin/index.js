/**
 * 课程管理云函数 — 处理 course 集合的增删改
 * 服务端运行，拥有管理员权限，绕过客户端安全规则
 */
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async function (event) {
  var action = event.action;
  var data = event.data;

  try {
    if (action === 'add') {
      var doc = {
        title: data.title,
        description: data.description,
        duration: data.duration
      };
      if (data.coverUrl) doc.coverUrl = data.coverUrl;
      if (data.videoUrl) doc.videoUrl = data.videoUrl;

      var res = await db.collection('course').add({ data: doc });
      return { success: true, data: { id: res._id }, message: '课程添加成功' };
    }

    if (action === 'update') {
      var updateDoc = {
        title: data.title,
        description: data.description,
        duration: data.duration
      };
      if (data.coverUrl) updateDoc.coverUrl = data.coverUrl;
      if (data.videoUrl) updateDoc.videoUrl = data.videoUrl;

      await db.collection('course').doc(data.courseId).update({ data: updateDoc });
      return { success: true, message: '课程更新成功' };
    }

    if (action === 'delete') {
      await db.collection('course').doc(data.courseId).remove();
      return { success: true, message: '课程删除成功' };
    }

    return { success: false, message: '未知操作：' + action };
  } catch (err) {
    return { success: false, message: '操作失败：' + (err.message || '') };
  }
};
