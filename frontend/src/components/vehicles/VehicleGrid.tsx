import VehicleCard from './VehicleCard';
import { useFavorites } from '../../store/useFavorites';
import type { Vehicle } from '@shared/types';

interface VehicleGridProps {
  vehicles: Vehicle[];
  compareIds: number[];
  aiSelectedIds: number[];
  onCompareToggle: (id: number) => void;
  onAiSelectToggle: (id: number) => void;
}

export default function VehicleGrid({
  vehicles,
  compareIds,
  aiSelectedIds,
  onCompareToggle,
  onAiSelectToggle,
}: VehicleGridProps) {
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          isCompareSelected={compareIds.includes(vehicle.id)}
          isAiSelected={aiSelectedIds.includes(vehicle.id)}
          isFavorite={isFavorite(vehicle.id)}
          onCompareToggle={onCompareToggle}
          onAiSelectToggle={onAiSelectToggle}
          onFavoriteToggle={toggleFavorite}
        />
      ))}
    </div>
  );
}
