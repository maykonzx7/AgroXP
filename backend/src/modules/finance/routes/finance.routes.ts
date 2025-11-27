import { Router } from 'express';
import prisma from '../../../services/database.service.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = Router();

// All finance routes are protected
router.use(authenticate);

// Get all financial records - Multi-tenant: only user's farms
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Get user's farm IDs for multi-tenant filtering
    const userFarms = await prisma.farm.findMany({
      where: { ownerId: userId },
      select: { id: true },
    });
    
    const userFarmIds = userFarms.map(f => f.id);
    
    // Get user's field IDs (if user has farms)
    let userFieldIds: string[] = [];
    if (userFarmIds.length > 0) {
      const userFields = await prisma.field.findMany({
        where: {
          farmId: {
            in: userFarmIds,
          },
        },
        select: { id: true },
      });
      userFieldIds = userFields.map(f => f.id);
    }
    
    // Logs removidos para segurança - não expor informações de usuário e estrutura do banco
    
    // Try different query approaches
    let records: any[] = [];
    
    if (userFieldIds.length > 0) {
      // User has fields: return records with user's fieldIds OR records without fieldId
      // Try using OR with explicit null check
      try {
        records = await prisma.finance.findMany({
          where: {
            OR: [
              {
                fieldId: {
                  in: userFieldIds,
                },
              },
              {
                fieldId: null,
              },
            ],
          },
          orderBy: {
            date: 'desc',
          },
        });
        console.log(`Query with OR returned ${records.length} records`);
      } catch (error) {
        console.error('Error with OR query:', error);
      }
    } else {
      // User has no fields: only return records without fieldId
      // Since Prisma may have issues with null queries, use the IDs from the debug query
      if (allNullFieldRecords.length > 0) {
        console.log('Using IDs from debug query to fetch full records...');
        const recordIds = allNullFieldRecords.map(r => r.id);
        records = await prisma.finance.findMany({
          where: {
            id: {
              in: recordIds,
            },
          },
          orderBy: {
            date: 'desc',
          },
        });
        console.log(`Fetched ${records.length} records using ID list`);
      } else {
        // Try direct query as fallback
        try {
          records = await prisma.finance.findMany({
            where: {
              fieldId: null,
            },
            orderBy: {
              date: 'desc',
            },
          });
          console.log(`Direct query returned ${records.length} records`);
        } catch (error) {
          console.error('Error with direct query:', error);
        }
      }
    }
    
    // Then populate the field, farm, and crop relations for records that have them
    const recordsWithRelations = await Promise.all(
      records.map(async (record) => {
        const field = record.fieldId ? await prisma.field.findUnique({
          where: { id: record.fieldId },
          include: {
            farm: {
              select: {
                id: true,
                name: true,
                ownerId: true,
              },
            },
          },
        }) : null;
        
        const crop = record.cropId ? await prisma.crop.findUnique({
          where: { id: record.cropId },
          select: {
            id: true,
            name: true,
            variety: true,
          },
        }) : null;
        
        return {
          ...record,
          field: field || null,
          crop: crop || null,
        };
      })
    );
    
    console.log(`Found ${recordsWithRelations.length} financial records for user ${userId}`);
    if (recordsWithRelations.length > 0) {
      console.log('Sample records:', recordsWithRelations.slice(0, 2).map(r => ({ id: r.id, type: r.type, amount: r.amount, fieldId: r.fieldId })));
    }
    res.json(recordsWithRelations);
  } catch (error: any) {
    console.error('Get financial records error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Get a specific financial record - Multi-tenant: verify ownership
router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const record = await prisma.finance.findUnique({
      where: { id },
      include: {
        field: {
          include: {
            farm: {
              select: {
                id: true,
                name: true,
                ownerId: true,
              },
            },
          },
        },
      },
    });
    
    if (!record) {
      return res.status(404).json({ message: 'Financial record not found' });
    }
    
    // Multi-tenant check: verify record belongs to user's farm
    if (record.fieldId && record.field && record.field.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Financial record does not belong to your farms' });
    }
    
    res.json(record);
  } catch (error: any) {
    console.error('Get financial record error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

// Create a new financial record - Multi-tenant: verify field belongs to user
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { type, category, amount, description, date, fieldId, cropId } = req.body;
    
    console.log('Creating financial record:', { userId, type, category, amount, description, date, fieldId, cropId });
    
    // Validate required fields
    if (!type || !category || amount === undefined || amount === null || !description) {
      console.error('Missing required fields:', { type, category, amount, description });
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Validate type
    if (!['INCOME', 'EXPENSE'].includes(type)) {
      return res.status(400).json({ message: 'Type must be INCOME or EXPENSE' });
    }
    
    // If fieldId is provided, verify it belongs to user
    // Handle empty string as null
    let finalFieldId = (fieldId && fieldId.trim() !== '') ? fieldId : null;
    if (finalFieldId) {
      const field = await prisma.field.findUnique({
        where: { id: finalFieldId },
        include: {
          farm: {
            select: {
              ownerId: true,
            },
          },
        },
      });
      
      if (!field) {
        return res.status(404).json({ message: 'Field not found' });
      }
      
      if (field.farm.ownerId !== userId) {
        return res.status(403).json({ message: 'Cannot create financial record for field that does not belong to your farms' });
      }
    }
    
    const recordData = {
      type: type as 'INCOME' | 'EXPENSE',
      category,
      amount: parseFloat(amount),
      description,
      date: date ? new Date(date) : new Date(),
      fieldId: finalFieldId,
      cropId: finalCropId,
    };
    
    console.log('Creating record with data:', JSON.stringify(recordData, null, 2));
    
    try {
      const record = await prisma.finance.create({
        data: recordData,
        include: {
          field: {
            include: {
              farm: {
                select: {
                  id: true,
                  name: true,
                  ownerId: true,
                },
              },
            },
          },
        },
      });
      
      console.log('✅ Record created successfully:', record.id);
      console.log('✅ Record data:', JSON.stringify(record, null, 2));
      
      // Verify the record was actually saved
      const verifyRecord = await prisma.finance.findUnique({
        where: { id: record.id },
      });
      
      if (!verifyRecord) {
        console.error('❌ CRITICAL: Record was created but not found in database!');
        return res.status(500).json({ message: 'Record created but not persisted' });
      }
      
      console.log('✅ Record verified in database');
      res.status(201).json(record);
    } catch (dbError: any) {
      console.error('❌ Database error during create:', dbError);
      console.error('Error code:', dbError.code);
      console.error('Error meta:', dbError.meta);
      throw dbError;
    }
  } catch (error: any) {
    console.error('Create financial record error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Update a financial record - Multi-tenant: verify ownership
router.put('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { type, category, amount, description, date, fieldId, cropId } = req.body;
    
    // Check if record exists
    const existingRecord = await prisma.finance.findUnique({
      where: { id },
      include: {
        field: {
          include: {
            farm: {
              select: {
                ownerId: true,
              },
            },
          },
        },
      },
    });
    
    if (!existingRecord) {
      return res.status(404).json({ message: 'Financial record not found' });
    }
    
    // Multi-tenant check: verify record belongs to user's farm
    if (existingRecord.fieldId && existingRecord.field && existingRecord.field.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Financial record does not belong to your farms' });
    }
    
    // If fieldId is being changed, verify it belongs to user
    if (fieldId !== undefined && fieldId !== existingRecord.fieldId) {
      if (fieldId) {
        const newField = await prisma.field.findUnique({
          where: { id: fieldId },
          include: {
            farm: {
              select: {
                ownerId: true,
              },
            },
          },
        });
        
        if (!newField || newField.farm.ownerId !== userId) {
          return res.status(403).json({ message: 'Cannot move financial record to field that does not belong to your farms' });
        }
      }
    }
    
    // Validate type if provided
    if (type && !['INCOME', 'EXPENSE'].includes(type)) {
      return res.status(400).json({ message: 'Type must be INCOME or EXPENSE' });
    }
    
    const record = await prisma.finance.update({
      where: { id },
      data: {
        ...(type && { type: type as 'INCOME' | 'EXPENSE' }),
        ...(category && { category }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(description && { description }),
        ...(date && { date: new Date(date) }),
        ...(fieldId !== undefined && { fieldId: fieldId || null }),
        ...(cropId !== undefined && { cropId: finalCropId }),
      },
      include: {
        field: {
          include: {
            farm: {
              select: {
                id: true,
                name: true,
                ownerId: true,
              },
            },
          },
        },
      },
    });
    
    res.json(record);
  } catch (error: any) {
    console.error('Update financial record error:', error);
    res.status(400).json({ message: error.message || 'Bad request' });
  }
});

// Delete a financial record - Multi-tenant: verify ownership
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    
    const record = await prisma.finance.findUnique({
      where: { id },
      include: {
        field: {
          include: {
            farm: {
              select: {
                ownerId: true,
              },
            },
          },
        },
      },
    });
    
    if (!record) {
      return res.status(404).json({ message: 'Financial record not found' });
    }
    
    // Multi-tenant check: verify record belongs to user's farm
    if (record.fieldId && record.field && record.field.farm.ownerId !== userId) {
      return res.status(403).json({ message: 'Access denied: Financial record does not belong to your farms' });
    }
    
    await prisma.finance.delete({
      where: { id },
    });
    
    res.json({ message: 'Financial record deleted successfully' });
  } catch (error: any) {
    console.error('Delete financial record error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

export default router;

