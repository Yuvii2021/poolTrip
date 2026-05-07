import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Plus, Edit2, Trash2, Eye,
  Calendar, X, Check, MapPin, Sparkles, Upload, Image,
  Info, DollarSign, Clock, Users, Ticket, CheckCircle2, XCircle, Loader2, Phone, MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { packageAPI, bookingAPI } from '../services/api';
import { TravelPackage, PackageRequest, PackageType, PackageTypeOption, TransportationOption, BookingResponse } from '../types';
import { LocationAutocomplete } from '../components/LocationAutocomplete';
import { getApiErrorMessage } from '../utils/error';
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

  totalSeats: 10,
  packageType: packageTypes[0]?.value as PackageType,
  transportation: transportationOptions[0]?.value,
  inclusions: '',
  exclusions: '',
  itinerary: [''],
  cancellationPolicy: '',
  termsAndConditions: '',
  featured: false,
  instantBooking: true,
});

// Helper to convert array to comma-separated string
const arrayToString = (arr: string[] | string | undefined): string => {
  if (!arr) return '';
  if (typeof arr === 'string') return arr;
  return arr.join(', ');
};

// Helper to determine if a URL/file is a video
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
  const lower = url.toLowerCase();
  return videoExtensions.some(ext => lower.includes(ext)) || lower.includes('/video/');
};

// Represents a media item (image or video) in the unified gallery
interface MediaItem {
  url: string;          // preview URL (blob or cloudinary)
  type: 'image' | 'video';
  isExisting: boolean;  // true if already uploaded to Cloudinary
  fileIndex?: number;    // index in mediaFiles array (for new files only)
}

export const DashboardPage = () => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TravelPackage | null>(null);
  const [formData, setFormData] = useState<PackageRequest>(() => getInitialFormData([], []));
  const [saving, setSaving] = useState(false);

  // Media state (images + videos in a single list)
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [existingMediaUrls, setExistingMediaUrls] = useState<string[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]); // blob URLs for new files

  // Drag and drop
  const [isDragging, setIsDragging] = useState(false);

  const [packageTypes, setPackageTypes] = useState<PackageTypeOption[]>([]);
  const [transportationOptions, setTransportationOptions] = useState<TransportationOption[]>([]);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Booking management state
  const [hostBookings, setHostBookings] = useState<BookingResponse[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [processingBookingId, setProcessingBookingId] = useState<number | null>(null);
  const [bookingActionNotice, setBookingActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadPackages();
    loadFilterOptions();
    loadHostBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFilterOptions = async () => {
    try {
      const options = await packageAPI.getFilterOptions();
      const types = options.packageTypes || [];
      const transport = options.transportationOptions || [];
      setPackageTypes(types);
      setTransportationOptions(transport);
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

  const loadHostBookings = async () => {
    try {
      const data = await bookingAPI.getHostBookings();
      setHostBookings(data);
    } catch (error) {
      console.error('Error loading host bookings:', error);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId: number) => {
    setProcessingBookingId(bookingId);
    try {
      await bookingAPI.approveBooking(bookingId);
      loadHostBookings();
      loadPackages(); // Refresh seat counts
      setBookingActionNotice({
        type: 'success',
        message: 'Booking approved successfully. Passenger ko confirmation mil jayega.',
      });
    } catch (err: unknown) {
      setBookingActionNotice({
        type: 'error',
        message: getApiErrorMessage(err, 'Failed to approve booking. Kripya dubara try karein.'),
      });
    } finally {
      setProcessingBookingId(null);
    }
  };

  const handleRejectBooking = async (bookingId: number) => {
    setProcessingBookingId(bookingId);
    try {
      await bookingAPI.rejectBooking(bookingId);
      loadHostBookings();
      setBookingActionNotice({
        type: 'success',
        message: 'Booking request rejected.',
      });
    } catch (err: unknown) {
      setBookingActionNotice({
        type: 'error',
        message: getApiErrorMessage(err, 'Failed to reject booking. Kripya dubara try karein.'),
      });
    } finally {
      setProcessingBookingId(null);
    }
  };

  const pendingBookings = hostBookings.filter(b => b.status === 'PENDING');
  const otherBookings = hostBookings.filter(b => b.status !== 'PENDING');

  // Build unified media items list for display
  const getMediaItems = useCallback((): MediaItem[] => {
    const items: MediaItem[] = [];

    // Existing media (Cloudinary URLs) — auto-detect type from URL
    existingMediaUrls.forEach((url) => {
      items.push({ url, type: isVideoUrl(url) ? 'video' : 'image', isExisting: true });
    });

    // New media files (blob previews) — detect type from file MIME
    mediaPreviewUrls.forEach((url, i) => {
      const file = mediaFiles[i];
      const type = file?.type?.startsWith('video/') ? 'video' : 'image';
      items.push({ url, type, isExisting: false, fileIndex: i });
    });

    return items;
  }, [existingMediaUrls, mediaPreviewUrls, mediaFiles]);

  const resetMediaState = () => {
    mediaPreviewUrls.forEach(u => URL.revokeObjectURL(u));
    setMediaFiles([]);
    setExistingMediaUrls([]);
    setMediaPreviewUrls([]);
    setIsDragging(false);
  };

  const handleOpenModal = (pkg?: TravelPackage) => {
    if (pkg) {
      setEditingPackage(pkg);

      // Parse existing media
      let existingMedia: string[] = [];
      if (pkg.media) {
        if (Array.isArray(pkg.media)) {
          existingMedia = pkg.media;
        } else if (typeof pkg.media === 'string') {
          existingMedia = (pkg.media as string).split(',').map(s => s.trim()).filter(Boolean);
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
        totalSeats: pkg.totalSeats,
        packageType: pkg.packageType,
        transportation: pkg.transportation || transportationOptions[0]?.value,
        inclusions: arrayToString(pkg.inclusions),
        exclusions: arrayToString(pkg.exclusions),
        itinerary: existingItinerary,
        cancellationPolicy: pkg.cancellationPolicy || '',
        termsAndConditions: pkg.termsAndConditions || '',
        featured: pkg.featured,
        instantBooking: pkg.instantBooking !== false,
      });

      setExistingMediaUrls(existingMedia);
      setMediaPreviewUrls([]);
      setMediaFiles([]);
    } else {
      setEditingPackage(null);
      setFormData(getInitialFormData(packageTypes, transportationOptions));
      resetMediaState();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPackage(null);
    setFormData(getInitialFormData(packageTypes, transportationOptions));
    resetMediaState();
  };

  // --- Image handlers ---
  const handleMediaFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).filter(
      f => f.type.startsWith('image/') || f.type.startsWith('video/')
    );
    const previewUrls = newFiles.map(f => URL.createObjectURL(f));

    setMediaFiles(prev => [...prev, ...newFiles]);
    setMediaPreviewUrls(prev => [...prev, ...previewUrls]);

    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  // --- Remove media item ---
  const handleRemoveMedia = (item: MediaItem) => {
    if (item.isExisting) {
      setExistingMediaUrls(prev => prev.filter(u => u !== item.url));
    } else if (item.fileIndex !== undefined) {
      setMediaFiles(prev => prev.filter((_, i) => i !== item.fileIndex));
      setMediaPreviewUrls(prev => prev.filter((_, i) => i !== item.fileIndex));
      URL.revokeObjectURL(item.url);
    }
  };

  // --- Drag and drop ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      f => f.type.startsWith('image/') || f.type.startsWith('video/')
    );
    if (files.length === 0) return;

    const previews = files.map(f => URL.createObjectURL(f));
    setMediaFiles(prev => [...prev, ...files]);
    setMediaPreviewUrls(prev => [...prev, ...previews]);
  };

  // --- Add media URL ---
  const handleAddMediaUrl = (url: string) => {
    if (!url.trim()) return;
    setExistingMediaUrls(prev => [...prev, url.trim()]);
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
      if (updated.length === 0) updated.push('');
      return { ...prev, itinerary: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: PackageRequest = {
        ...formData,
        packageType: formData.packageType || packageTypes[0]?.value as PackageType,
        transportation: formData.transportation || transportationOptions[0]?.value,
        existingMediaUrls: existingMediaUrls.length > 0 ? existingMediaUrls : undefined,
      };

      const files = mediaFiles.length > 0 ? mediaFiles : undefined;

      if (editingPackage) {
        const updated = await packageAPI.updatePackage(editingPackage.id, payload, files);
        setPackages((prev) =>
          prev.map((pkg) => (pkg.id === updated.id ? updated : pkg)),
        );
      } else {
        const created = await packageAPI.createPackage(payload, files);
        setPackages((prev) => [created, ...prev]);
      }
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
      setPackages((prev) => prev.filter((pkg) => pkg.id !== id));
    } catch (error) {
      console.error('Error deleting package:', error);
    }
  };

  const mediaItems = getMediaItems();

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
            <p className={styles.subtitle}>Your trips, your bookings — all in one place</p>
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

      {/* Booking Requests Section */}
      <section className={styles.packagesSection} style={{ marginTop: '2rem' }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Ticket size={20} />
            Booking Requests
            {pendingBookings.length > 0 && (
              <span className={styles.pendingBadge}>{pendingBookings.length} pending</span>
            )}
          </h2>
        </div>
        {bookingActionNotice && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: bookingActionNotice.type === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              color: bookingActionNotice.type === 'success' ? '#166534' : '#991b1b',
              border: bookingActionNotice.type === 'success' ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(239,68,68,0.25)',
            }}
          >
            {bookingActionNotice.message}
          </div>
        )}

        {bookingsLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Loading booking requests...</p>
          </div>
        ) : hostBookings.length === 0 ? (
          <div className={styles.emptyState}>
            <Ticket size={48} />
            <h3>No booking requests yet</h3>
            <p>When travellers book your packages, their requests will appear here</p>
          </div>
        ) : (
          <div className={styles.bookingRequestsList}>
            {/* Pending first */}
            {pendingBookings.map((booking) => (
              <div key={booking.id} className={`${styles.bookingRequestCard} ${styles.bookingPending}`}>
                <div className={styles.bookingRequestTop}>
                  <div className={styles.bookingPassenger}>
                    {booking.passengerPhoto ? (
                      <img src={booking.passengerPhoto} alt={booking.passengerName} className={styles.bookingAvatar} />
                    ) : (
                      <div className={styles.bookingAvatarFallback}>{booking.passengerName.charAt(0).toUpperCase()}</div>
                    )}
                    <div>
                      <strong>{booking.passengerName}</strong>
                      <span className={styles.bookingRequestDate}>
                        {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <span className={styles.bookingStatusTag} data-status="PENDING">
                    <Clock size={14} /> Pending
                  </span>
                </div>
                <div className={styles.bookingRequestDetails}>
                  <span><MapPin size={14} /> {booking.packageTitle}</span>
                  <span><Users size={14} /> {booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''}</span>
                </div>
                {booking.message && (
                  <div className={styles.bookingRequestMessage}>
                    <MessageCircle size={14} />
                    <span>"{booking.message}"</span>
                  </div>
                )}
                <div className={styles.bookingRequestActions}>
                  {booking.passengerPhone && (
                    <a href={`tel:${booking.passengerPhone}`} className={styles.bookingContactBtn}>
                      <Phone size={14} /> Call
                    </a>
                  )}
                  <button
                    className={styles.approveBtn}
                    onClick={() => handleApproveBooking(booking.id)}
                    disabled={processingBookingId === booking.id}
                  >
                    {processingBookingId === booking.id ? <Loader2 size={14} className={styles.spinningIcon} /> : <Check size={14} />}
                    Approve
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => handleRejectBooking(booking.id)}
                    disabled={processingBookingId === booking.id}
                  >
                    <X size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
            {/* Other bookings (confirmed, rejected, cancelled) */}
            {otherBookings.map((booking) => (
              <div key={booking.id} className={styles.bookingRequestCard}>
                <div className={styles.bookingRequestTop}>
                  <div className={styles.bookingPassenger}>
                    {booking.passengerPhoto ? (
                      <img src={booking.passengerPhoto} alt={booking.passengerName} className={styles.bookingAvatar} />
                    ) : (
                      <div className={styles.bookingAvatarFallback}>{booking.passengerName.charAt(0).toUpperCase()}</div>
                    )}
                    <div>
                      <strong>{booking.passengerName}</strong>
                      <span className={styles.bookingRequestDate}>
                        {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                  <span className={styles.bookingStatusTag} data-status={booking.status}>
                    {booking.status === 'CONFIRMED' && <><CheckCircle2 size={14} /> Confirmed</>}
                    {booking.status === 'REJECTED' && <><XCircle size={14} /> Rejected</>}
                    {booking.status === 'CANCELLED' && <><X size={14} /> Cancelled</>}
                  </span>
                </div>
                <div className={styles.bookingRequestDetails}>
                  <span><MapPin size={14} /> {booking.packageTitle}</span>
                  <span><Users size={14} /> {booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''}</span>
                </div>
                {booking.status === 'CONFIRMED' && (booking.passengerPhone || booking.passengerWhatsapp) && (
                  <div className={styles.bookingRequestActions}>
                    {booking.passengerPhone && (
                      <a href={`tel:${booking.passengerPhone}`} className={styles.bookingContactBtn}>
                        <Phone size={14} /> Call Traveller
                      </a>
                    )}
                    {booking.passengerWhatsapp && (
                      <a
                        href={`https://wa.me/${booking.passengerWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${booking.passengerName}! Regarding your booking for "${booking.packageTitle}".`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.bookingContactBtn}
                        style={{ color: '#22c55e', borderColor: '#bbf7d0' }}
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
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

                {/* ===== SECTION: Basic Info ===== */}
                <div className={styles.formSection}>
                  <div className={styles.formSectionTitle}>
                    <Info size={16} />
                    <span>Basic Information</span>
                  </div>
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
                        value={formData.transportation ?? ''}
                        onChange={(e) => setFormData({ ...formData, transportation: e.target.value })}
                      >
                        {transportationOptions.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
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

                    <div className={styles.formGroupCheck}>
                      <label>
                        <input
                          type="checkbox"
                          checked={formData.instantBooking !== false}
                          onChange={(e) => setFormData({ ...formData, instantBooking: e.target.checked })}
                        />
                        ⚡
                        Instant Booking
                      </label>
                      <span className={styles.formHint}>When enabled, bookings are confirmed instantly without your approval</span>
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
                </div>

                {/* ===== SECTION: Location ===== */}
                <div className={styles.formSection}>
                  <div className={styles.formSectionTitle}>
                    <MapPin size={16} />
                    <span>Location</span>
                  </div>
                  <div className={styles.formGrid}>
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
                  </div>
                </div>

                {/* ===== SECTION: Pricing & Duration ===== */}
                <div className={styles.formSection}>
                  <div className={styles.formSectionTitle}>
                    <DollarSign size={16} />
                    <span>Pricing & Duration</span>
                  </div>
                  <div className={styles.formGrid}>
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
                  </div>
                </div>

                {/* ===== SECTION: Schedule & Capacity ===== */}
                <div className={styles.formSection}>
                  <div className={styles.formSectionTitle}>
                    <Clock size={16} />
                    <span>Schedule & Capacity</span>
                  </div>
                  <div className={styles.formGrid}>
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
                      <label>Total Seats *</label>
                      <input
                        type="number"
                        value={formData.totalSeats}
                        onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) })}
                        min="1"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* ===== SECTION: Media ===== */}
                <div className={styles.formSection}>
                  <div className={styles.formSectionTitle}>
                    <Image size={16} />
                    <span>Media (Images & Videos)</span>
                  </div>

                  {/* Drag and Drop Zone */}
                  <div
                    className={`${styles.mediaUploadZone} ${isDragging ? styles.mediaUploadZoneDragging : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className={styles.mediaDropContent}>
                      <Upload size={28} className={styles.mediaDropIcon} />
                      <p className={styles.mediaDropText}>
                        Drag & drop images or videos here
                      </p>
                      <p className={styles.mediaDropHint}>or use the buttons below</p>
                    </div>

                    <div className={styles.mediaActions}>
                      <input
                        type="file"
                        ref={mediaInputRef}
                        onChange={handleMediaFilesUpload}
                        accept="image/*,video/*"
                        multiple
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        className={styles.uploadBtn}
                        onClick={() => mediaInputRef.current?.click()}
                      >
                        <Upload size={16} />
                        Upload Images / Videos
                      </button>
                    </div>

                    {/* URL Input */}
                    <div className={styles.mediaUrlInput}>
                      <input
                        type="text"
                        placeholder="Paste image or video URL and press Enter..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddMediaUrl((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Media Grid */}
                  {mediaItems.length > 0 && (
                    <div className={styles.mediaGrid}>
                      {mediaItems.map((item, index) => (
                        <motion.div
                          key={`${item.type}-${item.url}-${index}`}
                          className={styles.mediaItem}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          {item.type === 'image' ? (
                            <img src={item.url} alt={`Media ${index + 1}`} />
                          ) : (
                            <video src={item.url} muted preload="metadata" />
                          )}
                          <span className={`${styles.mediaBadge} ${item.type === 'video' ? styles.mediaBadgeVideo : ''}`}>
                            {item.type === 'image' ? 'IMG' : 'VID'}
                          </span>
                          <button
                            type="button"
                            className={styles.removeImage}
                            onClick={() => handleRemoveMedia(item)}
                          >
                            <X size={12} />
                          </button>
                          <span className={styles.imageNumber}>{index + 1}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <p className={styles.imageHint}>
                    Add images and videos for the package gallery. Drag & drop or use the upload buttons above.
                  </p>
                </div>

                {/* ===== SECTION: Details ===== */}
                <div className={styles.formSection}>
                  <div className={styles.formSectionTitle}>
                    <Users size={16} />
                    <span>Package Details</span>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Inclusions (comma-separated)</label>
                    <textarea
                      value={formData.inclusions || ''}
                      onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
                      placeholder="e.g., Accommodation, Meals, Airport transfers, Sightseeing tours..."
                      rows={2}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Exclusions (comma-separated)</label>
                    <textarea
                      value={formData.exclusions || ''}
                      onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
                      placeholder="e.g., Airfare, Personal expenses, Tips..."
                      rows={2}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Cancellation Policy</label>
                    <textarea
                      value={formData.cancellationPolicy || ''}
                      onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                      placeholder="Explain cancellation windows and refund rules..."
                      rows={3}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Terms & Conditions</label>
                    <textarea
                      value={formData.termsAndConditions || ''}
                      onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                      placeholder="Add terms travelers must agree to before booking..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* ===== SECTION: Itinerary ===== */}
                <div className={styles.formSection}>
                  <div className={styles.formSectionTitle}>
                    <Calendar size={16} />
                    <span>Itinerary</span>
                  </div>
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
