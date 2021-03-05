/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable react/prop-types */
import React from 'react';
import { Modal, Form, Input, message } from 'antd';
import { getModalWidth } from '@/utils/index';
import * as api from '@/service/api';
import './registerModal.less';

type Props = {
  visible?: boolean,
  onOk: (nickname: string, password: string) => void;
  onCancel?: () => void;
  goback?: () => void;
  title?: string;
  content: string;
  loading: boolean;
  cancleButtonExit: boolean;
}

const LoginModal: React.FC<Props> = ({
  visible,
  onOk,
  onCancel,
  goback,
  title,
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
      className={`register-modal ${!cancleButtonExit ? 'cancle-button-exit' : ''}`}
      onCancel={() => handleCancel()}
      onOk={() => handleOk()}
      width={getModalWidth(document.body.clientWidth)}
      okText='注册'
      confirmLoading={loading}
      visible={visible}>
      <Form
        name="normal_login"
        className="register-form"
        form={form}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="username"
          validateTrigger="onBlur"
          rules={[{ required: false, message: '请输入用户名' },
          ({ getFieldValue }) => ({
            async validator(rule, value) {
              if (value && getFieldValue('username') === value) {
                if (value.length > 20) {
                  return Promise.reject('用户名不能超过20个字符');
                }
                if (/^[\u4e00-\u9fa50-9A-Za-z_]+$/g.test(value)) {
                  try {
                    let res = await api.getUserByIdOrNickName({ nickname: form.getFieldValue("username") });
                    if (res && res.success) {
                      if (res.data) {
                        return Promise.reject('用户已存在');
                      }
                      return Promise.resolve();
                    }
                    return Promise.reject(res.msg);
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
          <Input placeholder="仅支持中文、数字、英文大小写、下划线。" />
        </Form.Item>
        <Form.Item
          name="password"
          className='form-item-nomargin'
          rules={[
            { required: true, message: '请输入密码' },
            ({ getFieldValue }) => ({
              validator(rule, value) {
                let strAndNumLengthReg = /^[\s\S]{8,20}$/g;
                console.log(value);
                if (value && !strAndNumLengthReg.test(value)) {
                  return Promise.reject('密码需要8-20位');
                }
                return Promise.resolve(value);
              },
            }),
          ]}
        >
          <Input.Password
            type="password"
            placeholder="8～20位"
          />
        </Form.Item>
        <Form.Item name="remember-me" valuePropName="checked" noStyle>
          <a onClick={() => goback && goback()} className='register'>返回</a>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LoginModal;