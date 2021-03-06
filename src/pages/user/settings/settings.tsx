/* eslint-disable max-len */
/* eslint-disable prefer-promise-reject-errors */
import React, { Dispatch } from 'react';
import * as api from '@/service/api';
import { connect } from 'react-redux';
import { Form, Input, Button, message } from 'antd';
import './settings.less';
import { User } from '@/service/api';
import { UserDispatchType } from '@/store/reducer/userInfoReducer';
import { AnyAction } from 'redux';
import { ACCOUNTTYPEDISPATCHTYPE } from '@/store/reducer/accountTypeReducer';
import { History } from 'history';

type Props = {
  userInfo: User,
  history: History,
  dispatch: Dispatch<AnyAction>,
}

type FormValueType = {
  username: string,
  phone: string,
  email: string,
}

const Settings: React.FC<Props> = (
  { userInfo, dispatch, history },
) => {
  const [form] = Form.useForm();

  const user = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo') || "{}") : {};

  const initialValues = {
    username: user.nickname || '',
    phone: user.phone_number || '',
    email: user.email || '',
  };

  const layout = {
    labelCol: { span: 5, offset: -10 },
    wrapperCol: { span: 10 },
  };
  const onFinish = async (values: FormValueType) => {
    // eslint-disable-next-line max-len
    let res = await api.modifyUser({ ...userInfo, nickname: values.username, email: values.email, phone_number: values.phone });
    if (res && res.success) {
      message.success("修改成功");
      // setTimeout(() => {
      //   history.push('/');
      // }, 1500);
      let user = await api.getUserById();
      if (user && user.success === true && user.data != null && user.data.nickname) {
        localStorage.setItem('userInfo', JSON.stringify(user.data));
        localStorage.setItem('accountType', JSON.stringify(ACCOUNTTYPEDISPATCHTYPE.MEMBER));
        localStorage.setItem('todoList', JSON.stringify(user.data.todo_list || []));
        dispatch({
          type: UserDispatchType.LOGIN,
          payload: res.data,
        });
        dispatch({
          type: ACCOUNTTYPEDISPATCHTYPE.MEMBER,
        });
        form.resetFields();
      } else {
        message.error(res && res.msg);
      }
    } else {
      message.error((res && res.msg) || '修改失败');
    }
  };

  const handleOk = () => {
    form.submit();
  };

  return (
    <div className='settings-container'>
      <div className='settings-content'>
        <Form
          name="basic"
          className='settings-form'
          {...layout}
          wrapperCol={{ span: 100 }}
          form={form}
          initialValues={initialValues}
          validateTrigger="onBlur"
          onFinish={onFinish}
        >
          <Form.Item
            label="用户名"
            name="username"
            wrapperCol={{ span: 30 }}
            validateTrigger="onBlur"
            rules={[{ required: true, message: '请输入修改后的用户名' },
            ({ getFieldValue }) => ({
              async validator(rule, value) {
                if (value && getFieldValue('username') === value) {
                  if (value.length > 20) {
                    return Promise.reject('用户名不能超过20个字符');
                  }
                  if (/^[\u4e00-\u9fa50-9A-Za-z_]+$/g.test(value)) {
                    if (value === initialValues.username) {
                      return Promise.resolve();
                    }
                    try {
                      let res = await api.ifRepeat(value, api.RepeatType.USERNAME);
                      if (res && !res.success) {
                        return Promise.reject(res.msg);
                      }
                      return Promise.resolve();
                    } catch (error) {
                      message.error("网络错误");
                      return;
                    }
                  }
                  return Promise.reject('仅支持中文、数字、英文大小写、下划线。');
                }
                return Promise.resolve();
              },
            })]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            label="手机号"
            name="phone"
            rules={[{ required: true, message: '请输入手机号' },
            ({ getFieldValue }) => ({
              async validator(rule, value) {
                if (value && getFieldValue('phone') === value) {
                  if (!(/^1[3456789]\d{9}$/.test(value))) {
                    return Promise.reject('手机号码格式错误');
                  }
                  if (value === initialValues.phone) {
                    return Promise.resolve();
                  }
                  try {
                    let res = await api.ifRepeat(value, api.RepeatType.PHONE);
                    if (res && !res.success) {
                      return Promise.reject(res.msg);
                    }
                    return Promise.resolve();
                  } catch (error) {
                    message.error("网络错误");
                    return;
                  }
                }
                return Promise.resolve();
              },
            }),
            ]}
          >
            <Input placeholder="请输入手机号" maxLength={11} />
          </Form.Item>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[{ required: true, message: "请输入邮箱" },
            ({ getFieldValue }) => ({
              async validator(rule, value) {
                if (value && getFieldValue('email') === value) {
                  if (/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/.test(value)) {
                    if (value === initialValues.email) {
                      return Promise.resolve();
                    }
                    try {
                      let res = await api.ifRepeat(value, api.RepeatType.EMAIL);
                      if (res && !res.success) {
                        return Promise.reject(res.msg);
                      }
                      return Promise.resolve();
                    } catch (error) {
                      message.error("网络错误");
                      return Promise.reject();
                    }
                  }
                  return Promise.reject('邮箱格式错误');
                }
                return Promise.resolve();
              },
            }),
            ]}
          >
            <Input placeholder="请输入邮箱地址" maxLength={30} />
            {/* <img src={logo1} alt="" /> */}
          </Form.Item>
        </Form>
        <div className='form-button-container'>
          <Button className='form-button' type='default' style={{ marginRight: 10 }} onClick={() => history.push('/')}>返回</Button>
          <Button className='form-button' type='primary' style={{ marginRight: 10 }} onClick={() => handleOk()}>更改</Button>
        </div>
      </div>
    </div>
  );
};
export default connect(
  (state) => ({ ...state }),
)(React.memo(Settings));