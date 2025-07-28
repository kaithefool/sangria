import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { object, string } from 'yup';
import { Modal } from 'react-bootstrap';

import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons/faKey';

import Form from '~/lib/components/form';
import { password, passwordConfirm } from '~/lib/validators';

const ModalAccPwd = ({
  icon = faKey,
  btnClassName = 'btn btn-outline-primary',
}) => {
  const [show, setShow] = useState(false);
  const { t } = useTranslation();
  const label = t('changePassword', 'Change Password');

  return (
    <>
      <button
        type="button"
        className={btnClassName}
        onClick={() => setShow(true)}
      >
        {icon && (
          <FA icon={icon} className="me-2" />
        )}
        {label}
      </button>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton />
        <Form
          alert={{ className: 'w-auto mt-3 px-3' }}
          api={{ url: '/api/self', method: 'patch' }}
          defaults={{
            oldPassword: '',
            password: '',
            confirmPassword: '',
          }}
          schema={object({
            oldPassword: string().required(),
            password: password().required(),
            confirmPassword: passwordConfirm().required(),
          })}
          onSubmitted={() => setShow(false)}
        >
          <Modal.Body>
            <Form.Password name="oldPassword" />
            <Form.Password
              name="password"
              label={<Form.Label name="newPassword" />}
              affirm
            />
            <Form.Password name="confirmPassword" affirm />
          </Modal.Body>
          <Modal.Footer>
            <Form.BtnSubmit icon={faKey}>
              {label}
            </Form.BtnSubmit>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default ModalAccPwd;
