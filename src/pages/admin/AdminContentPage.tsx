import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Trash2, AlertCircle, Edit, Eye, Star, StarOff, Globe, Lock } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import toast from 'react-hot-toast';
import AdminContentDetails from '../../components/admin/AdminContentDetails';

const AdminContentPage = () => {
  // State for content filter, search, pagination, and modals
  const [contentType, setContentType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const itemsPerPage = 10;
  
  // Fetch cars and parts data
  const cars = useQuery(api.admin.getAllCars);
  const parts = useQuery(api.admin.getAllParts);
  
  // Owner information now comes directly from the getAllCars and getAllParts queries
  
  // Define type for content items
  type Owner = {
    name?: string;
    email?: string;
    username?: string;
  };
  
  type ContentItem = {
    _id: Id<any>;
    title: string;
    type: 'cars' | 'parts';
    userId: string;
    owner?: Owner | null;
    imageUrl: string | null;
    _creationTime: number;
    isPublished: boolean;
    isFeatured: boolean;
  };

  // Combine cars and parts into a single content array
  const content = useMemo(() => {
    if (!cars || !parts) return undefined;
    
    const carsContent: ContentItem[] = cars.map(car => {
      // Safely extract owner data
      const owner = car.owner && typeof car.owner === 'object' ? {
        name: car.owner.name || '',
        email: car.owner.email || '',
        username: car.owner.username || ''
      } : null;
      
      return {
        _id: car._id,
        title: `${car.year} ${car.make} ${car.model}`,
        type: 'cars',
        userId: car.userId || '',
        owner,
        imageUrl: car.images && car.images.length > 0 ? car.images[0] : null,
        _creationTime: car._creationTime,
        isPublished: Boolean(car.isPublished),
        isFeatured: Boolean(car.isFeatured) // Handle potentially undefined isFeatured property
      };
    });
    
    const partsContent: ContentItem[] = parts.map(part => {
      // Safely extract owner data
      const owner = part.owner && typeof part.owner === 'object' ? {
        name: part.owner.name || '',
        email: part.owner.email || '',
        username: part.owner.username || ''
      } : null;
      
      return {
        _id: part._id,
        title: part.name || 'Unnamed Part',
        type: 'parts',
        userId: part.userId || '',
        owner,
        imageUrl: part.image || null, // Parts use 'image' not 'images'
        _creationTime: part._creationTime,
        isPublished: Boolean(part.isPublished), // Handle potentially undefined isPublished property
        isFeatured: Boolean(part.isFeatured) // Handle potentially undefined isFeatured property
      };
    });
    
    return [...carsContent, ...partsContent];
  }, [cars, parts]);
  
  // Filter content based on type and search term
  const filteredContent = useMemo(() => {
    if (!content) return [];
    
    // First filter by content type
    const typeFiltered = contentType !== 'all'
      ? content.filter(item => item.type === contentType)
      : content;
    
    // Then filter by search term if it exists
    if (!searchTerm.trim()) return typeFiltered;
    
    const term = searchTerm.toLowerCase();
    return typeFiltered.filter(item => 
      item.title?.toLowerCase().includes(term) || 
      item.userId?.toLowerCase().includes(term)
    );
  }, [content, contentType, searchTerm]);
  
  // Get current page items
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredContent.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredContent, currentPage, itemsPerPage]);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);
  
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [contentType, searchTerm]);
  
  // Mutations for content management
  const deleteCar = useMutation(api.mutations.admin.deleteCar);
  const deletePart = useMutation(api.mutations.admin.deletePart);
  const toggleCarPublish = useMutation(api.mutations.adminContent.toggleCarPublishStatus);
  const togglePartPublish = useMutation(api.mutations.adminContent.togglePartPublishStatus);
  const toggleCarFeature = useMutation(api.mutations.adminContent.toggleCarFeatureStatus);
  const togglePartFeature = useMutation(api.mutations.adminContent.togglePartFeatureStatus);
  
  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  
  // Item action handlers
  const handleViewClick = (item: any) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setSelectedItem(null);
    setIsViewModalOpen(false);
  };
  
  // Delete handlers
  const handleDeleteClick = (item: any) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      if (itemToDelete.type === 'cars') {
        await deleteCar({ carId: itemToDelete._id });
        toast.success('Car deleted successfully');
      } else if (itemToDelete.type === 'parts') {
        await deletePart({ partId: itemToDelete._id });
        toast.success('Part deleted successfully');
      }
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      toast.error(`Failed to delete ${itemToDelete.type === 'cars' ? 'car' : 'part'}: ${error.message}`);
    }
  };
  
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };
  
  // Toggle publish status
  const updateCarPublishStatus = useMutation(api.mutations.carPublishing.updateCarPublishStatus);

  const handleTogglePublish = async (item: any) => {
    try {
      if (item.type === 'cars') {
        // Use the new mutation that publishes both car and its parts
        const result = await updateCarPublishStatus({ 
          carId: item._id as Id<"cars">,
          isPublished: !Boolean(item.isPublished)
        });
        const partsUpdated = result?.partsUpdated || 0;
        toast.success(
          `Car ${!item.isPublished ? 'published' : 'unpublished'} with ${partsUpdated} parts`
        );
      } else {
        await togglePartPublish({ partId: item._id as Id<"parts"> });
        toast.success(`Part ${!item.isPublished ? 'published' : 'unpublished'}`);
      }
    } catch (error: any) {
      toast.error(`Failed to update publish status: ${error.message}`);
    }
  };
  
  // Toggle featured status
  const handleToggleFeature = async (item: any) => {
    try {
      if (item.type === 'cars') {
        await toggleCarFeature({ carId: item._id as Id<"cars"> });
        toast.success(`Car ${!item.isFeatured ? 'featured' : 'unfeatured'}`);
      } else {
        await togglePartFeature({ partId: item._id as Id<"parts"> });
        toast.success(`Part ${!item.isFeatured ? 'featured' : 'unfeatured'}`);
      }
    } catch (error: any) {
      toast.error(`Failed to update feature status: ${error.message}`);
    }
  };

  const renderContent = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Content Management</h2>
      
      {/* Filter controls */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setContentType('all')}
          className={`px-4 py-2 text-sm rounded-md ${
            contentType === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All Content
        </button>
        <button
          onClick={() => setContentType('parts')}
          className={`px-4 py-2 text-sm rounded-md ${
            contentType === 'parts' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Parts
        </button>
        <button
          onClick={() => setContentType('cars')}
          className={`px-4 py-2 text-sm rounded-md ${
            contentType === 'cars' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Cars
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="mt-4 mb-4 relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-10 pr-4 block w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder="Search content by title or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Found {filteredContent.length} results
          </div>
        )}
      </div>
      
      {!content ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Content</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={`${item.type}-${item._id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white flex items-center">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="h-10 w-10 rounded-md mr-3 object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700 mr-3 flex items-center justify-center">
                            {item.type === 'cars' ? '🚗' : '🔧'}
                          </div>
                        )}
                        {item.title}
                        {item.isFeatured && (
                          <span className="ml-2">
                            <Star size={16} className="text-yellow-500 inline" />
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">{item.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {(() => {
                          // Safely display owner information with multiple fallbacks
                          try {
                            if (item.owner && typeof item.owner === 'object') {
                              return item.owner.username || item.owner.name || 'Anonymous';
                            }
                            return 'Unknown';
                          } catch (error) {
                            console.error('Error displaying owner:', error);
                            return 'Unknown';
                          }
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(item._creationTime).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                            item.isPublished === true ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}
                          onClick={() => handleTogglePublish(item)}
                        >
                          {item.isPublished === true ? (
                            <>
                              <Globe className="h-3 w-3 mr-1" /> Published
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3 mr-1" /> Draft
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewClick(item)}
                            className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                            title="View/Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleToggleFeature(item)}
                            className={`${item.isFeatured ? 'text-yellow-600 hover:text-yellow-900' : 'text-gray-400 hover:text-gray-600'}`}
                            title={item.isFeatured ? "Remove from featured" : "Add to featured"}
                          >
                            {item.isFeatured ? (
                              <StarOff className="h-5 w-5" />
                            ) : (
                              <Star className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No content found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredContent.length > 0 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Previous
                </button>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{Math.min(filteredContent.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{' '}
                    <span className="font-medium">{Math.min(filteredContent.length, currentPage * itemsPerPage)}</span> of{' '}
                    <span className="font-medium">{filteredContent.length}</span> items
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => goToPage(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNumber ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
  
  return (
    <>
      {renderContent()}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center text-red-600 mb-4">
              <AlertCircle size={24} />
              <h3 className="text-xl font-bold ml-2">Delete {itemToDelete.type === 'cars' ? 'Car' : 'Part'}</h3>
            </div>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this {itemToDelete.type === 'cars' ? 'car' : 'part'}: <span className="font-semibold">{itemToDelete.title}</span>?
              <br /><br />
              This action cannot be undone and all associated data will be permanently lost.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* View/Edit Content Modal */}
      {isViewModalOpen && selectedItem && (
        <AdminContentDetails
          contentId={selectedItem._id}
          contentType={selectedItem.type}
          onClose={handleCloseViewModal}
        />
      )}
    </>
  );
};

export default AdminContentPage;
