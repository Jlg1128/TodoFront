import { User } from '@/pages/Index/App';
import { ACCOUNTTYPEDISPATCHTYPE } from '@/store/reducer/accountTypeReducer';
import { UserDispatchType } from '@/store/reducer/userInfoReducer';
import { message } from 'antd';
import { History } from 'history';
import React, { Dispatch, ReactNode, useEffect } from 'react';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import './layout.less';

type Props = {
  userInfo: User,
  dispatch: Dispatch<AnyAction>,
  children: ReactNode[],
  history: History,
}

const authPath = ['/user/settings'];

export const SecureLayout: React.FC<Props> = ({ children, dispatch, history, ...rest }) => {
  useEffect(() => {
    if (authPath.includes(history.location.pathname)) {
      if (JSON.parse(localStorage.getItem("accountType") || "{}") === ACCOUNTTYPEDISPATCHTYPE.TOURIST
      || Object.keys(JSON.parse(localStorage.getItem("userInfo") || "{}")).length === 0
      || !JSON.parse(localStorage.getItem("userInfo") || "{}").id
      || !JSON.parse(localStorage.getItem("userInfo") || "{}").nickname
       ) {
         message.info('请先登录');
         setTimeout(() => {
           history.replace("/");
         }, 1500);
      }
    }
    // @ts-ignore
    if (localStorage.getItem("accountType") && JSON.parse(localStorage.getItem("accountType")) === ACCOUNTTYPEDISPATCHTYPE.MEMBER) {
      // @ts-ignore
      if (localStorage.getItem("userInfo")) {
        let user = JSON.parse(localStorage.getItem("userInfo") || '{}');
        if (user.id && user.nickname) {
          dispatch({
            type: UserDispatchType.LOGIN,
            payload: user,
          });
        dispatch({
          type: ACCOUNTTYPEDISPATCHTYPE.MEMBER,
        });
        }
      }
    }
  }, []);

    return <div className='layout'>
      <div>
        {/* layout Content */}
      </div>
      <div>
        {children}
      </div>
    </div>;
};

export default connect(
(state) => ({ ...state }),
)(SecureLayout);
