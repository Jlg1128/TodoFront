export enum ACCOUNTTYPEDISPATCHTYPE {
  TOURIST = "tourist",
  MEMBER = "member",
}

const initialAccountType = {
  accountType: 'tourist',
};

export const account = (state = initialAccountType, action: { type: ACCOUNTTYPEDISPATCHTYPE }) => {
  switch (action.type) {
    case ACCOUNTTYPEDISPATCHTYPE.TOURIST:
      return {
        ...state, accountType: 'tourist',
      };
    case ACCOUNTTYPEDISPATCHTYPE.MEMBER:
      return {
        ...state, accountType: 'member',
      };
    default:
      return state;
  }
};