import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Header from "@/components/organisms/Header";
import Card from "@/components/molecules/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Modal from "@/components/molecules/Modal";
import FormField from "@/components/molecules/FormField";
import GradeCircle from "@/components/molecules/GradeCircle";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import gradesService from "@/services/api/gradesService";
import coursesService from "@/services/api/coursesService";
import assignmentsService from "@/services/api/assignmentsService";
import { format } from "date-fns";

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [formData, setFormData] = useState({
    courseId: "",
    assignmentId: "",
    score: "",
    maxScore: "",
    weight: "",
    category: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [gradesData, coursesData, assignmentsData] = await Promise.all([
        gradesService.getAll(),
        coursesService.getAll(),
        assignmentsService.getAll()
      ]);
      
      setGrades(gradesData);
      setCourses(coursesData);
      setAssignments(assignmentsData);
    } catch (err) {
      setError("Failed to load grades. Please try again.");
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
      const gradeData = {
        ...formData,
        score: parseFloat(formData.score),
        maxScore: parseFloat(formData.maxScore),
        weight: parseFloat(formData.weight)
      };

      if (editingGrade) {
        await gradesService.update(editingGrade.Id, gradeData);
        toast.success("Grade updated successfully!");
      } else {
        await gradesService.create(gradeData);
        toast.success("Grade added successfully!");
      }
      
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err) {
      toast.error("Failed to save grade. Please try again.");
    }
  };

  const handleDelete = async (gradeId) => {
    if (!confirm("Are you sure you want to delete this grade?")) {
      return;
    }

    try {
      await gradesService.delete(gradeId);
      toast.success("Grade deleted successfully!");
      loadData();
    } catch (err) {
      toast.error("Failed to delete grade. Please try again.");
    }
  };

  const openEditModal = (grade) => {
    setEditingGrade(grade);
    setFormData({
      courseId: grade.courseId,
      assignmentId: grade.assignmentId || "",
      score: grade.score.toString(),
      maxScore: grade.maxScore.toString(),
      weight: grade.weight.toString(),
      category: grade.category || ""
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingGrade(null);
    setFormData({
      courseId: "",
      assignmentId: "",
      score: "",
      maxScore: "",
      weight: "",
      category: ""
    });
  };

  const getGradesByCoruse = () => {
    const gradesByCourse = {};
    
    courses.forEach(course => {
      const courseGrades = grades.filter(g => g.courseId === course.Id.toString());
      const currentGrade = gradesService.calculateCourseGrade(courseGrades);
      
      gradesByCourse[course.Id] = {
        course,
        grades: courseGrades,
        currentGrade,
        letterGrade: getLetterGrade(currentGrade)
      };
    });
    
    return gradesByCourse;
  };

  const getLetterGrade = (percentage) => {
    if (percentage >= 97) return "A+";
    if (percentage >= 93) return "A";
    if (percentage >= 90) return "A-";
    if (percentage >= 87) return "B+";
    if (percentage >= 83) return "B";
    if (percentage >= 80) return "B-";
    if (percentage >= 77) return "C+";
    if (percentage >= 73) return "C";
    if (percentage >= 70) return "C-";
    if (percentage >= 67) return "D+";
    if (percentage >= 65) return "D";
    if (percentage >= 60) return "D-";
    return "F";
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "success";
    if (percentage >= 80) return "info";
    if (percentage >= 70) return "warning";
    if (percentage >= 60) return "danger";
    return "default";
  };

  const getAssignmentFromGrade = (grade) => {
    if (!grade.assignmentId) return null;
    return assignments.find(a => a.Id === parseInt(grade.assignmentId));
  };

  const filteredGrades = selectedCourse === "all" 
    ? Object.values(getGradesByCoruse())
    : [getGradesByCoruse()[selectedCourse]].filter(Boolean);

  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} onRetry={loadData} />;

  const gradesByCourse = getGradesByCoruse();
  const totalGrades = Object.values(gradesByCourse).reduce((sum, course) => sum + course.grades.length, 0);
  const averageGPA = Object.values(gradesByCourse).length > 0 
    ? Object.values(gradesByCourse).reduce((sum, course) => sum + course.currentGrade, 0) / Object.values(gradesByCourse).length 
    : 0;

  return (
    <div className="flex-1 overflow-auto bg-background">
      <Header
        title="Grades"
        subtitle={`${totalGrades} grades recorded • ${Math.round(averageGPA)}% average`}
        action={
          <Button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="shadow-lg hover:shadow-xl"
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Grade
          </Button>
        }
      />

      <div className="p-6 md:p-8 space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <div className="flex items-center justify-center mb-4">
              <GradeCircle percentage={averageGPA} size="large" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Overall Average</h3>
            <p className="text-sm text-gray-600">{getLetterGrade(averageGPA)} Grade</p>
          </Card>

          <Card className="bg-gradient-to-r from-success/5 to-green-600/5 border-success/20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-success to-green-600 rounded-xl flex items-center justify-center">
                  <ApperIcon name="TrendingUp" className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Grades</p>
                <p className="text-3xl font-bold text-gray-900">{totalGrades}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-info/5 to-blue-600/5 border-info/20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-info to-blue-600 rounded-xl flex items-center justify-center">
                  <ApperIcon name="BookOpen" className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Courses</p>
                <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex items-center justify-between">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Courses</option>
            {courses.map((course) => (
              <option key={course.Id} value={course.Id}>
                {course.name} ({course.code})
              </option>
            ))}
          </select>
        </div>

        {/* Grades by Course */}
        {filteredGrades.length === 0 || filteredGrades.every(course => !course.grades.length) ? (
          <Empty
            icon="BarChart3"
            title="No grades recorded yet"
            description="Start by adding grades for your assignments to track your academic progress."
            actionText="Add First Grade"
            onAction={() => {
              resetForm();
              setShowModal(true);
            }}
          />
        ) : (
          <div className="space-y-8">
            {filteredGrades.map(({ course, grades: courseGrades, currentGrade, letterGrade }) => {
              if (!courseGrades.length) return null;

              return (
                <Card key={course.Id}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: course.color }}
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{course.name}</h3>
                        <p className="text-sm text-gray-600">{course.code} • {course.instructor}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {Math.round(currentGrade)}%
                        </p>
                        <Badge variant={getGradeColor(currentGrade)} size="small">
                          {letterGrade}
                        </Badge>
                      </div>
                      <GradeCircle percentage={currentGrade} size="medium" />
                    </div>
                  </div>

                  {/* Grades List */}
                  <div className="space-y-3">
                    {courseGrades.map((grade) => {
                      const assignment = getAssignmentFromGrade(grade);
                      const percentage = (grade.score / grade.maxScore) * 100;
                      
                      return (
                        <div 
                          key={grade.Id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {assignment ? assignment.title : `${grade.category || "Assignment"}`}
                            </h4>
                            <div className="flex items-center mt-1 text-sm text-gray-600">
                              <span>{format(new Date(grade.date), "MMM d, yyyy")}</span>
                              {grade.category && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>{grade.category}</span>
                                </>
                              )}
                              <span className="mx-2">•</span>
                              <span>Weight: {grade.weight}%</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                {grade.score} / {grade.maxScore}
                              </p>
                              <Badge variant={getGradeColor(percentage)} size="small">
                                {Math.round(percentage)}%
                              </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => openEditModal(grade)}
                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                              >
                                <ApperIcon name="Edit2" className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(grade.Id)}
                                className="p-2 text-gray-400 hover:text-error hover:bg-error/5 rounded-lg transition-colors"
                              >
                                <ApperIcon name="Trash2" className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Grade Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingGrade ? "Edit Grade" : "Add New Grade"}
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
            <Button type="submit" form="grade-form">
              {editingGrade ? "Update Grade" : "Add Grade"}
            </Button>
          </>
        }
      >
        <form id="grade-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Course"
              type="select"
              required
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.Id} value={course.Id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </FormField>

            <FormField
              label="Assignment (Optional)"
              type="select"
              value={formData.assignmentId}
              onChange={(e) => setFormData({ ...formData, assignmentId: e.target.value })}
            >
              <option value="">Select an assignment</option>
              {assignments
                .filter(a => a.courseId === formData.courseId)
                .map((assignment) => (
                <option key={assignment.Id} value={assignment.Id}>
                  {assignment.title}
                </option>
              ))}
            </FormField>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Score Earned"
              type="number"
              step="0.1"
              required
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: e.target.value })}
              placeholder="95"
            />
            <FormField
              label="Maximum Score"
              type="number"
              step="0.1"
              required
              value={formData.maxScore}
              onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
              placeholder="100"
            />
            <FormField
              label="Weight (%)"
              type="number"
              step="0.1"
              required
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="15"
            />
          </div>
          
          <FormField
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Quiz, Exam, Project, Homework"
          />
        </form>
      </Modal>
    </div>
  );
};

export default Grades;