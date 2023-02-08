const getters = {
  token: (state: any) => state.user.token,
  avatar: (state: any) => state.user.avatar,
  name: (state: any) => state.user.name,
  username: (state: any) => state.user.username,
  roles: (state: any) => state.user.roles,
  roleId: (state: any) => state.user.roleId,
  userId: (state: any) => state.user.userId,
  routers: (state: any) => state.user.routers,
};
export default getters;
