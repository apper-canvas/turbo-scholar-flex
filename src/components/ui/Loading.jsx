import ApperIcon from "@/components/ApperIcon";

const Loading = () => {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse opacity-20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ApperIcon name="BookOpen" className="w-8 h-8 text-primary animate-bounce" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse mx-auto w-32"></div>
          <div className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded animate-pulse mx-auto w-24"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;