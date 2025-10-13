const { env } = process;

Object.assign(env, {
  LNG: env.LNG || 'en,zh-hant',
  LNG_LABEL: env.LNG_LABEL || 'EN,中文',
  LNG_FLAG: env.LNG_FLAG || '🇬🇧,🇭🇰',
});
