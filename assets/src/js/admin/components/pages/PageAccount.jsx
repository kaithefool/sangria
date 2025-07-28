import React from 'react';

import Form from '~/lib/components/form';
import { reduceLng } from '~/lib/helpers';
import { useMine } from '~/shared/components/mine';
import Page from '../layout/Page';
import ModalAccPwd from '~/shared/components/ModalAccPwd';

const defaults = {
  avatar: [],
  name: reduceLng(''),
};

const PageAccount = () => {
  const { fetched, refresh } = useMine();

  return (
    <Page
      header={{
        title: 'Account',
      }}
    >
      {fetched && (
        <Form
          defaults={defaults}
          stored={fetched}
          api={{ url: '/api/self', method: 'patch' }}
          onSubmitted={refresh}
        >
          <div className="pb-3">
            <Form.BtnSubmit />
          </div>
          <Form.FilsAvatar name="avatar" />
          <Form.LngGroup name="name">
            {(lng) => (
              <Form.Input name={`name.${lng}`} fieldOnly />
            )}
          </Form.LngGroup>
          <ModalAccPwd />
        </Form>
      )}
    </Page>
  );
};

export default PageAccount;
