import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Empty = ({ 
  icon = "BookOpen", 
  title = "No items found", 
  description = "Get started by adding your first item.", 
  actionText = "Add Item",
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-6">
      <div className="relative">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-blue-50 to-indigo-100 flex items-center justify-center shadow-inner">
          <ApperIcon name={icon} className="w-12 h-12 text-primary" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-accent to-orange-500 rounded-full flex items-center justify-center shadow-lg">
          <ApperIcon name="Plus" className="w-4 h-4 text-white" />
        </div>
      </div>
      
      <div className="space-y-3 max-w-md">
        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>

      {onAction && actionText && (
        <div className="pt-2">
          <Button 
            onClick={onAction}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Empty;