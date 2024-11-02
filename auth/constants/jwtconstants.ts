const expiresInAccess = 1000 * 60 * 60 * 24 * 14; // 2 weeks in ms
const expiresInRefresh = 1000 * 60 * 60 * 24 * 14 * 2; // 2 weeks in ms

export const jwtConstantsAccess = {
  secret:
    '$2a$12$uHVNMNQB2GjN770d2c0JU.z54KICApEkROP1sadfas1212e4fweeOUPljacVbCcX8VngK',
  expiresIn: expiresInAccess / 1000,
  lifetime: new Date(Date.now() + expiresInAccess),
};

 
export const jwtConstantsRefresh = {
  secret:
    'bafbe9d06aec67abeea7a98089f4d83934fbd17bb67023a8326f976932dda86b',
  expiresIn: expiresInRefresh / 1000,
  lifetime: new Date(Date.now() + expiresInRefresh),
};
