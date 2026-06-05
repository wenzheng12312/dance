/**
 * Mock数据模块 - 模拟后端返回的用户和课程数据
 * 后续替换为真实后端接口只需修改此文件
 */

// 模拟学生用户数据
const mockStudents = [
  { id: 1, studentId: '2024001', password: '123456', name: '李同学', avatar: 'https://example.com/avatar1.jpg', role: 'student' },
  { id: 2, studentId: '2024002', password: '123456', name: '王同学', avatar: 'https://example.com/avatar2.jpg', role: 'student' }
];

// 模拟舞蹈课程数据
const mockCourses = [
  { 
    id: 101, 
    title: '古典舞基础入门', 
    cover: 'https://example.com/dance1.jpg', 
    duration: '45分钟',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4', // 测试视频链接
    description: '从基本功开始，学习古典舞的神韵与姿态'
  },
  { 
    id: 102, 
    title: '爵士舞成品舞教学', 
    cover: 'https://example.com/dance2.jpg', 
    duration: '60分钟',
    videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
    description: '学习热门爵士舞片段，提升节奏感与表现力'
  }
];

module.exports = {
  /**
   * 模拟学生登录接口
   * @param {string} studentId 学号
   * @param {string} password 密码
   * @returns {object} 登录结果
   */
  login: function(studentId, password) {
    // 模拟网络延迟
    return new Promise((resolve) => {
      setTimeout(() => {
        const student = mockStudents.find(s => s.studentId === studentId && s.password === password);
        if (student) {
          resolve({ success: true, data: student, message: '登录成功' });
        } else {
          resolve({ success: false, message: '学号或密码错误' });
        }
      }, 800);
    });
  },

  /**
   * 模拟获取课程列表接口
   * @returns {array} 课程列表
   */
  getCourseList: function() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: mockCourses });
      }, 500);
    });
  },

  /**
   * 模拟根据ID获取课程详情接口
   * @param {number} courseId 课程ID
   * @returns {object} 课程详情
   */
  getCourseDetail: function(courseId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const course = mockCourses.find(c => c.id === courseId);
        resolve({ success: true, data: course });
      }, 300);
    });
  }
};