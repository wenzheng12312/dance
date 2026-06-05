/**
 * 真实数据库接口模块 - 对接微信云开发数据库
 * 课程增删改通过云函数执行，查询和用户操作直接客户端调用
 */

var db = wx.cloud.database();

var roleNameMap = { teacher: '教师', student: '学生' };

module.exports = {
  login: function (studentId, password, role) {
    return new Promise(function (resolve, reject) {
      db.collection('user')
        .where({ userId: studentId, password: password })
        .get()
        .then(function (res) {
          if (res.data.length === 0) {
            resolve({ success: false, message: '账号或密码错误' });
          } else {
            var user = res.data[0];
            // 如果前端传了角色，校验与数据库角色一致
            if (role && user.role !== role) {
              resolve({ success: false, message: role === 'teacher' ? '该账号不是教师' : '该账号不是学生' });
              return;
            }
            resolve({
              success: true,
              data: {
                id: user._id,
                studentId: user.userId,
                account: user.userId,
                password: user.password,
                name: user.name,
                avatar: user.avatarUrl,
                role: user.role,
                roleName: roleNameMap[user.role] || '学生'
              },
              message: '登录成功'
            });
          }
        })
        .catch(function (err) {
          console.error('登录查询失败：', err);
          reject({ success: false, message: '登录失败，请稍后重试' });
        });
    });
  },

  getCourseList: function () {
    return new Promise(function (resolve, reject) {
      db.collection('course')
        .get()
        .then(function (res) {
          var colors = ['cover-green', 'cover-coral', 'cover-blue', 'cover-mint'];
          var courseList = res.data.map(function (course, i) {
            return {
              id: course._id,
              type: 'video',
              label: '分解视频',
              title: course.title,
              cover: course.coverUrl,
              coverClass: colors[i % colors.length],
              duration: course.duration,
              videoUrl: course.videoUrl,
              description: course.description,
              tags: []
            };
          });
          resolve({ success: true, data: courseList });
        })
        .catch(function (err) {
          console.error('获取课程列表失败：', err);
          reject({ success: false, message: '获取课程列表失败' });
        });
    });
  },

  getCourseDetail: function (courseId) {
    return new Promise(function (resolve, reject) {
      db.collection('course')
        .doc(courseId)
        .get()
        .then(function (res) {
          var course = res.data;
          var ids = [];
          if (course.videoUrl && course.videoUrl.startsWith('cloud://')) ids.push(course.videoUrl);
          if (course.coverUrl && course.coverUrl.startsWith('cloud://')) ids.push(course.coverUrl);

          if (ids.length === 0) {
            resolve({
              success: true,
              data: {
                id: course._id, title: course.title,
                cover: course.coverUrl, duration: course.duration,
                videoUrl: course.videoUrl, description: course.description
              }
            });
            return;
          }

          // 自动将 cloud:// 转为临时 HTTPS 链接
          wx.cloud.getTempFileURL({ fileList: ids }).then(function (urlRes) {
            var map = {};
            (urlRes.fileList || []).forEach(function (f) { map[f.fileID] = f.tempFileURL; });
            resolve({
              success: true,
              data: {
                id: course._id, title: course.title,
                cover: map[course.coverUrl] || course.coverUrl,
                duration: course.duration,
                videoUrl: map[course.videoUrl] || course.videoUrl,
                description: course.description
              }
            });
          }).catch(function () {
            // 转换失败，返回原始 cloud:// URL（视频可能播不了，但不阻塞页面）
            resolve({
              success: true,
              data: {
                id: course._id, title: course.title,
                cover: course.coverUrl, duration: course.duration,
                videoUrl: course.videoUrl, description: course.description
              }
            });
          });
        })
        .catch(function (err) {
          console.error('获取课程详情失败：', err);
          reject({ success: false, message: '获取课程详情失败' });
        });
    });
  },

  updateUserAvatar: function (userId, avatarUrl) {
    return new Promise(function (resolve, reject) {
      db.collection('user').doc(userId).update({
        data: { avatarUrl: avatarUrl }
      }).then(function () {
        resolve({ success: true, message: '头像更新成功' });
      }).catch(function (err) {
        console.error('更新头像失败：', err);
        reject({ success: false, message: '头像更新失败' });
      });
    });
  },

  addCourse: function (courseData) {
    return new Promise(function (resolve, reject) {
      wx.cloud.callFunction({
        name: 'courseAdmin',
        data: { action: 'add', data: courseData }
      }).then(function (res) {
        var result = res.result;
        if (result.success) { resolve(result); } else { reject(result); }
      }).catch(function (err) {
        console.error('添加课程失败：', JSON.stringify(err));
        reject({ success: false, message: '添加课程失败：' + (err.errMsg || err.message || '') });
      });
    });
  },

  updateCourse: function (courseId, courseData) {
    return new Promise(function (resolve, reject) {
      courseData.courseId = courseId;
      wx.cloud.callFunction({
        name: 'courseAdmin',
        data: { action: 'update', data: courseData }
      }).then(function (res) {
        var result = res.result;
        if (result.success) { resolve(result); } else { reject(result); }
      }).catch(function (err) {
        console.error('更新课程失败：', JSON.stringify(err));
        reject({ success: false, message: '更新课程失败：' + (err.errMsg || err.message || '') });
      });
    });
  },

  deleteCourse: function (courseId) {
    return new Promise(function (resolve, reject) {
      wx.cloud.callFunction({
        name: 'courseAdmin',
        data: { action: 'delete', data: { courseId: courseId } }
      }).then(function (res) {
        var result = res.result;
        if (result.success) { resolve(result); } else { reject(result); }
      }).catch(function (err) {
        console.error('删除课程失败：', JSON.stringify(err));
        reject({ success: false, message: '删除课程失败：' + (err.errMsg || err.message || '') });
      });
    });
  }
};