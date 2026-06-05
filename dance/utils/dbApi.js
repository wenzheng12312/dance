/**
 * 真实数据库接口模块 - 对接微信云开发数据库
 * 课程增删改通过云函数执行（管理员权限），查询和用户操作直接客户端调用
 */

const db = wx.cloud.database();

// 真实数据库接口
module.exports = {
  /**
   * 学生登录接口（对接云数据库user集合）
   * @param {string} studentId 学号
   * @param {string} password 密码
   * @returns {object} 登录结果
   */
  login: function(studentId, password) {
    return new Promise((resolve, reject) => {
      db.collection('user')
        .where({
          studentId: studentId,
          password: password
        })
        .get()
        .then(res => {
          if (res.data.length === 0) {
            resolve({ success: false, message: '学号或密码错误' });
          } else {
            const user = res.data[0];
            resolve({
              success: true,
              data: {
                id: user._id,
                studentId: user.studentId,
                password: user.password,
                name: user.name,
                avatar: user.avatarUrl,
                role: user.role
              },
              message: '登录成功'
            });
          }
        })
        .catch(err => {
          console.error('登录查询失败：', err);
          reject({ success: false, message: '登录失败，请稍后重试' });
        });
    });
  },

  /**
   * 获取课程列表接口（对接云数据库course集合）
   * @returns {array} 课程列表
   */
  getCourseList: function() {
    return new Promise((resolve, reject) => {
      db.collection('course')
        .get()
        .then(res => {
          const courseList = res.data.map(course => ({
            id: course._id,
            title: course.title,
            cover: course.coverUrl,
            duration: course.duration,
            videoUrl: course.videoUrl,
            description: course.description
          }));
          resolve({ success: true, data: courseList });
        })
        .catch(err => {
          console.error('获取课程列表失败：', err);
          reject({ success: false, message: '获取课程列表失败' });
        });
    });
  },

  /**
   * 根据ID获取课程详情接口（对接云数据库course集合）
   * @param {string} courseId 课程ID（数据库的_id）
   * @returns {object} 课程详情
   */
  getCourseDetail: function(courseId) {
    return new Promise((resolve, reject) => {
      db.collection('course')
        .doc(courseId)
        .get()
        .then(res => {
          const course = res.data;
          resolve({
            success: true,
            data: {
              id: course._id,
              title: course.title,
              cover: course.coverUrl,
              duration: course.duration,
              videoUrl: course.videoUrl,
              description: course.description
            }
          });
        })
        .catch(err => {
          console.error('获取课程详情失败：', err);
          reject({ success: false, message: '获取课程详情失败' });
        });
    });
  },

  /**
   * 更新用户头像（客户端直连，.doc().update() 走 write 权限）
   * @param {string} userId 用户ID（数据库_id）
   * @param {string} avatarUrl 云存储 fileID
   * @returns {object} 更新结果
   */
  updateUserAvatar: function(userId, avatarUrl) {
    return new Promise((resolve, reject) => {
      db.collection('user').doc(userId).update({
        data: { avatarUrl: avatarUrl }
      }).then(res => {
        resolve({ success: true, message: '头像更新成功' });
      }).catch(err => {
        console.error('更新头像失败：', err);
        reject({ success: false, message: '头像更新失败' });
      });
    });
  },

  /**
   * 添加课程 — 通过云函数执行（绕过客户端权限限制）
   * @param {object} courseData 课程数据
   * @returns {object} 添加结果
   */
  addCourse: function(courseData) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'courseAdmin',
        data: { action: 'add', data: courseData }
      }).then(function (res) {
        var result = res.result;
        if (result.success) {
          resolve(result);
        } else {
          reject(result);
        }
      }).catch(function (err) {
        console.error('添加课程失败：', JSON.stringify(err));
        reject({ success: false, message: '添加课程失败：' + (err.errMsg || err.message || '') });
      });
    });
  },

  /**
   * 更新课程 — 通过云函数执行
   * @param {string} courseId 课程ID
   * @param {object} courseData 课程数据
   * @returns {object} 更新结果
   */
  updateCourse: function(courseId, courseData) {
    return new Promise((resolve, reject) => {
      courseData.courseId = courseId;
      wx.cloud.callFunction({
        name: 'courseAdmin',
        data: { action: 'update', data: courseData }
      }).then(function (res) {
        var result = res.result;
        if (result.success) {
          resolve(result);
        } else {
          reject(result);
        }
      }).catch(function (err) {
        console.error('更新课程失败：', JSON.stringify(err));
        reject({ success: false, message: '更新课程失败：' + (err.errMsg || err.message || '') });
      });
    });
  },

  /**
   * 删除课程 — 通过云函数执行
   * @param {string} courseId 课程ID
   * @returns {object} 删除结果
   */
  deleteCourse: function(courseId) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'courseAdmin',
        data: { action: 'delete', data: { courseId: courseId } }
      }).then(function (res) {
        var result = res.result;
        if (result.success) {
          resolve(result);
        } else {
          reject(result);
        }
      }).catch(function (err) {
        console.error('删除课程失败：', JSON.stringify(err));
        reject({ success: false, message: '删除课程失败：' + (err.errMsg || err.message || '') });
      });
    });
  }
};