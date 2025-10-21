import React from 'react';

import Logo from '~/shared/components/Logo';
import PageCentered from '../../layout/PageCentered';
import FormLogin from '../../forms/FormLogin';

const PageLogin = () => (
  <PageCentered>
    <div className="text-center py-3">
      <Logo className="fs-3" />
    </div>
    <FormLogin />
  </PageCentered>
);

export default PageLogin;
