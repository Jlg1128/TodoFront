import { userInfo } from './reducer/userInfoReducer';
import { account } from './reducer/accountTypeReducer';

const Reducers = {
    userInfo,
    accountType: account,
};
export default Reducers;