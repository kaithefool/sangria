import React from 'react';

import useHttp from '~/lib/hooks/useHttp';
import env from '~/lib/config/env';
import MineContext from './MineContext';

const MineProvider = ({
  api = { url: '/api/self' },
  children,
}) => {
  const { req: fetchReq, fetched } = useHttp(env.user && api);
  const { req: patchReq } = useHttp();

  const refresh = () => fetchReq(api);

  const value = {
    mine: fetched?.payload ?? env.user,
    fetched: fetched?.payload,
    update: async (attrs) => {
      await patchReq({
        ...api, method: 'patch', data: attrs,
      });
      refresh();
    },
    refresh,
  };

  return (
    <MineContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </MineContext.Provider>
  );
};

export default MineProvider;
