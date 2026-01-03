'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface LandParcel {
  id: string;
  area: number;
  unit: string;
  cropType: string;
  soilType: string;
  irrigationType: string;
  location: string;
}

interface FarmInformationProps {
  parcels: LandParcel[];
  onAddParcel: (parcel: Omit<LandParcel, 'id'>) => void;
  onEditParcel: (id: string, parcel: Partial<LandParcel>) => void;
  onDeleteParcel: (id: string) => void;
}

const FarmInformation = ({ parcels, onAddParcel, onEditParcel, onDeleteParcel }: FarmInformationProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAddingParcel, setIsAddingParcel] = useState(false);
  const [editingParcelId, setEditingParcelId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<LandParcel, 'id'>>({
    area: 0,
    unit: 'acres',
    cropType: '',
    soilType: '',
    irrigationType: '',
    location: '',
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const cropTypes = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Pulses', 'Vegetables', 'Fruits'];
  const soilTypes = ['Alluvial', 'Black', 'Red', 'Laterite', 'Desert', 'Mountain'];
  const irrigationTypes = ['Drip', 'Sprinkler', 'Flood', 'Rainfed', 'Canal'];

  const handleSubmit = (e: React.FormEvent) => {
    if (!isHydrated) return;
    e.preventDefault();
    if (editingParcelId) {
      onEditParcel(editingParcelId, formData);
      setEditingParcelId(null);
    } else {
      onAddParcel(formData);
      setIsAddingParcel(false);
    }
    setFormData({
      area: 0,
      unit: 'acres',
      cropType: '',
      soilType: '',
      irrigationType: '',
      location: '',
    });
  };

  const handleEdit = (parcel: LandParcel) => {
    if (!isHydrated) return;
    setEditingParcelId(parcel.id);
    setFormData({
      area: parcel.area,
      unit: parcel.unit,
      cropType: parcel.cropType,
      soilType: parcel.soilType,
      irrigationType: parcel.irrigationType,
      location: parcel.location,
    });
    setIsAddingParcel(true);
  };

  const handleCancel = () => {
    if (!isHydrated) return;
    setIsAddingParcel(false);
    setEditingParcelId(null);
    setFormData({
      area: 0,
      unit: 'acres',
      cropType: '',
      soilType: '',
      irrigationType: '',
      location: '',
    });
  };

  if (!isHydrated) {
    return (
      <div className="bg-card rounded-lg shadow-card p-6 mb-6">
        <div className="h-8 bg-muted rounded animate-pulse w-48 mb-4" />
        <div className="space-y-4">
          <div className="h-32 bg-muted rounded animate-pulse" />
          <div className="h-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-card p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <Icon name="MapIcon" size={28} className="text-primary" />
          Farm Information
        </h2>
        {!isAddingParcel && (
          <button
            onClick={() => setIsAddingParcel(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-150 font-body font-medium"
          >
            <Icon name="PlusIcon" size={20} />
            Add Parcel
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAddingParcel && (
        <form onSubmit={handleSubmit} className="bg-muted rounded-lg p-4 mb-6">
          <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
            {editingParcelId ? 'Edit Land Parcel' : 'Add New Land Parcel'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-body font-medium text-foreground mb-2">
                Area *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) })}
                  className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="px-3 py-2 border border-input rounded-md bg-background text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-body font-medium text-foreground mb-2">
                Crop Type *
              </label>
              <select
                value={formData.cropType}
                onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">Select Crop Type</option>
                {cropTypes.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-body font-medium text-foreground mb-2">
                Soil Type *
              </label>
              <select
                value={formData.soilType}
                onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">Select Soil Type</option>
                {soilTypes.map((soil) => (
                  <option key={soil} value={soil}>
                    {soil}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-body font-medium text-foreground mb-2">
                Irrigation Type *
              </label>
              <select
                value={formData.irrigationType}
                onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">Select Irrigation Type</option>
                {irrigationTypes.map((irrigation) => (
                  <option key={irrigation} value={irrigation}>
                    {irrigation}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-body font-medium text-foreground mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Village, District, State"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground font-body focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-150 font-body font-medium"
            >
              {editingParcelId ? 'Update Parcel' : 'Add Parcel'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors duration-150 font-body font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Parcels List */}
      <div className="space-y-4">
        {parcels.length === 0 ? (
          <div className="text-center py-12 text-text-secondary bg-muted/30 rounded-lg border border-border">
            <Icon name="MapIcon" size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-body text-base mb-2">No land parcels added yet.</p>
            <p className="font-body text-sm">Click "Add Parcel" to add your farm details.</p>
          </div>
        ) : (
          parcels.map((parcel) => (
            <div
              key={parcel.id}
              className="bg-background border border-border rounded-lg p-5 hover:shadow-card transition-all duration-150 hover:border-primary/20"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-muted/30 rounded-md p-3">
                    <p className="text-xs font-body text-text-secondary mb-1 flex items-center gap-1">
                      <Icon name="MapIcon" size={14} />
                      Area
                    </p>
                    <p className="font-body font-semibold text-foreground text-lg">
                      {parcel.area} {parcel.unit}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-md p-3">
                    <p className="text-xs font-body text-text-secondary mb-1 flex items-center gap-1">
                      <Icon name="ChartBarIcon" size={14} />
                      Crop Type
                    </p>
                    <p className="font-body font-semibold text-foreground text-lg">{parcel.cropType}</p>
                  </div>
                  <div className="bg-muted/30 rounded-md p-3">
                    <p className="text-xs font-body text-text-secondary mb-1 flex items-center gap-1">
                      <Icon name="MapPinIcon" size={14} />
                      Soil Type
                    </p>
                    <p className="font-body font-semibold text-foreground text-lg">{parcel.soilType}</p>
                  </div>
                  <div className="bg-muted/30 rounded-md p-3">
                    <p className="text-xs font-body text-text-secondary mb-1 flex items-center gap-1">
                      <Icon name="MapPinIcon" size={14} />
                      Irrigation
                    </p>
                    <p className="font-body font-semibold text-foreground text-lg">{parcel.irrigationType}</p>
                  </div>
                  <div className="sm:col-span-2 bg-muted/30 rounded-md p-3">
                    <p className="text-xs font-body text-text-secondary mb-1 flex items-center gap-1">
                      <Icon name="MapPinIcon" size={14} />
                      Location
                    </p>
                    <p className="font-body font-semibold text-foreground text-lg">{parcel.location}</p>
                  </div>
                </div>
                <div className="flex sm:flex-col gap-2">
                  <button
                    onClick={() => handleEdit(parcel)}
                    className="flex items-center justify-center gap-1 px-4 py-2 text-primary hover:bg-primary/10 rounded-md transition-colors duration-150 font-body text-sm font-medium"
                  >
                    <Icon name="PencilIcon" size={16} />
                    Edit
                  </button>
                  {parcels.length > 1 && (
                    <button
                      onClick={() => onDeleteParcel(parcel.id)}
                      className="flex items-center justify-center gap-1 px-4 py-2 text-error hover:bg-error/10 rounded-md transition-colors duration-150 font-body text-sm font-medium"
                    >
                      <Icon name="TrashIcon" size={16} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FarmInformation;
