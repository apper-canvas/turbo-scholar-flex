import Label from "@/components/atoms/Label";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";

const FormField = ({ 
  label, 
  type = "text", 
  required = false, 
  error,
  options = [],
  rows = 3,
  children,
  ...props 
}) => {
  const renderInput = () => {
    if (type === "select") {
      return (
        <Select error={!!error} {...props}>
          {children || options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      );
    }
    
    if (type === "textarea") {
      return <Textarea rows={rows} error={!!error} {...props} />;
    }
    
    return <Input type={type} error={!!error} {...props} />;
  };

  return (
    <div className="space-y-1">
      <Label required={required}>{label}</Label>
      {renderInput()}
      {error && (
        <p className="text-sm text-error mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormField;