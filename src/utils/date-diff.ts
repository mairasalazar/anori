import moment from "moment";

const STRINGS = {
  nodiff: "",
  year: "year",
  years: "years",
  month: "month",
  months: "months",
  day: "day",
  days: "days",
  delimiter: " ",
} as const;

function pluralize(num: number, word: keyof typeof STRINGS) {
  const key = (word + (num === 1 ? "" : "s")) as keyof typeof STRINGS;
  return `${num} ${STRINGS[key]}`;
}

function buildStringFromValues(yDiff: number, mDiff: number, dDiff: number) {
  const result = [];

  if (yDiff) {
    result.push(pluralize(yDiff, "year"));
  }
  if (mDiff) {
    result.push(pluralize(mDiff, "month"));
  }
  if (dDiff) {
    result.push(pluralize(dDiff, "day"));
  }

  return result.join(STRINGS.delimiter);
}

export const preciseDiffDMY = (d1: moment.Moment, d2: moment.Moment) => {
  let m1 = moment(d1);
  let m2 = moment(d2);

  m1.add(m2.utcOffset() - m1.utcOffset(), "minutes"); // shift timezone of m1 to m2

  if (m1.isSame(m2)) {
    return STRINGS.nodiff;
  }
  if (m1.isAfter(m2)) {
    const tmp = m1;
    m1 = m2;
    m2 = tmp;
  }

  let yDiff = m2.year() - m1.year();
  let mDiff = m2.month() - m1.month();
  let dDiff = m2.date() - m1.date();

  if (dDiff < 0) {
    const daysInLastFullMonth = moment(`${m2.year()}-${m2.month() + 1}`, "YYYY-MM")
      .subtract(1, "M")
      .daysInMonth();
    if (daysInLastFullMonth < m1.date()) {
      // 31/01 -> 2/03
      dDiff = daysInLastFullMonth + dDiff + (m1.date() - daysInLastFullMonth);
    } else {
      dDiff = daysInLastFullMonth + dDiff;
    }
    mDiff--;
  }
  if (mDiff < 0) {
    mDiff = 12 + mDiff;
    yDiff--;
  }

  return buildStringFromValues(yDiff, mDiff, dDiff);
};
