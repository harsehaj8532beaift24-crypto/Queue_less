import Service from '../models/Service.js';
import Queue from '../models/Queue.js';

export async function getServicesByBusiness(req, res, next) {
  try {
    const services = await Service.find({
      business: req.params.businessId,
      isActive: true,
    });
    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    next(error);
  }
}

export async function createService(req, res, next) {
  try {
    const { businessId, name, prefix, averageServiceMinutes, description } = req.body;
    const service = await Service.create({
      business: businessId,
      name,
      prefix: prefix.toUpperCase(),
      averageServiceMinutes: Number(averageServiceMinutes) || 10,
      description,
    });

    // Auto-create a corresponding Queue for this department/service
    const queue = await Queue.create({
      business: businessId,
      service: service._id,
      name: `${name} Counter Queue`,
      activeCounters: 1,
      totalCounters: 2,
    });

    res.status(201).json({
      success: true,
      data: {
        service,
        queue,
      },
    });
  } catch (error) {
    next(error);
  }
}
