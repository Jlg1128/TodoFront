/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable max-len */
import React, { Dispatch, ReactNode, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import LoginModal from '@/pages/Index/components/loginModal/loginModal';
import RegisterModal from '@/pages/Index/components/registerModal/registerModal';
import { ACCOUNTTYPEDISPATCHTYPE } from '@/store/reducer/accountTypeReducer';
import { UserDispatchType } from '@/store/reducer/userInfoReducer';
import { message } from 'antd';
import * as api from '@/service/api';
import { History } from 'history';
import { AnyAction } from 'redux';
import { User } from '@/service/api';
import './layout.less';

type Props = {
  userInfo: User,
  dispatch: Dispatch<AnyAction>,
  children: ReactNode[],
  history: History,
  account: {
    accountType: ACCOUNTTYPEDISPATCHTYPE,
  },
}

const authPath = ['/user/settings'];

export const SecureLayout: React.FC<Props> = ({ children, dispatch, history, userInfo, account: { accountType }, ...rest }) => {
  const [userInfoShow, setrUserInfoShow] = useState<boolean>(false);
  // 登录modal和registermodal状态相关
  const [modalState, setModalsStates] = useState({
    loginModalVisible: false,
    registerModalVisible: false,
    loginModalLoading: false,
    registerModalLoading: false,
  });

  // 权限校对
  useEffect(() => {
    if (authPath.includes(history.location.pathname)) {
      if (JSON.parse(localStorage.getItem("accountType") || '') === ACCOUNTTYPEDISPATCHTYPE.TOURIST
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
    // 为了浏览器刷新保持登录状态
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

  function handleJump(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    e.stopPropagation();
    setModalsStates({
      ...modalState, loginModalVisible: true,
    });
  }

  function jumpToSettings() {
    history.push('/user/settings');
  }
  function login(nickname: string, password: string) {
    let flag = false;
    setModalsStates(
      {
        ...modalState, loginModalLoading: true, loginModalVisible: true,
      },
    );

    api.login(nickname, password).then((res) => {
      if (res && res.success === true && res.data != null && !!res.data.nickname) {
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        localStorage.setItem('accountType', JSON.stringify(ACCOUNTTYPEDISPATCHTYPE.MEMBER));
        localStorage.setItem('todoList', JSON.stringify(res.data.todo_list || []));
        // setTodoList(res.data.todo_list);
        dispatch({
          type: UserDispatchType.LOGIN,
          payload: res.data,
        });
        dispatch({
          type: ACCOUNTTYPEDISPATCHTYPE.MEMBER,
        });
        message.success("登录成功");
        setModalsStates(
          {
            ...modalState, loginModalLoading: false, loginModalVisible: false,
          },
        );
        flag = true;
      } else {
        message.error(res && res.msg);
        setModalsStates(
          {
            ...modalState, loginModalLoading: false,
          },
        );
        flag = false;
      }
    });
    return flag;
  }
  function quit() {
    localStorage.clear();
    dispatch({
      type: UserDispatchType.QUIT,
    });
    dispatch({
      type: ACCOUNTTYPEDISPATCHTYPE.TOURIST,
    });
    message.success("退出成功");
  }
  function handleLoginCancel() {
    setModalsStates({
      ...modalState, loginModalVisible: false,
    });
  }
  function handleRegisterCancel() {
    setModalsStates({
      ...modalState, registerModalVisible: false,
    });
  }
  function register(nickname: string, password: string): boolean {
    let flag = false;
    setModalsStates(
      {
        ...modalState, registerModalLoading: true, registerModalVisible: true,
      },
    );
    api.register({ ...userInfo, password, nickname }).then((res) => {
      if (res && res.success === true && res.data != null && !!res.data.nickname) {
        message.success("注册成功，直接为您登录！");
        localStorage.setItem('userInfo', JSON.stringify(res.data));
        localStorage.setItem('accountType', JSON.stringify(ACCOUNTTYPEDISPATCHTYPE.MEMBER));
        localStorage.setItem('todoList', JSON.stringify(res.data.todo_list || []));
        dispatch({
          type: UserDispatchType.LOGIN,
          payload: res.data,
        });
        dispatch({
          type: ACCOUNTTYPEDISPATCHTYPE.MEMBER,
        });
        setModalsStates(
          {
            ...modalState, registerModalLoading: false, registerModalVisible: false, loginModalVisible: false,
          },
        );
        flag = true;
      } else {
        message.error(res && res.msg);
        setModalsStates(
          {
            ...modalState, registerModalLoading: false,
          },
        );
        flag = true;
      }
    });
    return flag;
  }
  return <div className='layout'>
    <LoginModal
      cancleButtonExit={false}
      gotoRegister={() => setModalsStates({ ...modalState, registerModalVisible: true })}
      title="登录"
      loading={modalState.loginModalLoading}
      visible={modalState.loginModalVisible}
      content=''
      onOk={login}
      onCancel={() => handleLoginCancel()} />
    <RegisterModal
      cancleButtonExit={false}
      goback={() => setModalsStates({ ...modalState, registerModalVisible: false })}
      title="注册"
      loading={modalState.registerModalLoading}
      visible={modalState.registerModalVisible}
      content=''
      onOk={register}
      onCancel={() => handleRegisterCancel()} />
    <div className='layout-header'>
      {
        accountType === ACCOUNTTYPEDISPATCHTYPE.TOURIST
          ? <a onClick={(e) => handleJump(e)} className='user-jump jump-to-login'>还在用临时账号？点击这里注册账号数据不丢失！</a>
          : <span onMouseLeave={() => setrUserInfoShow(false)} onMouseOver={() => setrUserInfoShow(true)} className='user-jump see-all'>
            欢迎您,
            {userInfo.nickname}
            <ul className={`settings ${userInfoShow ? 'settings-dropdown' : ''}`}>
              <li>
                <a onClick={() => jumpToSettings()}>我的</a>
              </li>
              <li>
                <a onClick={() => quit()}>退出</a>
              </li>
            </ul>
          </span>
      }
      {/* layout Content */}
    </div>
    <div className='layout-body'>
      {children}
    </div>
    <div className='layout-footer'>
      {/* footer */}
    </div>
  </div>;
};

export default connect(
  (state) => ({ ...state }),
)(SecureLayout);
