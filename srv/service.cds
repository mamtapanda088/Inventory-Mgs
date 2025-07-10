using { 
  my.inventory as db 
} from '../db/schema';

service InventoryService {

  // Expose entity Items
  entity Items as projection on db.Items;

  entity Users as projection on db.Users;

  // Expose entity Requisitions
  entity Requisitions as projection on db.Requisitions;

  // Optional: Approve/Reject actions (if you want to call from UI directly)
  action approveRequest(ID: UUID) returns String;
  action rejectRequest(ID: UUID) returns String;

 action submitRequisitions(
    itemID: UUID,
    quantity: Integer,
    purpose: String
  ) returns String;

}

