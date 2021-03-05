/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable react/prop-types */
import React from 'react';
import { Modal, Form, Input, message } from 'antd';
import * as api from '@/service/api';
import { getModalWidth } from '@/utils/index';
import './loginModal.less';

type Props = {
  visible?: boolean,
  onOk: (nickname: string, password: string) => void;
  onCancel?: () => void;
  title?: string;
  content: string;
  loading: boolean;
  gotoRegister: () => void;
  cancleButtonExit: boolean;
}

const LoginModal: React.FC<Props> = ({
  visible,
  onOk,
  onCancel,
  title,
  gotoRegister,
  content,
  loading,
  cancleButtonExit,
}) => {
  const [form] = Form.useForm();

  function handleOk() {
    form.submit();
  }
  function handleCancel() {
    form.resetFields();
    onCancel && onCancel();
  }

  function onFinish() {
    !!onOk && onOk(form.getFieldValue("username"), form.getFieldValue('password'));

    // form.resetFields();
  }

  return (
    <Modal
      title={title && title}
      className={`login-modal ${!cancleButtonExit ? 'cancle-button-exit' : ''}`}
      onCancel={() => handleCancel()}
      onOk={() => handleOk()}
      width={getModalWidth(document.body.clientWidth)}
      okText='登录'
      confirmLoading={loading}
      visible={visible}>
      <Form
        name="normal_login"
        className="login-form"
        form={form}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="username"
          validateTrigger="onBlur"
          rules={[{ required: true, message: '请输入用户名' },
          ({ getFieldValue }) => ({
            async validator(rule, value) {
              if (value && getFieldValue('username') === value) {
                if (value.length > 20) {
                  return Promise.reject('用户名不能超过20个字符');
                }
                if (/^[\u4e00-\u9fa50-9A-Za-z_]+$/g.test(value)) {
                  try {
                    let res = await api.getUserByIdOrNickName({ nickname: form.getFieldValue('username') });
                    if (res && res.success) {
                      if (!res.data) {
                        return Promise.reject('用户名不存在');
                      }
                      return Promise.resolve();
                    }
                  } catch (error) {
                    console.log(error);
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
          {/* <Input placeholder="请输入用户名" disabled={!props.isNew} /> */}
          <Input placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item
          name="password"
          className='form-item-nomargin'
          rules={[
            { required: true, message: '请输入密码' },
          ]}
        // validateFirst={false}
        // rules={[
        //   {},
        //   ({ getFieldValue }) => ({
        //     validator(rule, value) {
        //       let headStrReg = /^[a-zA-Z]/gi
        //       let strAndNumReg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]*$/gi
        //       let strAndNumLengthReg = /^[0-9A-Za-z]{6,20}$/gi
        //       if (!value) {
        //         return Promise.reject('请填写登录密码');
        //       } else if (!strAndNumLengthReg.test(value)) {
        //         return Promise.reject('登录密码长度必须为6-20位');
        //       } else {
        //         return Promise.resolve(value);
        //       }
        //     },
        //   }),
        // ]}
        >
          <Input.Password
            type="password"
            placeholder="请输入密码"
          />
        </Form.Item>
        <Form.Item name="remember-me" valuePropName="checked" noStyle>
          <a onClick={() => gotoRegister && gotoRegister()} className='register'>没有账号?前去注册</a>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LoginModal;