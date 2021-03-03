/* eslint-disable no-plusplus */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import moment, { Moment } from 'moment';
import { Modal, Form, Input, DatePicker, ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import * as api from '@/service/api';
import './addModal.less';

type Props = {
  visible?: boolean,
  onOk: (targetCompletedTime: Moment | null) => void;
  onCancel?: () => void;
  // editStatus: 'new' | 'modify';
  title?: string;
  defaultValue?: Moment;
  content: string;
  loading?: boolean;
  cancleButtonExit: boolean;
}

const AddModal: React.FC<Props> = ({
  visible,
  onOk,
  onCancel,
  title,
  content,
  loading,
  defaultValue,
  cancleButtonExit,
}) => {
  const [selectedTime, setSelectedTime] = useState<Moment | null>(null);
  function handleOk() {
    console.log('selectedTime', selectedTime?.format('YYYY-MM-DD HH:mm:ss'));
    onOk && onOk(selectedTime);
  }
  function handleCancel() {
    selectedTime && setSelectedTime(selectedTime);
    onCancel && onCancel();
  }

  function handleDatePickChange(date: Moment | null, dateString: string) {
    setSelectedTime(date);
  }
  function handleDatePickOk() {
    console.log('时间选择完成');
  }

  function range(start: any, end: any) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

  // 设置禁用到当前日期
  function disabledDate(current: any) {
    return current && current < moment().subtract(1, 'day');
  }

  // 设置禁用到当前的时分秒
  function disabledDateTime(current: any) {
    return {
      disabledHours: () => range(0, 24).splice(0, moment().hours()),
      disabledMinutes: () => range(0, 24).splice(0, moment().minutes()),
    };
  }
  return (
    <Modal
      title={title && title}
      className={`add-modal ${!cancleButtonExit ? 'cancle-button-exit' : ''}`}
      onCancel={() => handleCancel()}
      onOk={() => handleOk()}
      okText='确定'
      width='196px'
      confirmLoading={loading}
      visible={visible}>
      <ConfigProvider locale={zhCN}>
        <DatePicker
          disabledDate={disabledDate}
          showTime
          format='MM/DD HH:mm'
          defaultValue={defaultValue}
          onChange={handleDatePickChange}
          onOk={handleDatePickOk} />
      </ConfigProvider>
    </Modal>
  );
};

export default AddModal;