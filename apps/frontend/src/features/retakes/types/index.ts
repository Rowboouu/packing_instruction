export interface RetakeCreatedBy {
  _id: string;
  name: string;
  email: string;
}

export interface RetakeItem {
  _id: string;
  customerItemNo: string;
  itemNo: string;
  name: string;
}

export interface Retake {
  _id: string;
  createdAt: string;
  createdBy: RetakeCreatedBy;
  updatedAt: string;
  item: RetakeItem;
  isDone: boolean;
}
