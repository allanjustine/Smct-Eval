import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import LoadingAnimation from "@/components/LoadingAnimation";
import { useToast } from "@/hooks/useToast";
import { useDialogAnimation } from "@/hooks/useDialogAnimation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface User {
  employee_id: string;
  fname: string;
  lname: string;
  email: string;
  position_id: number;
  department_id?: number | string;
  branch_id: number;
  role_id: number;
  username: string;
  password: string;
  contact: string;
  date_hired?: string;
}

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newUser: User) => void;
  departments: any;
  branches: any;
  positions: any;
  roles: any;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  departments,
  branches,
  positions,
  roles,
}) => {
  const [formData, setFormData] = useState<User>({
    employee_id: "",
    fname: "",
    lname: "",
    email: "",
    position_id: 0,
    department_id: "",
    branch_id: 0,
    role_id: 0,
    username: "",
    password: "",
    contact: "",
    date_hired: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const dialogAnimationClass = useDialogAnimation({ duration: 0.4 });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        employee_id: "",
        fname: "",
        lname: "",
        email: "",
        position_id: 0,
        department_id: "",
        branch_id: 0,
        role_id: 0,
        username: "",
        password: "",
        contact: "",
        date_hired: "",
      });
      setErrors({});
      setShowPassword(false);
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employee_id.trim()) {
      newErrors.employee_id = "Employee ID is required!";
    }
    if (!formData.fname.trim()) {
      newErrors.fname = "First name is required";
    }
    if (!formData.lname.trim()) {
      newErrors.lname = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.position_id) {
      newErrors.position_id = "Position is required";
    }

    if (formData.branch_id === 126 && !formData.department_id) {
      newErrors.department_id = "Department is required";
    }

    if (!formData.branch_id) {
      newErrors.branch_id = "Branch is required";
    }

    if (!formData.role_id) {
      newErrors.role_id = "Role is required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username cannot be empty if provided";
    }

    if (!formData.contact) {
      newErrors.contact = "Contact is required";
    } else {
      const contactDigits = formData.contact.replace(/\D/g, "");
      if (!contactDigits.startsWith("09")) {
        newErrors.contact = "Contact number must start with '09'";
      } else if (contactDigits.length !== 11) {
        newErrors.contact = "Contact number must be exactly 11 digits";
      }
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof User, value: string | boolean) => {
    if (formData.branch_id !== 126) {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        department_id: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSave = async () => {
    if (validateForm()) {
      setIsSaving(true);
      try {
        await onSave(formData);
        onClose();
        setIsSaving(false);
      } catch (error: any) {
        setIsSaving(false); // Reset loading state on error
        if (error.response?.data?.errors) {
          const backendErrors: Record<string, string> = {};

          Object.keys(error.response.data.errors).forEach((field) => {
            backendErrors[field] = error.response.data.errors[field][0];
          });
          setErrors(backendErrors);
        }
      }
    }
  };

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChangeAction={onClose}>
        <DialogContent
          className={`max-w-3xl max-h-[90vh] overflow-hidden p-0 ${dialogAnimationClass}`}
          style={{
            backgroundImage: 'url(/smct.png)',
            backgroundSize: '85%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Faded overlay for better content readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/95 to-indigo-100/95 pointer-events-none"></div>
          
          {/* Content wrapper with relative positioning */}
          <div className="relative z-10 max-h-[90vh] overflow-y-auto p-6">
            <DialogHeader className="pb-6">
            <DialogTitle className="text-xl font-semibold">
              Add New Employee
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Create a new employee account. All fields marked with * are
              required.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
            <div className="space-y-2 ">
              <Label htmlFor="employee_id">Employee ID</Label>
              <Input
                id="employee_id"
                placeholder="****-******"
                value={formData.employee_id}
                onChange={(e) => {
                  // Remove all non-numeric characters except dash
                  let value = e.target.value.replace(/[^\d-]/g, "");

                  // Remove all dashes first
                  value = value.replace(/-/g, "");

                  // Limit to 10 digits (4 + 6)
                  value = value.slice(0, 10);

                  // Add dash after first 4 digits
                  if (value.length > 4) {
                    value = value.slice(0, 4) + "-" + value.slice(4);
                  }

                  setFormData({ ...formData, employee_id: value });
                }}
                onKeyPress={(e) => {
                  // Only allow numbers
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                maxLength={11}
                className={errors?.employee_id ? "border-red-500" : "bg-white"}
              />
              {errors?.employee_id && (
                <p className="text-sm text-red-500">{errors?.employee_id}</p>
              )}
            </div>
            {/* fName */}
            <div className="space-y-2">
              <Label htmlFor="fname">First Name *</Label>
              <Input
                id="fname"
                value={formData.fname}
                onChange={(e) => handleInputChange("fname", e.target.value)}
                className={errors.fname ? "border-red-500 " : "bg-white"}
                placeholder="Enter first name"
              />
              {errors.fname && (
                <p className="text-sm text-red-500">{errors.fname}</p>
              )}
            </div>

            {/* lName */}
            <div className="space-y-2">
              <Label htmlFor="lname">Last Name *</Label>
              <Input
                id="lname"
                value={formData.lname}
                onChange={(e) => handleInputChange("lname", e.target.value)}
                className={errors.lname ? "border-red-500 " : "bg-white"}
                placeholder="Enter last name"
              />
              {errors.lname && (
                <p className="text-sm text-red-500">{errors.lname}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-red-500" : "bg-white"}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username || ""}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className={errors.username ? "border-red-500" : "bg-white"}
                placeholder="Enter username"
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password || ""}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className={
                    errors.password ? "border-red-500 pr-10" : "pr-10 bg-white"
                  }
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500">
                Password must be at least 8 characters
              </p>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number *</Label>
              <Input
                id="contact"
                type="tel"
                value={formData.contact || ""}
                onChange={(e) => {
                  // Remove all non-numeric characters
                  let value = e.target.value.replace(/\D/g, "");

                  // Limit to 11 digits
                  value = value.slice(0, 11);

                  handleInputChange("contact", value);
                }}
                onKeyPress={(e) => {
                  // Only allow numbers
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                maxLength={11}
                className={errors.contact ? "border-red-500" : "bg-white"}
                placeholder="09XXXXXXXXX (11 digits)"
              />
              {errors.contact && (
                <p className="text-sm text-red-500">{errors.contact}</p>
              )}
              <p className="text-xs text-gray-500">
                Must start with "09" and be exactly 11 digits
              </p>
            </div>

            {/* Date Hired */}
            <div className="space-y-2 w-1/2">
              <Label htmlFor="date_hired">Date Hired</Label>
              <Input
                id="date_hired"
                type="date"
                value={formData.date_hired || ""}
                onChange={(e) =>
                  handleInputChange("date_hired", e.target.value)
                }
                className={
                  errors.date_hired
                    ? "border-red-500 cursor-pointer"
                    : "bg-white cursor-pointer"
                }
              />
              {errors.date_hired && (
                <p className="text-sm text-red-500">{errors.date_hired}</p>
              )}
            </div>

            {/* Position */}
            <div className="space-y-2 w-1/2">
              <Label htmlFor="position_id">Position *</Label>
              <Combobox
                options={positions}
                value={formData.position_id}
                onValueChangeAction={(value) =>
                  handleInputChange("position_id", value as string)
                }
                placeholder="Select position"
                searchPlaceholder="Search positions..."
                emptyText="No positions found."
                className={errors.position_id ? "border-red-500" : "bg-white"}
              />
              {errors.position_id && (
                <p className="text-sm text-red-500">{errors.position_id}</p>
              )}
            </div>

            {/* Branch */}
            <div className="space-y-2 w-1/2">
              <Label htmlFor="branch_id">Branch *</Label>
              <Combobox
                options={branches}
                value={formData.branch_id || ""}
                onValueChangeAction={(value) =>
                  handleInputChange("branch_id", value as string)
                }
                placeholder="Select branch"
                searchPlaceholder="Search branches..."
                emptyText="No branches found."
                className={errors.branch_id ? "border-red-500" : ""}
              />
              {errors.branch_id && (
                <p className="text-sm text-red-500">{errors.branch_id}</p>
              )}
            </div>

            {/* Department - Show only if branch is HO, Head Office, or none */}
            {formData.branch_id === 126 && (
              <div className="space-y-2 w-1/2">
                <Label htmlFor="department">Department *</Label>
                <Combobox
                  options={departments}
                  value={String(formData.department_id)}
                  onValueChangeAction={(value) =>
                    handleInputChange("department_id", value as string)
                  }
                  placeholder="Select department"
                  searchPlaceholder="Search departments..."
                  emptyText="No departments found."
                  className={
                    errors.department_id ? "border-red-500" : "bg-white"
                  }
                />
                {errors.department_id && (
                  <p className="text-sm text-red-500">{errors.department_id}</p>
                )}
              </div>
            )}

            {/* Role */}
            <div className="space-y-2 w-1/2">
              <Label htmlFor="role_id">Role *</Label>
              <Select
                onValueChange={(value) => handleInputChange("role_id", value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role: any) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role_id && (
                <p className="text-sm text-red-500">{errors.role_id}</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-6 bg-red-600 hover:bg-red-700 text-white hover:text-white cursor-pointer hover:scale-110 transition-transform duration-200 shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className={`bg-green-600 hover:bg-green-700 text-white px-6 
    cursor-pointer hover:scale-110 transition-transform duration-200 
    shadow-lg hover:shadow-xl transition-all duration-300
    ${isSaving ? "opacity-70 cursor-not-allowed hover:scale-100" : ""}
  `}
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <LoadingAnimation size="sm" variant="spinner" color="green" />
                  <span>Adding...</span>
                </div>
              ) : (
                "Add Employee"
              )}
            </Button>
          </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading Modal Overlay */}
      {isSaving && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-xl max-w-sm w-full mx-4">
            <div className="flex flex-col items-center space-y-4">
              <LoadingAnimation
                size="lg"
                variant="spinner"
                color="green"
                showText={true}
                text="Adding employee..."
              />
              <p className="text-sm text-gray-600 text-center">
                Please wait while we add the new employee. This may take a few
                moments.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddEmployeeModal;
