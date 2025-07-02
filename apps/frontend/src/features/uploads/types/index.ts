export interface UploadedCreatedBy {
  _id: string;
  name: string;
  email: string;
}

export interface UploadedItem {
  _id: string;
  customerItemNo: string;
  itemNo: string;
  name: string;
}

export interface Uploads {
  _id: string;
  createdAt: string;
  createdBy: UploadedCreatedBy;
  updatedAt: string;
  item: UploadedItem;
}
