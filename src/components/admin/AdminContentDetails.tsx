import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import toast from 'react-hot-toast';

// Define simplified type aliases to avoid deep type instantiation
type CarId = Id<"cars">;
type PartId = Id<"parts">;
type UserId = Id<"users">;

// Simple type definitions to avoid TypeScript errors
type CarQueryType = any;
type PartQueryType = any;
type UserQueryType = any;

// Form data interface defined outside the component
interface FormData {
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  name?: string;
  description?: string;
  category?: string;
  condition?: string;
  isPublished: boolean;
  isFeatured: boolean;
  [key: string]: any;
}

interface AdminContentDetailsProps {
  contentId: CarId | PartId;
  contentType: 'cars' | 'parts';
  onClose: () => void;
}

const AdminContentDetails = ({
  contentId,
  contentType,
  onClose
}: AdminContentDetailsProps) => {
  const [formData, setFormData] = useState<FormData>({ isPublished: false, isFeatured: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Use type casting with 'as any' to solve the deep instantiation issues
  const carData = contentType === 'cars'
    ? useQuery(
        api.cars.getCarById as any, 
        { carId: contentId as CarId }
      )
    : null;
  
  // Use type casting with 'as any' for part query
  const partData = contentType === 'parts'
    ? useQuery(
        api["admin/content"].getPartById as any, 
        { partId: contentId as PartId }
      )
    : null;
  
  // Get user data for the owner with type casting
  const userId = carData?.userId || partData?.userId;
  const userData = userId
    ? useQuery(
        api["admin/content"].getUserById as any, 
        { userId: userId as UserId }
      )
    : null;

  // Mutations for updating content
  const updateCar = useMutation(api.mutations.adminContent.updateCar);
  const updatePart = useMutation(api.mutations.adminContent.updatePart);
  const toggleCarPublish = useMutation(api.mutations.adminContent.toggleCarPublishStatus);
  const togglePartPublish = useMutation(api.mutations.adminContent.togglePartPublishStatus);
  const toggleCarFeature = useMutation(api.mutations.adminContent.toggleCarFeatureStatus);
  const togglePartFeature = useMutation(api.mutations.adminContent.togglePartFeatureStatus);

  // Initialize form data when content loads
  useEffect(() => {
    if (contentType === 'cars' && carData) {
      setFormData({
        // Convert year to number or use default
        year: carData.year ? parseInt(carData.year.toString(), 10) : undefined,
        make: carData.make || '',
        model: carData.model || '',
        // Safely check for trim property which might not exist on the car schema
        trim: (carData as any).trim || '',
        description: carData.description || '',
        isPublished: carData.isPublished || false,
        isFeatured: carData.isFeatured || false,
      });
      setIsLoading(false);
    } else if (contentType === 'parts' && partData) {
      setFormData({
        name: partData.name || '',
        description: partData.description || '',
        category: partData.category || '',
        condition: partData.condition || '',
        isPublished: partData.isPublished || false,
        isFeatured: partData.isFeatured || false,
      });
      setIsLoading(false);
    }
  }, [contentType, carData, partData]);

  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkboxes differently than other inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (contentType === 'cars') {
        await updateCar({ 
          carId: contentId as CarId,
          year: formData.year ? formData.year.toString() : undefined,
          make: formData.make,
          model: formData.model,
          trim: formData.trim,
          description: formData.description,
        });
      } else {
        await updatePart({ 
          partId: contentId as PartId,
          name: formData.name,
          description: formData.description,
          category: formData.category,
          condition: formData.condition,
          isPublished: formData.isPublished,
        });
      }
      toast.success(`${contentType === 'cars' ? 'Car' : 'Part'} updated successfully`);
    } catch (error: any) {
      toast.error(`Update failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle publish toggle with proper type casting
  const handleTogglePublish = async () => {
    try {
      if (contentType === 'cars') {
        // Car publish API requires explicit isPublished parameter
        await toggleCarPublish({ carId: contentId as CarId, isPublished: !formData.isPublished });
        toast.success(`Car ${formData.isPublished ? 'unpublished' : 'published'}`);
      } else {
        // Part publish API doesn't take isPublished parameter - it toggles automatically
        await togglePartPublish({ partId: contentId as PartId });
        toast.success(`Part ${formData.isPublished ? 'unpublished' : 'published'}`);
      }
      
      // Toggle local state
      setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }));
    } catch (error: any) {
      toast.error(`Failed to update publish status: ${error.message}`);
    }
  };

  // Handle feature toggle with proper type casting
  const handleToggleFeature = async () => {
    try {
      if (contentType === 'cars') {
        await toggleCarFeature({ carId: contentId as CarId });
        toast.success(`Car ${formData.isFeatured ? 'unfeatured' : 'featured'}`);
      } else {
        await togglePartFeature({ partId: contentId as PartId });
        toast.success(`Part ${formData.isFeatured ? 'unfeatured' : 'featured'}`);
      }
      
      // Toggle local state
      setFormData(prev => ({ ...prev, isFeatured: !prev.isFeatured }));
    } catch (error: any) {
      toast.error(`Failed to update feature status: ${error.message}`);
    }
  };

  // Show loading state if data is not ready
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-lg">Loading content details...</span>
          </div>
        </div>
      </div>
    );
  }

  // Content details view/edit form
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {contentType === 'cars' ? `${formData.year} ${formData.make} ${formData.model}` : formData.name}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content type and owner info */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
            <p className="font-medium">{contentType === 'cars' ? 'Car' : 'Part'}</p>
          </div>
          <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Owner</p>
            <p className="font-medium">
              {userData ? `${userData.name || 'Anonymous'} (${userData.email})` : 'Loading...'}
            </p>
          </div>
        </div>
        
        {/* Status toggles */}
        <div className="mb-6 flex space-x-4">
          <button
            onClick={handleTogglePublish}
            className={`px-4 py-2 rounded-md flex items-center ${
              formData.isPublished
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
            }`}
          >
            <span className={`w-3 h-3 rounded-full mr-2 ${formData.isPublished ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
            {formData.isPublished ? 'Published' : 'Draft'}
          </button>
          
          <button
            onClick={handleToggleFeature}
            className={`px-4 py-2 rounded-md flex items-center ${
              formData.isFeatured
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-gray-100 text-gray-800 border border-gray-300'
            }`}
          >
            <span className={`w-3 h-3 rounded-full mr-2 ${formData.isFeatured ? 'bg-blue-500' : 'bg-gray-500'}`}></span>
            {formData.isFeatured ? 'Featured' : 'Not Featured'}
          </button>
        </div>
        
        {/* Content details form */}
        <form onSubmit={handleSubmit}>
          {contentType === 'cars' ? (
            // Car form fields
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Make</label>
                  <input
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trim</label>
                <input
                  type="text"
                  name="trim"
                  value={formData.trim}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
            </>
          ) : (
            // Part form fields
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700"
                  >
                    <option value="">Select condition</option>
                    <option value="new">New</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
            </>
          )}
          
          {/* Description field for both cars and parts */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700"
            ></textarea>
          </div>
          
          {/* Form actions */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminContentDetails;
