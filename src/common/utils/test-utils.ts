export const user = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'hashed',
  isDisabled: false,
  trialCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const createUserDto = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'hashed',
  state: 'NY',
  sex: 'M',
  maritalStatus: 'Single',
  address: '123 Main St',
};

export const createTransferDto = {
  senderId: '1',
  receiverId: '2',
  amount: 100,
  otp: '123456',
  description: 'Transfer Test',
};

export const loginDto = {
  email: 'john@example.com',
  password: 'hashed',
};
