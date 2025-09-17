export enum OrderStatus {
  Received = 'Received',
  Designing = 'Designing',
  Datasheet = 'Datasheet',
  WithVendor = 'With Vendor',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export interface Order {
  id: string;
  issueDate: Date;
  productDescription: string;
  pieces: number;
  fileNumber: string;
  karigarName: string;
  status: OrderStatus;
  billNumber: string;
  imageUrl: string;
}
