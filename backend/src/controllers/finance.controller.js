import Finance from '../modules/finance/Finance.model.js';

// Get all financial records
export const getFinancialRecords = async (req, res) => {
  try {
    const records = await Finance.findAll();
    res.json(records);
  } catch (error) {
    console.error('Get financial records error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a specific financial record by ID
export const getFinancialRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Finance.findByPk(id);
    
    if (!record) {
      return res.status(404).json({ error: 'Financial record not found' });
    }
    
    res.json(record);
  } catch (error) {
    console.error('Get financial record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new financial record
export const createFinancialRecord = async (req, res) => {
  try {
    const record = await Finance.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    console.error('Create financial record error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
};

// Update a financial record
export const updateFinancialRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Finance.findByPk(id);
    
    if (!record) {
      return res.status(404).json({ error: 'Financial record not found' });
    }
    
    await record.update(req.body);
    res.json(record);
  } catch (error) {
    console.error('Update financial record error:', error);
    res.status(400).json({ error: 'Bad request' });
  }
};

// Delete a financial record
export const deleteFinancialRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Finance.findByPk(id);
    
    if (!record) {
      return res.status(404).json({ error: 'Financial record not found' });
    }
    
    await record.destroy();
    res.json({ message: 'Financial record deleted successfully' });
  } catch (error) {
    console.error('Delete financial record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  getFinancialRecords,
  getFinancialRecordById,
  createFinancialRecord,
  updateFinancialRecord,
  deleteFinancialRecord
};