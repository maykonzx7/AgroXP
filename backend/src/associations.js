// Atualizar associações no associations.js
import sequelize from './config/database.js';

// Importar todos os modelos
import Parcel from './modules/parcels/Parcel.model.js';
import Crop from './modules/crops/Crop.model.js';
import Livestock from './modules/livestock/Livestock.model.js';
import Inventory from './models/Inventory.js';
import Finance from './models/Finance.js';
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

// Livestock - Feeding (1:N)
Livestock.hasMany(Feeding, { foreignKey: 'livestockId', as: 'feedings' });
Feeding.belongsTo(Livestock, { foreignKey: 'livestockId', as: 'livestock' });

// Livestock - Vaccination (1:N)
Livestock.hasMany(Vaccination, { foreignKey: 'livestockId', as: 'vaccinations' });
Vaccination.belongsTo(Livestock, { foreignKey: 'livestockId', as: 'livestock' });

// Livestock - Reproduction (1:N)
Livestock.hasMany(Reproduction, { foreignKey: 'livestockId', as: 'reproductions' });
Reproduction.belongsTo(Livestock, { foreignKey: 'livestockId', as: 'livestock' });

// VeterinarySupply - LivestockSupplyUsage (1:N)
VeterinarySupply.hasMany(LivestockSupplyUsage, { foreignKey: 'supplyId', as: 'usages' });
LivestockSupplyUsage.belongsTo(VeterinarySupply, { foreignKey: 'supplyId', as: 'supply' });

// Livestock - LivestockSupplyUsage (1:N)
Livestock.hasMany(LivestockSupplyUsage, { foreignKey: 'livestockId', as: 'supplyUsages' });
LivestockSupplyUsage.belongsTo(Livestock, { foreignKey: 'livestockId', as: 'livestock' });

// Exportar modelos
export {
  sequelize,
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