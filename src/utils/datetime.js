// バックエンドの日時は UTC（datetime.utcnow）だが末尾Zが無く、
// JS は素のままだとローカル時刻と誤解する。TZ情報が無ければUTCとみなして変換する。
export const parseUtc = (s) =>
  new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : `${s}Z`);
