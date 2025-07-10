const cds = require('@sap/cds');

module.exports = cds.service.impl(async function (srv) {
  const { Items, Requisitions } = cds.entities('my.inventory');

  // 🔹 Before READ: Only show items with stock > 0 to employees
  srv.before('READ', 'Items', req => {
    if (req.user?.role === 'Employee') {
      req.query.where('currentStock >', 0);
    }
  });

  // 🔹 Employee: Submit a new requisition
  srv.on('submitRequisitions', async req => {
    const { itemID, quantity, purpose } = req.data;
  
    if (!itemID || !quantity || !purpose) {
      return req.error(400, 'All fields are required');
    }
  
    const item = await SELECT.one.from(Items).where({ ID: itemID });
    if (!item) return req.error(404, 'Item not found');
  
    const newReq = {
      ID: cds.utils.uuid(),
      item_ID: { ID: itemID },  // Correct way to set an association
      quantity,
      purpose,
      requestedBy: req.user?.id || 'anonymous',
      requestDate: new Date().toISOString(),
      status: 'Pending'
    };
  
    await INSERT.into(Requisitions).entries(newReq);
  
    // ✅ THIS WAS MISSING:
    return "Purchase Requisition created successfully";
  });  

    // 🔹 Manager: Approve request & update stock
    srv.on('approveRequest', async (req) => {
      const { ID } = req.data;
      const requisition = await SELECT.one.from(Requisitions).where({ ID });
  
      if (!requisition) return req.error(404, `Requisition with ID ${ID} not found.`);
      if (requisition.status !== 'Pending') {
        return req.error(400, `Only Pending requests can be approved.`);
      }
  
      const itemID = requisition.item_ID_ID; // foreign key
      const item = await SELECT.one.from(Items).where({ ID: itemID });
  
      if (!item) return req.error(404, `Item not found for requisition.`);
      if (item.currentStock < requisition.quantity) {
        return req.error(400, `Insufficient stock to approve this request.`);
      }
  
      // 🔄 Subtract the quantity from inventory
      await UPDATE(Items)
        .set({ currentStock: item.currentStock - requisition.quantity })
        .where({ ID: itemID });
  
      // ✅ Mark requisition as approved
      await UPDATE(Requisitions)
        .set({ status: 'Approved' })
        .where({ ID });
  
      return `Requisition ${ID} approved successfully and stock updated.`;
    });  

  // 🔹 Manager: Reject request
  srv.on('rejectRequest', async (req) => {
    const { ID } = req.data;
    const requisition = await SELECT.one.from(Requisitions).where({ ID });

    if (!requisition) return req.error(404, `Requisition with ID ${ID} not found.`);
    if (requisition.status !== 'Pending') {
      return req.error(400, `Only Pending requests can be rejected.`);
    }

    await UPDATE(Requisitions).set({ status: 'Rejected' }).where({ ID });
    return `Requisition ${ID} rejected successfully.`;
  });
});
