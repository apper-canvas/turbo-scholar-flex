import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const ErrorView = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
      <div className="relative">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-red-100 to-red-200 flex items-center justify-center">
          <ApperIcon name="AlertTriangle" className="w-10 h-10 text-red-500" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center animate-pulse">
          <ApperIcon name="X" className="w-4 h-4 text-white" />
        </div>
      </div>
      
      <div className="space-y-3 max-w-md">
        <h3 className="text-xl font-bold text-gray-900">Oops! Something went wrong</h3>
        <p className="text-gray-600 leading-relaxed">
          {error || "We encountered an unexpected error. Please try again or contact support if the problem persists."}
        </p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <Button 
            onClick={onRetry}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <ApperIcon name="RefreshCw" className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default ErrorView;