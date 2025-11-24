import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Header from "@/components/organisms/Header";
import Card from "@/components/molecules/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Modal from "@/components/molecules/Modal";
import FormField from "@/components/molecules/FormField";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import assignmentsService from "@/services/api/assignmentsService";
import coursesService from "@/services/api/coursesService";
import { format, isPast, isSameDay, parseISO } from "date-fns";

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    dueDate: "",
    priority: "medium",
    status: "pending",
    maxScore: "",
    weight: ""
  });

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
      setError("Failed to load assignments. Please try again.");
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
      const assignmentData = {
        ...formData,
        maxScore: formData.maxScore ? parseFloat(formData.maxScore) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dueDate: new Date(formData.dueDate).toISOString()
      };

      if (editingAssignment) {
        await assignmentsService.update(editingAssignment.Id, assignmentData);
        toast.success("Assignment updated successfully!");
      } else {
        await assignmentsService.create(assignmentData);
        toast.success("Assignment added successfully!");
      }
      
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err) {
      toast.error("Failed to save assignment. Please try again.");
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!confirm("Are you sure you want to delete this assignment?")) {
      return;
    }

    try {
      await assignmentsService.delete(assignmentId);
      toast.success("Assignment deleted successfully!");
      loadData();
    } catch (err) {
      toast.error("Failed to delete assignment. Please try again.");
    }
  };

  const handleToggleComplete = async (assignment) => {
    try {
      await assignmentsService.toggleComplete(assignment.Id);
      toast.success(
        assignment.status === "completed" 
          ? "Assignment marked as pending" 
          : "Assignment marked as completed!"
      );
      loadData();
    } catch (err) {
      toast.error("Failed to update assignment status. Please try again.");
    }
  };

  const openEditModal = (assignment) => {
    setEditingAssignment(assignment);
    const dueDate = new Date(assignment.dueDate);
    const localDate = new Date(dueDate.getTime() - dueDate.getTimezoneOffset() * 60000);
    
    setFormData({
      title: assignment.title,
      description: assignment.description || "",
      courseId: assignment.courseId,
      dueDate: localDate.toISOString().slice(0, 16),
      priority: assignment.priority,
      status: assignment.status,
      maxScore: assignment.maxScore?.toString() || "",
      weight: assignment.weight?.toString() || ""
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingAssignment(null);
    setFormData({
      title: "",
      description: "",
      courseId: "",
      dueDate: "",
      priority: "medium",
      status: "pending",
      maxScore: "",
      weight: ""
    });
  };

  const filteredAndSortedAssignments = assignments
    .filter(assignment => {
      const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          assignment.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || assignment.status === filterStatus;
      const matchesPriority = filterPriority === "all" || assignment.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          return new Date(a.dueDate) - new Date(b.dueDate);
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "title":
          return a.title.localeCompare(b.title);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "danger";
      case "medium": return "warning";
      case "low": return "info";
      default: return "default";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "success";
      case "pending": return "warning";
      default: return "default";
    }
  };

const isAssignmentOverdue = (dueDate, status) => {
    return status !== "completed" && isPast(new Date(dueDate));
  };

  if (loading) return <Loading />;
  if (error) return <ErrorView error={error} onRetry={loadData} />;

  return (
    <div className="flex-1 overflow-auto bg-background">
      <Header
        title="Assignments"
        subtitle={`${assignments.length} assignments • ${assignments.filter(a => a.status === "pending").length} pending`}
        action={
          <Button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="shadow-lg hover:shadow-xl"
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Assignment
          </Button>
        }
      />

      <div className="p-6 md:p-8 space-y-6">
        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <SearchBar
              placeholder="Search assignments..."
              onSearch={setSearchQuery}
              className="sm:max-w-xs"
            />
            
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary lg:w-auto"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="title">Sort by Title</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>

        {/* Assignments List */}
        {filteredAndSortedAssignments.length === 0 ? (
          <Empty
            icon="FileText"
            title={searchQuery || filterStatus !== "all" || filterPriority !== "all" ? "No assignments found" : "No assignments added yet"}
            description={searchQuery || filterStatus !== "all" || filterPriority !== "all" 
              ? "Try adjusting your search or filter criteria to find assignments."
              : "Start by adding assignments to keep track of your coursework and deadlines."
            }
            actionText="Add Assignment"
            onAction={() => {
              resetForm();
              setShowModal(true);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedAssignments.map((assignment) => {
              const course = courses.find(c => c.Id === parseInt(assignment.courseId));
              const overdue = isAssignmentOverdue(assignment.dueDate, assignment.status);
              
              return (
                <Card key={assignment.Id} hover className="relative overflow-hidden">
                  {/* Priority Bar */}
                  <div 
                    className={`absolute top-0 left-0 w-1 h-full ${
                      assignment.priority === "high" ? "bg-error" :
                      assignment.priority === "medium" ? "bg-warning" : "bg-info"
                    }`}
                  />
                  
                  <div className="pl-2">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-semibold truncate ${
                          assignment.status === "completed" ? "text-gray-600 line-through" : "text-gray-900"
                        }`}>
                          {assignment.title}
                        </h3>
                        {course && (
                          <div className="flex items-center mt-1">
                            <div 
                              className="w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: course.color }}
                            />
                            <p className="text-sm text-gray-600 truncate">
                              {course.name}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={() => handleToggleComplete(assignment)}
                          className={`p-2 rounded-lg transition-colors ${
                            assignment.status === "completed"
                              ? "text-success bg-success/10 hover:bg-success/20"
                              : "text-gray-400 hover:text-success hover:bg-success/10"
                          }`}
                        >
                          <ApperIcon name="Check" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(assignment)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        >
                          <ApperIcon name="Edit2" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(assignment.Id)}
                          className="p-2 text-gray-400 hover:text-error hover:bg-error/5 rounded-lg transition-colors"
                        >
                          <ApperIcon name="Trash2" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {assignment.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {assignment.description}
                      </p>
                    )}

                    {/* Due Date */}
                    <div className={`flex items-center mb-4 text-sm ${
                      overdue ? "text-error" : "text-gray-600"
                    }`}>
                      <ApperIcon name="Calendar" className="w-4 h-4 mr-2" />
                      <span>
                        Due {format(new Date(assignment.dueDate), "MMM d, yyyy 'at' h:mm a")}
                        {overdue && <span className="ml-2 font-medium">(Overdue)</span>}
                      </span>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getPriorityColor(assignment.priority)} size="small">
                          {assignment.priority}
                        </Badge>
                        <Badge variant={getStatusColor(assignment.status)} size="small">
                          {assignment.status}
                        </Badge>
                      </div>
                      
                      {assignment.maxScore && (
                        <div className="text-sm text-gray-500">
                          {assignment.maxScore} pts
                          {assignment.weight && ` • ${assignment.weight}%`}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Assignment Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingAssignment ? "Edit Assignment" : "Add New Assignment"}
        size="large"
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
            <Button type="submit" form="assignment-form">
              {editingAssignment ? "Update Assignment" : "Add Assignment"}
            </Button>
          </>
        }
      >
        <form id="assignment-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Assignment Title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Programming Fundamentals Quiz"
            />
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
          </div>
          
          <FormField
            label="Description"
            type="textarea"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add details about the assignment..."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Due Date"
              type="datetime-local"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
            <FormField
              label="Priority"
              type="select"
              required
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </FormField>
            <FormField
              label="Status"
              type="select"
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </FormField>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Maximum Score"
              type="number"
              step="0.1"
              value={formData.maxScore}
              onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
              placeholder="100"
            />
            <FormField
              label="Weight (%)"
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="15"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Assignments;