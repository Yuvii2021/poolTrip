import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Plus, Edit2, Trash2, Eye, 
  Calendar, X, Check, MapPin, Sparkles, Upload, Image
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { packageAPI } from '../services/api';
import { TravelPackage, PackageRequest, PackageType, VehicleType, PackageTypeOption, TransportationOption } from '../types';
import { LocationAutocomplete } from '../components/LocationAutocomplete';
import styles from './DashboardPage.module.css';


const getInitialFormData = (packageTypes: PackageTypeOption[], transportationOptions: TransportationOption[]): PackageRequest => ({
  title: '',
  destination: '',
  origin: '',
  description: '',
  price: 0,
  discountedPrice: undefined,
  durationDays: 1,
  durationNights: 0,
  startDate: '',
  endDate: '',
  totalSeats: 10,
  packageType: (packageTypes[0]?.value as PackageType) || 'ADVENTURE',
  vehicleType: (transportationOptions[0]?.value as VehicleType) || 'CAR',
  coverImage: '',
  inclusions: '',
  exclusions: '',
  itinerary: [''],
  featured: false,
});

// Helper to convert array to comma-separated string
const arrayToString = (arr: string[] | string | undefined): string => {
  if (!arr) return '';
  if (typeof arr === 'string') return arr;
  return arr.join(', ');
};

export const DashboardPage = () => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TravelPackage | null>(null);
  const [formData, setFormData] = useState<PackageRequest>(() => getInitialFormData([], []));
  const [saving, setSaving] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [packageTypes, setPackageTypes] = useState<PackageTypeOption[]>([]);
  const [transportationOptions, setTransportationOptions] = useState<TransportationOption[]>([]);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPackages();
    loadFilterOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFilterOptions = async () => {
    try {
      const options = await packageAPI.getFilterOptions();
      const types = options.packageTypes || [];
      const transport = options.transportationOptions || [];
      setPackageTypes(types);
      setTransportationOptions(transport);
      // Update form defaults if form is empty/reset
      if (!formData.title && !formData.destination) {
        setFormData(getInitialFormData(types, transport));
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const loadPackages = async () => {
    try {
      const data = await packageAPI.getMyPackages();
      setPackages(data);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pkg?: TravelPackage) => {
    if (pkg) {
      setEditingPackage(pkg);
      // Parse existing images
      let existingImages: string[] = [];
      if (pkg.images) {
        if (Array.isArray(pkg.images)) {
          existingImages = pkg.images;
        } else if (typeof pkg.images === 'string') {
          const imgStr = pkg.images;
          try {
            const parsed = JSON.parse(imgStr);
            existingImages = Array.isArray(parsed) ? parsed : [];
          } catch {
            existingImages = imgStr.split(',').map((s: string) => s.trim()).filter(Boolean);
          }
        }
      }
      // Parse itinerary
      let existingItinerary: string[] = [''];
      if (pkg.itinerary) {
        if (Array.isArray(pkg.itinerary)) {
          existingItinerary = pkg.itinerary.length > 0 ? pkg.itinerary : [''];
        } else if (typeof pkg.itinerary === 'string') {
          existingItinerary = (pkg.itinerary as string).split(',').map((s: string) => s.trim()).filter(Boolean);
          if (existingItinerary.length === 0) existingItinerary = [''];
        }
      }
      
      setFormData({
        title: pkg.title,
        destination: pkg.destination,
        origin: pkg.origin || '',
        description: pkg.description || '',
        price: pkg.price,
        discountedPrice: pkg.discountedPrice,
        durationDays: pkg.durationDays,
        durationNights: pkg.durationNights || 0,
        startDate: pkg.startDate || '',
        endDate: pkg.endDate || '',
        totalSeats: pkg.totalSeats,
        packageType: pkg.packageType,
        vehicleType: pkg.vehicleType || 'CAR',
        coverImage: pkg.coverImage || '',
        images: existingImages.join(','),
        inclusions: arrayToString(pkg.inclusions),
        exclusions: arrayToString(pkg.exclusions),
        itinerary: existingItinerary,
        featured: pkg.featured,
      });
      setAdditionalImages(existingImages);
    } else {
      setEditingPackage(null);
      setFormData(getInitialFormData(packageTypes, transportationOptions));
      setAdditionalImages([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPackage(null);
    setFormData(getInitialFormData(packageTypes, transportationOptions));
    setAdditionalImages([]);
  };

  const handleMultipleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setAdditionalImages(prev => {
            const updated = [...prev, base64String];
            setFormData(f => ({ ...f, images: updated.join(',') }));
            return updated;
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddImageUrl = (url: string) => {
    if (url.trim()) {
      setAdditionalImages(prev => {
        const updated = [...prev, url.trim()];
        setFormData(f => ({ ...f, images: updated.join(',') }));
        return updated;
      });
    }
  };

  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      setFormData(f => ({ ...f, images: updated.join(',') }));
      return updated;
    });
  };

  // Itinerary management functions
  const handleAddItineraryDay = () => {
    setFormData(prev => ({
      ...prev,
      itinerary: [...(prev.itinerary || []), '']
    }));
  };

  const handleUpdateItineraryDay = (index: number, value: string) => {
    setFormData(prev => {
      const updated = [...(prev.itinerary || [])];
      updated[index] = value;
      return { ...prev, itinerary: updated };
    });
  };

  const handleRemoveItineraryDay = (index: number) => {
    setFormData(prev => {
      const updated = (prev.itinerary || []).filter((_, i) => i !== index);
      // Ensure at least one day remains
      if (updated.length === 0) updated.push('');
      return { ...prev, itinerary: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingPackage) {
        await packageAPI.updatePackage(editingPackage.id, formData);
      } else {
        await packageAPI.createPackage(formData);
      }
      await loadPackages();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving package:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      await packageAPI.deletePackage(id);
      await loadPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
    }
  };

  return (
    <div className={styles.page}>
      {/* Background */}
      <div className={styles.bgEffects}>
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
      </div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>
              Welcome back,{' '}
              <span className={styles.titleGradient}>{user?.agencyName || user?.fullName}</span>
            </h1>
            <p className={styles.subtitle}>Manage your travel packages and grow your business</p>
          </div>
          <motion.button
            className={styles.addBtn}
            onClick={() => handleOpenModal()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={20} />
            Add Package
          </motion.button>
        </div>
      </header>

      {/* Packages Table */}
      <section className={styles.packagesSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Package size={20} />
            Your Packages
          </h2>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Loading packages...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={64} />
            <h3>No packages yet</h3>
            <p>Create your first travel package to get started</p>
            <button onClick={() => handleOpenModal()} className={styles.emptyBtn}>
              <Plus size={18} />
              Create Package
            </button>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Destination</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <motion.tr
                    key={pkg.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                  >
                    <td>
                      <div className={styles.packageInfo}>
                        <span className={styles.packageTitle}>{pkg.title}</span>
                        <span className={styles.packageType}>{pkg.packageType}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.destination}>
                        <MapPin size={14} />
                        {pkg.destination}
                      </div>
                    </td>
                    <td>{pkg.durationDays}D / {pkg.durationNights || pkg.durationDays - 1}N</td>
                    <td className={styles.price}>₹{pkg.price.toLocaleString()}</td>
                    <td>
                      <span className={styles.seats}>
                        {pkg.availableSeats}/{pkg.totalSeats}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.status} ${styles[`status${pkg.status}`]}`}>
                        {pkg.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => window.open(`/package/${pkg.id}`, '_blank')}
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleOpenModal(pkg)}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.actionDelete}`}
                          onClick={() => handleDelete(pkg.id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>{editingPackage ? 'Edit Package' : 'Create New Package'}</h2>
                <button className={styles.closeBtn} onClick={handleCloseModal}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Package Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Magical Kashmir Valley Tour"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Package Type *</label>
                    <select
                      value={formData.packageType}
                      onChange={(e) => setFormData({ ...formData, packageType: e.target.value as PackageType })}
                    >
                      {packageTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Transport Mode *</label>
                    <select
                      value={formData.vehicleType || transportationOptions[0]?.value || 'CAR'}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as VehicleType })}
                    >
                      {transportationOptions.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Destination *</label>
                    <LocationAutocomplete
                      value={formData.destination}
                      onChange={(value, location) => {
                        setFormData(prev => ({
                          ...prev,
                          destination: value,
                          destinationLatitude: location?.latitude,
                          destinationLongitude: location?.longitude,
                        }));
                      }}
                      placeholder="e.g., Kashmir"
                      required
                      showIcon={false}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Origin</label>
                    <LocationAutocomplete
                      value={formData.origin || ''}
                      onChange={(value, location) => {
                        setFormData(prev => ({
                          ...prev,
                          origin: value,
                          originLatitude: location?.latitude,
                          originLongitude: location?.longitude,
                        }));
                      }}
                      placeholder="e.g., Delhi"
                      showIcon={false}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Price (₹) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                      min="0"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Discounted Price (₹)</label>
                    <input
                      type="number"
                      value={formData.discountedPrice || ''}
                      onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                      min="0"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Duration (Days) *</label>
                    <input
                      type="number"
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                      min="1"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Duration (Nights)</label>
                    <input
                      type="number"
                      value={formData.durationNights}
                      onChange={(e) => setFormData({ ...formData, durationNights: parseInt(e.target.value) })}
                      min="0"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Departure Date *</label>
                    <input
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Return Date *</label>
                    <input
                      type="date"
                      value={formData.endDate || ''}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      min={formData.startDate || ''}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Total Seats *</label>
                    <input
                      type="number"
                      value={formData.totalSeats}
                      onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) })}
                      min="1"
                      required
                    />
                  </div>

                  <div className={styles.formGroupCheck}>
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      />
                      <Sparkles size={16} />
                      Featured Package
                    </label>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your travel package..."
                    rows={3}
                  />
                </div>

                {/* Gallery Images Section */}
                <div className={styles.formGroup}>
                  <label>
                    <Image size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    Gallery Images (for slider)
                  </label>
                  <div className={styles.imageUploadSection}>
                    <div className={styles.imageInputWrapper}>
                      <input
                        type="text"
                        placeholder="Paste image URL and press Enter..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddImageUrl((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <span className={styles.orDivider}>or</span>
                      <input
                        type="file"
                        ref={multiFileInputRef}
                        onChange={handleMultipleImagesUpload}
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        className={styles.uploadBtn}
                        onClick={() => multiFileInputRef.current?.click()}
                      >
                        <Upload size={16} />
                        Upload Multiple
                      </button>
                    </div>
                    {additionalImages.length > 0 && (
                      <div className={styles.imageGallery}>
                        {additionalImages.map((img, index) => (
                          <div key={index} className={styles.galleryItem}>
                            <img src={img} alt={`Gallery ${index + 1}`} />
                            <button
                              type="button"
                              className={styles.removeImage}
                              onClick={() => handleRemoveAdditionalImage(index)}
                            >
                              <X size={12} />
                            </button>
                            <span className={styles.imageNumber}>{index + 1}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className={styles.imageHint}>
                      Add multiple images for the package slider. Images will auto-rotate on the detail page.
                    </p>
                  </div>
                </div>

                {/* Inclusions */}
                <div className={styles.formGroup}>
                  <label>Inclusions (comma-separated)</label>
                  <textarea
                    value={formData.inclusions || ''}
                    onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
                    placeholder="e.g., Accommodation, Meals, Airport transfers, Sightseeing tours..."
                    rows={2}
                  />
                </div>

                {/* Exclusions */}
                <div className={styles.formGroup}>
                  <label>Exclusions (comma-separated)</label>
                  <textarea
                    value={formData.exclusions || ''}
                    onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
                    placeholder="e.g., Airfare, Personal expenses, Tips..."
                    rows={2}
                  />
                </div>

                {/* Itinerary */}
                <div className={styles.formGroup}>
                  <label>
                    <Calendar size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    Itinerary
                  </label>
                  <div className={styles.itineraryContainer}>
                    {(formData.itinerary || ['']).map((day, index) => (
                      <motion.div
                        key={index}
                        className={styles.itineraryCard}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className={styles.itineraryHeader}>
                          <span className={styles.dayBadge}>Day {index + 1}</span>
                          {(formData.itinerary || []).length > 1 && (
                            <button
                              type="button"
                              className={styles.removeItineraryBtn}
                              onClick={() => handleRemoveItineraryDay(index)}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                        <textarea
                          value={day}
                          onChange={(e) => handleUpdateItineraryDay(index, e.target.value)}
                          placeholder={`Describe activities for Day ${index + 1}...`}
                          rows={2}
                          className={styles.itineraryInput}
                        />
                      </motion.div>
                    ))}
                    <motion.button
                      type="button"
                      className={styles.addItineraryBtn}
                      onClick={handleAddItineraryDay}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus size={18} />
                      Add Day {(formData.itinerary || []).length + 1}
                    </motion.button>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button type="button" className={styles.cancelBtn} onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveBtn} disabled={saving}>
                    {saving ? (
                      <div className={styles.spinnerSmall} />
                    ) : (
                      <>
                        <Check size={18} />
                        {editingPackage ? 'Update Package' : 'Create Package'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


