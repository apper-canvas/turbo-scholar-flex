import { useState, useEffect } from "react";
import Header from "@/components/organisms/Header";
import Card from "@/components/molecules/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import assignmentsService from "@/services/api/assignmentsService";
import coursesService from "@/services/api/coursesService";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  isOverdue
} from "date-fns";

const Calendar = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // month, week
  const [selectedDate, setSelectedDate] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [assignmentsData, coursesData] = await Promise.all([
        assignmentsService.getAll(),
        coursesService.getAll()
      ]);
      
      setAssignments(assignmentsData);
      setCourses(coursesData);
    } catch (err) {
      setError("Failed to load calendar data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getMonthDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  const getAssignmentsForDate = (date) => {
    return assignments.filter(assignment => 
      isSameDay(new Date(assignment.dueDate), date)
    );
  };

  const getDayAssignments = (date) => {
    const dayAssignments = getAssignmentsForDate(date);
    return dayAssignments.map(assignment => {
      const course = courses.find(c => c.Id === parseInt(assignment.courseId));
      return { ...assignment, course };
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "danger";
      case "medium": return "warning";
      case "low": return "info";
      default: return "default";
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => 
      direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} onRetry={loadData} />;

  const monthDays = getMonthDays();
  const selectedDateAssignments = selectedDate ? getDayAssignments(selectedDate) : [];

  return (
    <div className="flex-1 overflow-auto bg-background">
      <Header
        title="Calendar"
        subtitle={`${format(currentDate, "MMMM yyyy")} • ${assignments.filter(a => a.status === "pending").length} pending assignments`}
        action={
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="small"
              onClick={goToToday}
            >
              Today
            </Button>
            <div className="flex items-center bg-white rounded-lg border border-gray-200">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-2 hover:bg-gray-50 rounded-l-lg transition-colors"
              >
                <ApperIcon name="ChevronLeft" className="w-4 h-4 text-gray-600" />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-900 min-w-[120px] text-center">
                {format(currentDate, "MMMM yyyy")}
              </span>
              <button
                onClick={() => navigateMonth("next")}
                className="p-2 hover:bg-gray-50 rounded-r-lg transition-colors"
              >
                <ApperIcon name="ChevronRight" className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        }
      />

      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Calendar Grid */}
          <div className="xl:col-span-3">
            <Card className="overflow-hidden">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-0 border-b border-gray-200">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="p-3 text-center text-sm font-medium text-gray-700 bg-gray-50"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Body */}
              <div className="grid grid-cols-7 gap-0">
                {monthDays.map((day, dayIdx) => {
                  const dayAssignments = getDayAssignments(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isCurrentDay = isToday(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  
                  return (
                    <button
                      key={dayIdx}
                      onClick={() => setSelectedDate(day)}
                      className={`min-h-[120px] p-2 text-left border-b border-r border-gray-100 hover:bg-gray-50 transition-colors ${
                        !isCurrentMonth ? "bg-gray-25 text-gray-400" : ""
                      } ${isSelected ? "bg-primary/10 border-primary/30" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${
                          isCurrentDay ? "bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center" : ""
                        }`}>
                          {format(day, "d")}
                        </span>
                        {dayAssignments.length > 0 && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                            {dayAssignments.length}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        {dayAssignments.slice(0, 2).map((assignment) => {
                          const overdue = assignment.status !== "completed" && isOverdue(new Date(assignment.dueDate));
                          return (
                            <div
                              key={assignment.Id}
                              className={`text-xs p-1.5 rounded truncate ${
                                assignment.status === "completed" 
                                  ? "bg-success/10 text-success/80" 
                                  : overdue
                                  ? "bg-error/10 text-error border border-error/20"
                                  : "text-gray-700"
                              }`}
                              style={{
                                backgroundColor: assignment.status !== "completed" && !overdue
                                  ? `${assignment.course?.color}15` 
                                  : undefined,
                                color: assignment.status !== "completed" && !overdue
                                  ? assignment.course?.color 
                                  : undefined,
                                borderColor: assignment.status !== "completed" && !overdue
                                  ? `${assignment.course?.color}30` 
                                  : undefined,
                                borderWidth: assignment.status !== "completed" && !overdue ? "1px" : undefined
                              }}
                            >
                              {assignment.title}
                            </div>
                          );
                        })}
                        {dayAssignments.length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{dayAssignments.length - 2} more
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Assignment Details Sidebar */}
          <div className="xl:col-span-1">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
              </h3>

              {!selectedDate ? (
                <div className="text-center py-8">
                  <ApperIcon name="Calendar" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Click on a date to view assignments
                  </p>
                </div>
              ) : selectedDateAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <ApperIcon name="FileText" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    No assignments on this date
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateAssignments.map((assignment) => {
                    const overdue = assignment.status !== "completed" && isOverdue(new Date(assignment.dueDate));
                    
                    return (
                      <div
                        key={assignment.Id}
                        className={`p-4 border rounded-lg ${
                          assignment.status === "completed" 
                            ? "border-success/20 bg-success/5" 
                            : overdue
                            ? "border-error/20 bg-error/5"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className={`font-medium ${
                            assignment.status === "completed" 
                              ? "text-gray-600 line-through" 
                              : "text-gray-900"
                          }`}>
                            {assignment.title}
                          </h4>
                          <div className="flex items-center space-x-1">
                            <Badge variant={getPriorityColor(assignment.priority)} size="small">
                              {assignment.priority}
                            </Badge>
                          </div>
                        </div>
                        
                        {assignment.course && (
                          <div className="flex items-center mb-2">
                            <div 
                              className="w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: assignment.course.color }}
                            />
                            <span className="text-sm text-gray-600">
                              {assignment.course.name}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>
                            {format(new Date(assignment.dueDate), "h:mm a")}
                            {overdue && <span className="ml-2 text-error font-medium">(Overdue)</span>}
                          </span>
                          
                          {assignment.status === "completed" ? (
                            <Badge variant="success" size="small">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="warning" size="small">
                              Pending
                            </Badge>
                          )}
                        </div>
                        
                        {assignment.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {assignment.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;