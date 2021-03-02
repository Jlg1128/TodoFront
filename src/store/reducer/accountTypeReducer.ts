export enum ACCOUNTTYPEDISPATCHTYPE {
  TOURIST = "tourist",
  MEMBER = "member",
}

const accountType = ACCOUNTTYPEDISPATCHTYPE.TOURIST;

export const account = (state = accountType, action: { type: ACCOUNTTYPEDISPATCHTYPE }) => {
  switch (action.type) {
    case ACCOUNTTYPEDISPATCHTYPE.TOURIST:
      return "tourist";
    case ACCOUNTTYPEDISPATCHTYPE.MEMBER:
      return "member";
    default:
      return "tourist";
  }
};