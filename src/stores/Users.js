import { types } from "mobx-state-tree";
import { camelizeKeys } from "../utils/helpers";

export const User = types
  .model('User', {
    id: types.identifierNumber,
    firstName: types.string,
    lastName: types.string,
    username: types.string,
    email: types.string,
    lastActivity: types.string,
    avatar: types.maybeNull(types.string),
    initials: types.string
  })
  .views((self) => ({
    get fullName() {
      return [self.firstName, self.lastName].filter(n => !!n).join(" ").trim();
    }
  }))
  .preProcessSnapshot((sn) => {
    return camelizeKeys(sn);
  });
