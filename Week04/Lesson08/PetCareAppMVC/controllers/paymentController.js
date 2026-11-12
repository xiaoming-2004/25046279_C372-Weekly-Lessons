const mockServices = require('../data/mockServices');
const MockProvider = require('../services/mockPaymentProvider');

function preparePayment(req, res) {
  const serviceId = Number(req.params.serviceId);
  const service = mockServices.find(
    (item) => item.serviceId === serviceId
  );

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  res.json({
    serviceId: service.serviceId,
    serviceName: service.serviceName,
    amount: service.price,
    currency: 'sgd',
    status: 'READY_FOR_PAYMENT'
  });
}

async function createMockPayment(req, res) {
  const serviceId = Number(req.params.serviceId);
  const service = mockServices.find(
    (item) => item.serviceId === serviceId
  );

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const paymentRequest = {
    amount: service.price,
    currency: 'sgd',
    merchantReference: 'SERVICE-' + service.serviceId,
    description: service.serviceName,
    testStatus: req.body?.testStatus
  };

  const providerResult = await MockProvider.createPayment(paymentRequest);

  const bookingStatusByPayment = {
    APPROVED: 'CONFIRMED',
    PENDING: 'AWAITING_PAYMENT',
    DECLINED: 'PAYMENT_FAILED'
  };

  return res.json({
    serviceId: service.serviceId,
    providerPaymentId: providerResult.providerPaymentId,
    merchantReference: providerResult.merchantReference,
    paymentStatus: providerResult.status,
    bookingStatus: bookingStatusByPayment[providerResult.status]
  });
}

module.exports = {
  preparePayment,
  createMockPayment
};