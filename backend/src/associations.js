// Atualizar associações no associations.js
import sequelize from './config/database.config.js';

// Importar todos os modelos
import Parcel from './modules/parcels/models/Parcel.model.js';
import Crop from './modules/crops/models/Crop.model.js';
import Livestock from './modules/livestock/models/Livestock.model.js';
import Inventory from './modules/inventory/models/Inventory.model.js';
import Finance from './modules/finance/models/Finance.model.js';
import Feeding from './modules/livestock/models/feeding.model.js';
import Vaccination from './modules/livestock/models/vaccination.model.js';
import Reproduction from './modules/livestock/models/reproduction.model.js';
import VeterinarySupply from './modules/livestock/models/veterinarySupply.model.js';
import LivestockSupplyUsage from './modules/livestock/models/livestockSupplyUsage.model.js';
import Farm from './modules/farms/models/Farm.model.js';

// Definir associações
// Farm - Parcel (1:N)
Farm.hasMany(Parcel, { foreignKey: 'farmId', as: 'parcels' });
Parcel.belongsTo(Farm, { foreignKey: 'farmId', as: 'farm' });

// Parcel - Crop (1:N)
Parcel.hasMany(Crop, { foreignKey: 'parcelId', as: 'crops' });
Crop.belongsTo(Parcel, { foreignKey: 'parcelId', as: 'parcel' });

// Parcel - Livestock (1:N)
Parcel.hasMany(Livestock, { foreignKey: 'parcelId', as: 'livestocks' });
Livestock.belongsTo(Parcel, { foreignKey: 'parcelId', as: 'parcel' });

// Livestock - Feeding (1:N)
Livestock.hasMany(Feeding, { foreignKey: 'livestockId', as: 'feedings' });
Feeding.belongsTo(Livestock, { foreignKey: 'livestockId', as: 'feedingLivestock' });

// Livestock - Vaccination (1:N)
Livestock.hasMany(Vaccination, { foreignKey: 'livestockId', as: 'vaccinations' });
Vaccination.belongsTo(Livestock, { foreignKey: 'livestockId', as: 'vaccinationLivestock' });

// Livestock - Reproduction (1:N)
Livestock.hasMany(Reproduction, { foreignKey: 'livestockId', as: 'reproductions' });
Reproduction.belongsTo(Livestock, { foreignKey: 'livestockId', as: 'reproductionLivestock' });

// VeterinarySupply - LivestockSupplyUsage (1:N)
VeterinarySupply.hasMany(LivestockSupplyUsage, { foreignKey: 'supplyId', as: 'supplyUsages' });
LivestockSupplyUsage.belongsTo(VeterinarySupply, { foreignKey: 'supplyId', as: 'usageSupply' });

// Livestock - LivestockSupplyUsage (1:N)
Livestock.hasMany(LivestockSupplyUsage, { foreignKey: 'livestockId', as: 'supplyUsages' });
LivestockSupplyUsage.belongsTo(Livestock, { foreignKey: 'livestockId', as: 'usageLivestock' });

// Exportar modelos
export {
  sequelize,
  Farm,
  Parcel,
  Crop,
  Livestock,
  Inventory,
  Finance,
  Feeding,
  Vaccination,
  Reproduction,
  VeterinarySupply,
  LivestockSupplyUsage
};