/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable max-len */
import React, { Dispatch, ReactNode, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { AnyAction } from 'redux';
import LoginModal from '@/pages/Index/components/loginModal/loginModal';
import RegisterModal from '@/pages/Index/components/registerModal/registerModal';
import { ACCOUNTTYPEDISPATCHTYPE } from '@/store/reducer/accountTypeReducer';
import { UserDispatchType } from '@/store/reducer/userInfoReducer';
import { message } from 'antd';
import * as api from '@/service/api';
import { History } from 'history';
import emitter from '@/utils/emit';
import { User } from '@/service/api';
import dropdownLogo from '@/assets/dropdownicon.png';
import defaultAvatar from '@/assets/defaultAvatar.jpg';
import './layout.less';
import { TodoDispatchType } from '@/store/reducer/todoReducer';

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

  const [isDropdonw, setIsDropdown] = useState<boolean>(false);

  useEffect(() => {
    // 全局路由权限校对
    if (authPath.includes(history.location.pathname)) {
      if (accountType === ACCOUNTTYPEDISPATCHTYPE.TOURIST) {
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
        let user: User = JSON.parse(localStorage.getItem("userInfo") || '{}');
        if (user.id && user.nickname) {
          dispatch({
            type: UserDispatchType.LOGIN,
            payload: user,
          });
          dispatch({
            type: ACCOUNTTYPEDISPATCHTYPE.MEMBER,
          });
          dispatch({
            type: TodoDispatchType.INIT,
            payload: user.todo_list,
          });
        }
      }
    }
  }, []);

  useEffect(() => {
    emitter.on('unlogin', () => {
      localStorage.clear();
      sessionStorage.clear();
      dispatch({
        type: UserDispatchType.QUIT,
      });
      dispatch({
        type: ACCOUNTTYPEDISPATCHTYPE.TOURIST,
      });
      dispatch({
        type: TodoDispatchType.INIT,
        payload: [],
      });
      setModalsStates({ ...modalState, loginModalVisible: true });
    });
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
        dispatch({
          type: UserDispatchType.LOGIN,
          payload: res.data,
        });
        dispatch({
          type: ACCOUNTTYPEDISPATCHTYPE.MEMBER,
        });
        dispatch({
          type: TodoDispatchType.INIT,
          payload: res.data.todo_list,
        });
        message.success("登录成功");
        setModalsStates(
          {
            ...modalState, loginModalLoading: false, loginModalVisible: false,
          },
        );
        setrUserInfoShow(false);
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
    })
      .catch((err) => {
        message.error('网路异常');
      });
    return flag;
  }
  async function quit() {
    localStorage.clear();
    sessionStorage.clear();
    try {
      let res = await api.quit(userInfo.id);
      if (res.success) {
        dispatch({
          type: UserDispatchType.QUIT,
        });
        dispatch({
          type: ACCOUNTTYPEDISPATCHTYPE.TOURIST,
        });
        dispatch({
          type: TodoDispatchType.INIT,
          payload: [],
        });
        message.success("退出成功");
        setTimeout(() => {
          history.location.pathname !== '/' && history.replace('/');
        }, 1500);
      }
    } catch (error) {
      message.success("异常错误");
    }
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
    }).catch((err) => message.error("网络异常"));
    return flag;
  }
  return <div onClick={() => isDropdonw && setIsDropdown(false)} className='layout'>
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
    <div className='layout-header layout-header-h5header'>
      <div className='layout-header-pccontainer'>
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
                {history.location.pathname !== '/'
                  && <li>
                    <a onClick={() => history.push("/")}>首页</a>
                  </li>
                }
                <li>
                  <a onClick={() => quit()}>退出</a>
                </li>
              </ul>
            </span>
        }
      </div>
      <div className='layout-header-h5container'>
        <div onClick={() => setIsDropdown(!isDropdonw)} className='h5header-imgwrap'>
          <img src={dropdownLogo} alt="" />
        </div>
        <span onClick={(e) => e.stopPropagation()} className={`h5header-mask ${isDropdonw ? 'h5header-mask-show' : ''}`}>
          {
            accountType === ACCOUNTTYPEDISPATCHTYPE.TOURIST
              ? <ul>
                <li onClick={() => setModalsStates({ ...modalState, loginModalVisible: true })}>
                  登录
                </li>
                <li onClick={() => setModalsStates({ ...modalState, registerModalVisible: true })}>
                  注册
                </li>
              </ul>
              : <ul>
                <li onClick={() => jumpToSettings()} className='h5header-avatar'>
                  <img src={(userInfo && userInfo.avatar) ? userInfo.avatar : defaultAvatar} alt="" />
                </li>
                <li className='h5header-nickname'>
                  {
                    userInfo.nickname || '你好游客123'
                  }
                </li>
                {history.location.pathname !== '/'
                  && <li onClick={() => history.push("/")}>首页</li>
                }
                <li onClick={() => jumpToSettings()}>我的</li>
                {/* <li>设置</li> */}
                <li onClick={() => quit()}>退出</li>
              </ul>
          }
        </span>
      </div>

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
