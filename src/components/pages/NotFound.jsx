import { Link } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="text-center space-y-8 max-w-lg">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-primary to-secondary opacity-10 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ApperIcon name="BookX" className="w-16 h-16 text-primary" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-2xl font-bold text-gray-900">Page Not Found</h2>
          <p className="text-gray-600 leading-relaxed">
            Oops! The page you're looking for seems to have wandered off to study elsewhere. 
            Let's get you back to your academic dashboard.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button 
            as={Link}
            to="/"
            className="w-full sm:w-auto"
          >
            <ApperIcon name="Home" className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
          
          <Button 
            variant="ghost"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Quick Links */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-4">Quick access to your academic tools:</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link 
              to="/courses" 
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              My Courses
            </Link>
            <span className="text-gray-300">•</span>
            <Link 
              to="/assignments" 
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              Assignments
            </Link>
            <span className="text-gray-300">•</span>
            <Link 
              to="/calendar" 
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              Calendar
            </Link>
            <span className="text-gray-300">•</span>
            <Link 
              to="/grades" 
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              Grades
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;