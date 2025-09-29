import React from 'react';

import BtnLng from '~/lib/components/btns/BtnLng';
import { Fil } from '~/lib/components/fils';
import Centered from '~/lib/components/layout/Centered';
import defCoverUrl from '../../../../img/default-cover.mp4';

const defaultCover = {
  path: `assets/${defCoverUrl}`,
  type: 'video/mp4',
};

const PageCentered = ({
  cover = true,
  children,
  ...props
}) => {
  let file;

  if (cover) {
    if (typeof cover === 'string') {
      file = { type: 'image/jpeg', path: cover };
    } else if (typeof cover === 'object') {
      file = cover;
    } else {
      file = defaultCover;
    }
  }
  const body = (
    <div className="d-flex flex-column vh-100">
      <div className="p-3 text-end">
        <div className="d-inline-block">
          <BtnLng showLabel />
        </div>
      </div>
      <div className="flex-fill px-5 position-relative">
        <Centered {...props}>
          {children}
        </Centered>
      </div>
    </div>
  );

  return file ? (
    <div className="d-flex overflow-y-auto">
      <div className="flex-fill vh-100 sticky-top bg-light">
        <Fil file={file}>
          <Fil.Preview
            player={{
              playing: true, muted: true, loop: true,
            }}
          />
        </Fil>
      </div>
      <div style={{ maxWidth: '100vw', minWidth: '50vw' }}>
        {body}
      </div>
    </div>
  ) : body;
};

export default PageCentered;
