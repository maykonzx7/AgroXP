// Atualizar associações no associations.js
import sequelize from './config/database.config.js';
// Importar todos os modelos
import Parcel from './modules/parcels/Parcel.model.js';
import Crop from './modules/crops/Crop.model.js';
import Livestock from './modules/livestock/Livestock.model.js';
import Inventory from './modules/inventory/Inventory.model.js';
import Finance from './modules/finance/Finance.model.js';
import Harvest from './modules/harvest/Harvest.model.js';
import Feeding from './modules/livestock/feeding.model.js';
import Vaccination from './modules/livestock/vaccination.model.js';
import Reproduction from './modules/livestock/reproduction.model.js';
import VeterinarySupply from './modules/livestock/veterinarySupply.model.js';
import LivestockSupplyUsage from './modules/livestock/livestockSupplyUsage.model.js';
// Definir associações
// Parcel - Crop (1:N)
Parcel.hasMany(Crop, { foreignKey: 'parcelId', as: 'crops' });
Crop.belongsTo(Parcel, { foreignKey: 'parcelId', as: 'parcel' });
// Parcel - Livestock (1:N)
Parcel.hasMany(Livestock, { foreignKey: 'parcelId', as: 'livestocks' });
Livestock.belongsTo(Parcel, { foreignKey: 'parcelId', as: 'parcel' });
// Farm - Parcel (1:N) - Adding the relationship that represents multi-tenant structure
import Farm from './modules/farms/Farm.model.js';
Parcel.belongsTo(Farm, { foreignKey: 'farmId', as: 'farm' });
Farm.hasMany(Parcel, { foreignKey: 'farmId', as: 'parcels' });
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
export { sequelize, Parcel, Crop, Livestock, Inventory, Finance, Harvest, Feeding, Vaccination, Reproduction, VeterinarySupply, LivestockSupplyUsage };
