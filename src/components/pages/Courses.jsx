import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Header from "@/components/organisms/Header";
import Card from "@/components/molecules/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Modal from "@/components/molecules/Modal";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import coursesService from "@/services/api/coursesService";
import assignmentsService from "@/services/api/assignmentsService";
import gradesService from "@/services/api/gradesService";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    instructor: "",
    schedule: "",
    credits: "",
    color: "#4F46E5",
    semester: ""
  });

  const colors = [
    "#4F46E5", "#7C3AED", "#10B981", "#F59E0B", "#EF4444",
    "#3B82F6", "#8B5CF6", "#06B6D4", "#84CC16", "#F97316"
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [coursesData, assignmentsData, gradesData] = await Promise.all([
        coursesService.getAll(),
        assignmentsService.getAll(),
        gradesService.getAll()
      ]);
      
      setCourses(coursesData);
      setAssignments(assignmentsData);
      setGrades(gradesData);
    } catch (err) {
      setError("Failed to load courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const courseData = {
        ...formData,
        credits: parseInt(formData.credits)
      };

      if (editingCourse) {
        await coursesService.update(editingCourse.Id, courseData);
        toast.success("Course updated successfully!");
      } else {
        await coursesService.create(courseData);
        toast.success("Course added successfully!");
      }
      
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err) {
      toast.error("Failed to save course. Please try again.");
    }
  };

  const handleDelete = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course? This will also remove all related assignments and grades.")) {
      return;
    }

    try {
      await coursesService.delete(courseId);
      
      // Clean up related assignments and grades
      const relatedAssignments = assignments.filter(a => a.courseId === courseId.toString());
      for (const assignment of relatedAssignments) {
        await assignmentsService.delete(assignment.Id);
      }
      
      const relatedGrades = grades.filter(g => g.courseId === courseId.toString());
      for (const grade of relatedGrades) {
        await gradesService.delete(grade.Id);
      }
      
      toast.success("Course deleted successfully!");
      loadData();
    } catch (err) {
      toast.error("Failed to delete course. Please try again.");
    }
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      instructor: course.instructor,
      schedule: course.schedule,
      credits: course.credits.toString(),
      color: course.color,
      semester: course.semester
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingCourse(null);
    setFormData({
      name: "",
      code: "",
      instructor: "",
      schedule: "",
      credits: "",
      color: "#4F46E5",
      semester: ""
    });
  };

  const getCourseStats = (course) => {
    const courseAssignments = assignments.filter(a => a.courseId === course.Id.toString());
    const completedAssignments = courseAssignments.filter(a => a.status === "completed").length;
    const pendingAssignments = courseAssignments.filter(a => a.status === "pending").length;
    
    const courseGrades = grades.filter(g => g.courseId === course.Id.toString());
    const currentGrade = gradesService.calculateCourseGrade(courseGrades);
    
    return {
      totalAssignments: courseAssignments.length,
      completedAssignments,
      pendingAssignments,
      currentGrade
    };
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} onRetry={loadData} />;

  return (
    <div className="flex-1 overflow-auto bg-background">
      <Header
        title="Courses"
        subtitle={`Managing ${courses.length} courses this semester`}
        action={
          <Button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="shadow-lg hover:shadow-xl"
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Course
          </Button>
        }
      />

      <div className="p-6 md:p-8">
        {courses.length === 0 ? (
          <Empty
            icon="BookOpen"
            title="No courses added yet"
            description="Start by adding your courses to track assignments, grades, and stay organized this semester."
            actionText="Add Your First Course"
            onAction={() => {
              resetForm();
              setShowModal(true);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((course) => {
              const stats = getCourseStats(course);
              
              return (
                <Card key={course.Id} hover className="relative overflow-hidden">
                  {/* Course Color Bar */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: course.color }}
                  />
                  
                  <div className="pt-2">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-2">
                          <div 
                            className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                            style={{ backgroundColor: course.color }}
                          />
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {course.name}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">{course.code}</p>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openEditModal(course)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        >
                          <ApperIcon name="Edit2" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(course.Id)}
                          className="p-2 text-gray-400 hover:text-error hover:bg-error/5 rounded-lg transition-colors"
                        >
                          <ApperIcon name="Trash2" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Course Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <ApperIcon name="User" className="w-4 h-4 mr-2 text-gray-400" />
                        {course.instructor}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <ApperIcon name="Clock" className="w-4 h-4 mr-2 text-gray-400" />
                        {course.schedule}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <ApperIcon name="Calendar" className="w-4 h-4 mr-2 text-gray-400" />
                          {course.semester}
                        </div>
                        <span className="font-medium">{course.credits} Credits</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.currentGrade > 0 ? Math.round(stats.currentGrade) : "--"}
                          {stats.currentGrade > 0 && "%"}
                        </p>
                        <p className="text-xs text-gray-600">Current Grade</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Badge 
                            variant="success" 
                            size="small"
                            className="text-xs"
                          >
                            {stats.completedAssignments}
                          </Badge>
                          <span className="text-gray-400 text-xs">/</span>
                          <Badge 
                            variant="warning" 
                            size="small"
                            className="text-xs"
                          >
                            {stats.pendingAssignments}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Done / Pending</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Course Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingCourse ? "Edit Course" : "Add New Course"}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" form="course-form">
              {editingCourse ? "Update Course" : "Add Course"}
            </Button>
          </>
        }
      >
        <form id="course-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Course Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Computer Science Fundamentals"
            />
            <FormField
              label="Course Code"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g., CS 101"
            />
          </div>
          
          <FormField
            label="Instructor"
            required
            value={formData.instructor}
            onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
            placeholder="e.g., Dr. Sarah Chen"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Schedule"
              required
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              placeholder="e.g., MWF 9:00-10:00 AM"
            />
            <FormField
              label="Credits"
              type="number"
              required
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
              placeholder="3"
              min="1"
              max="6"
            />
          </div>
          
          <FormField
            label="Semester"
            required
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            placeholder="e.g., Fall 2024"
          />

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Course Color</label>
            <div className="grid grid-cols-5 gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 ${
                    formData.color === color
                      ? "border-gray-800 scale-110"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Courses;