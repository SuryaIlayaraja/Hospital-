const mongoose = require('mongoose');
const dns = require('dns');
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first');
require('dotenv').config();
const Ticket = require('./models/Ticket');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const tickets = await Ticket.find({
    status: { $ne: 'resolved' },
    createdAt: { $lt: cutoff }
  });
  console.log('Escalated tickets found:', tickets.length);
  tickets.forEach(t => console.log(t.id, t.department, t.status, t.createdAt));
  await mongoose.disconnect();
})();
