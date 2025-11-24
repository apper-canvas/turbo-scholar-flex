import gradesData from "@/services/mockData/grades.json";

class GradesService {
  constructor() {
    this.storageKey = "scholar_hub_grades";
    this.initializeData();
  }

  initializeData() {
    const existingData = localStorage.getItem(this.storageKey);
    if (!existingData) {
      localStorage.setItem(this.storageKey, JSON.stringify(gradesData));
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
        const item = data.find(grade => grade.Id === parseInt(id));
        resolve(item ? { ...item } : null);
      }, 200);
    });
  }

  async getByCourse(courseId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = this.getData();
        const courseGrades = data.filter(grade => grade.courseId === courseId);
        resolve([...courseGrades]);
      }, 250);
    });
  }

  async create(gradeData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = this.getData();
        const maxId = data.length > 0 ? Math.max(...data.map(g => g.Id)) : 0;
        const newGrade = {
          ...gradeData,
          Id: maxId + 1,
          date: new Date().toISOString()
        };
        data.push(newGrade);
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        resolve({ ...newGrade });
      }, 250);
    });
  }

  async update(id, gradeData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = this.getData();
        const index = data.findIndex(grade => grade.Id === parseInt(id));
        if (index !== -1) {
          data[index] = { ...data[index], ...gradeData };
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
        const filteredData = data.filter(grade => grade.Id !== parseInt(id));
        localStorage.setItem(this.storageKey, JSON.stringify(filteredData));
        resolve(true);
      }, 200);
    });
  }

  calculateCourseGrade(grades) {
    if (!grades || grades.length === 0) return 0;
    
    const totalWeightedScore = grades.reduce((sum, grade) => {
      const percentage = (grade.score / grade.maxScore) * 100;
      return sum + (percentage * grade.weight);
    }, 0);
    
    const totalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);
    
    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  }
}

export default new GradesService();