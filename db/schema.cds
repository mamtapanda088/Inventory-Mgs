namespace my.inventory;

entity Items {
  key ID           : UUID;
      name         : String(100);
      description  : String(200);
      currentStock : Integer;
      category     : String(50);       // Great for filtering and categorization
}

entity Requisitions {
  key ID           : UUID;
      item_ID      : Association to Items; // Correct usage of association
      quantity     : Integer;
      purpose      : String(255);
      requestedBy  : String;               // Works for now; can later be linked to Users entity
      requestDate  : Timestamp;
      status       : String enum {
        Pending;
        Approved;
        Rejected;
      };
}

entity Users {
  key ID        : UUID;
  username      : String(50);
  email         : String(100);
  password      : String(100);
  role          : String enum { Manager; Employee };
}

