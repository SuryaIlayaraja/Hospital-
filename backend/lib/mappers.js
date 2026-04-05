/** Map DB row shapes to API shapes expected by the existing frontend (Mongo-like). */

function withMongoId(row) {
  if (!row) return row;
  const { id, ...rest } = row;
  return { ...rest, _id: id, id };
}

function ticketRowToClient(row) {
  if (!row) return row;
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    severity: row.severity,
    department: row.department,
    issueCategory: row.issue_category,
    status: row.status,
    patientId: row.patient_id || undefined,
    patientPhone: row.patient_phone || undefined,
    clerkUserId: row.clerk_user_id || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function chatMessageRowToClient(row) {
  if (!row) return row;
  const readBy = row.read_by || {};
  return {
    _id: row.id,
    id: row.id,
    ticketId: row.ticket_id,
    senderType: row.sender_type,
    senderId: row.sender_id || undefined,
    message: row.message || "",
    attachments: row.attachments || [],
    readBy: {
      adminAt: readBy.adminAt || readBy.admin_at,
      patientAt: readBy.patientAt || readBy.patient_at,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function departmentRowToClient(row) {
  if (!row) return row;
  return {
    _id: row.id,
    id: row.id,
    serialNumber: row.serial_number,
    departmentName: row.department_name,
    firstLevel: row.first_level,
    secondLevel: row.second_level,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function floorRowToClient(row) {
  if (!row) return row;
  return {
    _id: row.id,
    id: row.id,
    floorNumber: row.floor_number,
    floorName: row.floor_name,
    description: row.description,
    departments: row.departments || [],
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function doctorRowToClient(row) {
  if (!row) return row;
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    studies: row.studies,
    image: row.image,
    specialization: row.specialization,
    isActive: row.is_active,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function cooRowToClient(row) {
  if (!row) return row;
  return {
    _id: row.id,
    id: row.id,
    designation: row.designation,
    name: row.name,
    access: row.access,
    wardAccess: row.ward_access,
    email: row.email,
    phone: row.phone,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function feedbackRowToClient(row, type) {
  if (!row) return row;
  const data = row.data || {};
  return {
    _id: row.id,
    id: row.id,
    ...data,
    overallExperience: row.overall_experience || data.overallExperience,
    timestamp: row.timestamp,
    type,
  };
}

module.exports = {
  withMongoId,
  ticketRowToClient,
  chatMessageRowToClient,
  departmentRowToClient,
  floorRowToClient,
  doctorRowToClient,
  cooRowToClient,
  feedbackRowToClient,
};
