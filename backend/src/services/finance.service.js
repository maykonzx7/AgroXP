import Finance from '../modules/finance/Finance.model.js';

// Get all financial records
export const getAllFinancialRecords = async () => {
  return await Finance.findAll();
};

// Get a specific financial record by ID
export const getFinancialRecordById = async (id) => {
  return await Finance.findByPk(id);
};

// Create a new financial record
export const createFinancialRecord = async (recordData) => {
  return await Finance.create(recordData);
};

// Update a financial record
export const updateFinancialRecord = async (id, recordData) => {
  const record = await Finance.findByPk(id);
  if (!record) {
    throw new Error('Financial record not found');
  }
  return await record.update(recordData);
};

// Delete a financial record
export const deleteFinancialRecord = async (id) => {
  const record = await Finance.findByPk(id);
  if (!record) {
    throw new Error('Financial record not found');
  }
  return await record.destroy();
};

export default {
  getAllFinancialRecords,
  getFinancialRecordById,
  createFinancialRecord,
  updateFinancialRecord,
  deleteFinancialRecord
};