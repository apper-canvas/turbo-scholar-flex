import assignmentsData from "@/services/mockData/assignments.json";

class AssignmentsService {
  constructor() {
    this.storageKey = "scholar_hub_assignments";
    this.initializeData();
  }

  initializeData() {
    const existingData = localStorage.getItem(this.storageKey);
    if (!existingData) {
      localStorage.setItem(this.storageKey, JSON.stringify(assignmentsData));
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
      }, 350);
    });
  }

  async getById(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = this.getData();
        const item = data.find(assignment => assignment.Id === parseInt(id));
        resolve(item ? { ...item } : null);
      }, 200);
    });
  }

  async getByCourse(courseId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = this.getData();
        const courseAssignments = data.filter(assignment => assignment.courseId === courseId);
        resolve([...courseAssignments]);
      }, 250);
    });
  }

  async getUpcoming(days = 7) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = this.getData();
        const now = new Date();
        const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
        
        const upcoming = data.filter(assignment => {
          const dueDate = new Date(assignment.dueDate);
          return assignment.status !== "completed" && dueDate >= now && dueDate <= futureDate;
        });
        
        resolve([...upcoming]);
      }, 300);
    });
  }

  async create(assignmentData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = this.getData();
        const maxId = data.length > 0 ? Math.max(...data.map(a => a.Id)) : 0;
        const newAssignment = {
          ...assignmentData,
          Id: maxId + 1,
          createdAt: new Date().toISOString(),
          status: assignmentData.status || "pending"
        };
        data.push(newAssignment);
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        resolve({ ...newAssignment });
      }, 250);
    });
  }

  async update(id, assignmentData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = this.getData();
        const index = data.findIndex(assignment => assignment.Id === parseInt(id));
        if (index !== -1) {
          data[index] = { ...data[index], ...assignmentData };
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
        const filteredData = data.filter(assignment => assignment.Id !== parseInt(id));
        localStorage.setItem(this.storageKey, JSON.stringify(filteredData));
        resolve(true);
      }, 200);
    });
  }

  async toggleComplete(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = this.getData();
        const index = data.findIndex(assignment => assignment.Id === parseInt(id));
        if (index !== -1) {
          data[index].status = data[index].status === "completed" ? "pending" : "completed";
          localStorage.setItem(this.storageKey, JSON.stringify(data));
          resolve({ ...data[index] });
        } else {
          resolve(null);
        }
      }, 150);
    });
  }
}

export default new AssignmentsService();