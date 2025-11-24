import coursesData from "@/services/mockData/courses.json";

class CoursesService {
  constructor() {
    this.storageKey = "scholar_hub_courses";
    this.initializeData();
  }

  initializeData() {
    const existingData = localStorage.getItem(this.storageKey);
    if (!existingData) {
      localStorage.setItem(this.storageKey, JSON.stringify(coursesData));
    }
  }

  getData() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.getData()]);
      }, 300);
    });
  }

  async getById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = this.getData();
        const item = data.find(course => course.Id === parseInt(id));
        resolve(item ? { ...item } : null);
      }, 200);
    });
  }

  async create(courseData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = this.getData();
        const maxId = data.length > 0 ? Math.max(...data.map(c => c.Id)) : 0;
        const newCourse = {
          ...courseData,
          Id: maxId + 1,
          createdAt: new Date().toISOString()
        };
        data.push(newCourse);
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        resolve({ ...newCourse });
      }, 250);
    });
  }

  async update(id, courseData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = this.getData();
        const index = data.findIndex(course => course.Id === parseInt(id));
        if (index !== -1) {
          data[index] = { ...data[index], ...courseData };
          localStorage.setItem(this.storageKey, JSON.stringify(data));
          resolve({ ...data[index] });
        } else {
          resolve(null);
        }
      }, 200);
    });
  }

  async delete(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = this.getData();
        const filteredData = data.filter(course => course.Id !== parseInt(id));
        localStorage.setItem(this.storageKey, JSON.stringify(filteredData));
        resolve(true);
      }, 200);
    });
  }
}

export default new CoursesService();