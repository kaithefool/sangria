import React, { useState, useEffect } from 'react';
// import mimer from 'mimer';
import mimedb from 'mime-db';
import isEqual from 'lodash/isEqual';

import DirContext from './DirContext';
import { newKey } from '../../../hooks/useUniqKey';
import useAlert from '../../alert/useAlert';

const toMimes = (accept) => (
  accept
    .split(',')
    .flatMap((s) => {
      const a = s.trim();
      if (a.includes('/')) return [a];

      return Object.keys(mimedb)
        .filter((m) => mimedb[m].extensions.includes(a));
    })
);

const validateFiles = (files, {
  accept,
  maxSize,
} = {}) => {
  // only validate new uploads
  const toCheck = files.filter((f) => f instanceof File);

  // check the files' size
  if (
    maxSize
    && toCheck.find((f) => f.size > maxSize)
  ) {
    return 'err.file.maxSize';
  }
  // check acceptable files' types
  if (accept) {
    const mimes = toMimes(accept);

    if (toCheck.find((f) => !mimes.includes(f.type))) {
      return 'err.file.accept';
    }
  }

  return null;
};

const insertKeys = (files) => {
  files.forEach((f) => {
    if (!f.key) {
      f.key = newKey();
    }
  });

  return files;
};

const getChanges = (stored, draft) => {
  const s = stored.filter((f) => !(f instanceof File));
  const d = draft.filter((f) => !(f instanceof File));

  return !isEqual(s, d) ? d : null;
};

const DirProvider = ({
  api = { url: '/api/files' },
  initValue = [],
  reset = false,
  multiple = false, // Boolean or max no. of files
  disabled = false,
  onChange = () => {}, // only consider uploaded files
  onDraft = () => {},
  accept,
  maxSize,
  children,
}) => {
  const [files, setFiles] = useState(() => insertKeys(initValue));
  const { push: pushAlert } = useAlert();

  useEffect(() => {
    if (reset) {
      setFiles(insertKeys(initValue));
    }
  }, [reset]);

  const update = (draft) => {
    const e = validateFiles(draft, { accept, maxSize });
    const changes = getChanges(files, draft);

    if (e) {
      pushAlert({ dirty: true, theme: 'danger', children: e });
    } else {
      insertKeys(draft);
      setFiles(draft);
      if (changes) onChange(changes);
      onDraft(draft);
    }
  };

  const findIndex = (key) => files.findIndex((f) => f.key === key);

  const push = (fileList) => {
    const fs = Array.from(fileList);
    let draft = [fs[0]];

    if (multiple) {
      draft = files.concat(fs);

      if (typeof multiple === 'number') {
        draft = draft.slice(0, Number(multiple));
      }
    }

    update(draft);
  };

  const replace = (key, file) => {
    const draft = [...files];

    draft.splice(findIndex(key), 1, file);
    update(draft);
  };

  const remove = (key) => {
    const draft = [...files];

    draft.splice(findIndex(key), 1);
    update(draft);
  };

  const swap = (src, dest) => {
    const draft = [...files];

    [draft[dest], draft[src]] = [draft[src], draft[dest]];
    update(draft);
  };

  const move = (src, dest) => {
    const draft = [...files];

    draft.splice(dest, 0, draft.splice(src, 1)[0]);
    update(draft);
  };

  const clear = () => {
    update([]);
  };

  const value = {
    api,
    accept,
    maxSize,
    multiple,
    disabled,
    files,
    push,
    replace,
    remove,
    swap,
    move,
    clear,
    update,
  };

  return (
    <DirContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </DirContext.Provider>
  );
};

export default DirProvider;
