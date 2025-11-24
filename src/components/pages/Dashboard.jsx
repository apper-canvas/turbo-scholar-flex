import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/organisms/Header";
import Card from "@/components/molecules/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import GradeCircle from "@/components/molecules/GradeCircle";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import coursesService from "@/services/api/coursesService";
import assignmentsService from "@/services/api/assignmentsService";
import gradesService from "@/services/api/gradesService";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    courses: [],
    upcomingAssignments: [],
    grades: [],
    stats: {
      totalCourses: 0,
      pendingAssignments: 0,
      averageGrade: 0,
      completedAssignments: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [courses, assignments, grades] = await Promise.all([
        coursesService.getAll(),
        assignmentsService.getAll(),
        gradesService.getAll()
      ]);

      const upcomingAssignments = await assignmentsService.getUpcoming(7);
      
      // Calculate stats
      const pendingAssignments = assignments.filter(a => a.status !== "completed").length;
      const completedAssignments = assignments.filter(a => a.status === "completed").length;
      
      // Calculate average grade
      const courseGrades = {};
      grades.forEach(grade => {
        if (!courseGrades[grade.courseId]) {
          courseGrades[grade.courseId] = [];
        }
        courseGrades[grade.courseId].push(grade);
      });
      
      const avgGrades = Object.values(courseGrades).map(courseGrades => 
        gradesService.calculateCourseGrade(courseGrades)
      );
      
      const averageGrade = avgGrades.length > 0 
        ? avgGrades.reduce((sum, grade) => sum + grade, 0) / avgGrades.length 
        : 0;

      setData({
        courses,
        upcomingAssignments,
        grades,
        stats: {
          totalCourses: courses.length,
          pendingAssignments,
          averageGrade,
          completedAssignments
        }
      });
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDueDate = (dueDate) => {
    const date = new Date(dueDate);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isThisWeek(date)) return format(date, "EEEE");
    return format(date, "MMM d");
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "danger";
      case "medium": return "warning";  
      case "low": return "info";
      default: return "default";
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} onRetry={loadData} />;

  return (
    <div className="flex-1 overflow-auto bg-background">
      <Header
        title="Dashboard"
        subtitle="Welcome back! Here's your academic overview"
      />

      <div className="p-6 md:p-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                  <ApperIcon name="BookOpen" className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">{data.stats.totalCourses}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-warning/5 to-orange-500/5 border-warning/20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-warning to-orange-500 rounded-xl flex items-center justify-center">
                  <ApperIcon name="Clock" className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{data.stats.pendingAssignments}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-success/5 to-green-600/5 border-success/20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-success to-green-600 rounded-xl flex items-center justify-center">
                  <ApperIcon name="CheckCircle" className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{data.stats.completedAssignments}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-info/5 to-blue-600/5 border-info/20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GradeCircle percentage={data.stats.averageGrade} size="small" showLabel={false} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Grade</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round(data.stats.averageGrade)}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Assignments */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h3>
              <Button
                variant="ghost"
                size="small"
                onClick={() => navigate("/assignments")}
                className="text-primary hover:text-primary/80"
              >
                View All
                <ApperIcon name="ArrowRight" className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {data.upcomingAssignments.length === 0 ? (
              <Empty
                icon="Calendar"
                title="No upcoming assignments"
                description="You're all caught up! No assignments due in the next 7 days."
                actionText="Add Assignment"
                onAction={() => navigate("/assignments")}
              />
            ) : (
              <div className="space-y-4">
                {data.upcomingAssignments.slice(0, 5).map((assignment) => {
                  const course = data.courses.find(c => c.Id === parseInt(assignment.courseId));
                  return (
                    <div
                      key={assignment.Id}
                      className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate("/assignments")}
                    >
                      <div 
                        className="w-1 h-12 rounded-full mr-4"
                        style={{ backgroundColor: course?.color || "#6B7280" }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {assignment.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {course?.name} • Due {formatDueDate(assignment.dueDate)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getPriorityColor(assignment.priority)} size="small">
                          {assignment.priority}
                        </Badge>
                        <ApperIcon name="ChevronRight" className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Course Overview */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Course Overview</h3>
              <Button
                variant="ghost"
                size="small"
                onClick={() => navigate("/courses")}
                className="text-primary hover:text-primary/80"
              >
                View All
                <ApperIcon name="ArrowRight" className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {data.courses.length === 0 ? (
              <Empty
                icon="BookOpen"
                title="No courses added"
                description="Start by adding your courses to track assignments and grades."
                actionText="Add Course"
                onAction={() => navigate("/courses")}
              />
            ) : (
              <div className="space-y-4">
                {data.courses.slice(0, 4).map((course) => {
                  const courseGrades = data.grades.filter(g => g.courseId === course.Id.toString());
                  const courseGrade = gradesService.calculateCourseGrade(courseGrades);
                  const courseAssignments = data.upcomingAssignments.filter(a => a.courseId === course.Id.toString());

                  return (
                    <div
                      key={course.Id}
                      className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate("/courses")}
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-4 flex-shrink-0"
                        style={{ backgroundColor: course.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {course.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {course.code} • {course.instructor}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {courseGrades.length > 0 && (
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {Math.round(courseGrade)}%
                            </p>
                            <p className="text-xs text-gray-500">Current Grade</p>
                          </div>
                        )}
                        {courseAssignments.length > 0 && (
                          <Badge variant="warning" size="small">
                            {courseAssignments.length} due
                          </Badge>
                        )}
                        <ApperIcon name="ChevronRight" className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;