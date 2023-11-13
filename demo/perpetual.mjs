// import {Day, Week, Month, Year, Query} from 'PerpetualCalendar';
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date
const lengths = [
  31, // Jan
  28, // Feb
  31, // Mar
  30, // Apr
  31, // May
  30, // Jun
  31, // Jul
  31, // Aug
  30, // Sep
  31, // Oct
  30, // Nov
  31, // Dec
];

const genYear = (startDay = 0, leap = false) => {
  let dayIndex = startDay;
  const year = [];
  let monthIndex = 0;
  for (const len of lengths) {
    const length = len + (monthIndex === 1 && leap ? 1 : 0);
    const month = [];
    for (let day = 0; day < length; day++) {
      month.push(dayIndex % 7);
      dayIndex++;
    }
    year.push(month);
    monthIndex++;
  }
  return year;
};

const perpetualCalendar = (year) => {
  return [
    new Date(year, 0, 1).getDay(),
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0,
  ];
};

const getCalendar = (year) => genYear(...perpetualCalendar(year));

const Day = class {
  #filters = null;
  #startDate = null;
  #limit = null;
  constructor(
    { ofMonth, ofWeek, ofYear, month, week, year } = {},
    startDate = new Date(),
    limit = 25
  ) {
    this.#filters = {};
    this.#startDate = startDate;
    this.#limit = limit;

    if (typeof ofWeek !== undefined) {
      if (typeof ofWeek === "number") {
        this.#filters.ofWeek = (index) => index === ofWeek;
      } else if (typeof ofWeek === "function") {
        this.#filters.ofWeek = ofWeek;
      }
    }
    if (typeof ofMonth !== undefined) {
      if (typeof ofMonth === "number") {
        this.#filters.ofMonth = (index) => index === ofMonth;
      } else if (typeof ofMonth === "function") {
        this.#filters.ofMonth = ofMonth;
      }
    }
    if (typeof ofYear !== undefined) {
      if (typeof ofYear === "number") {
        this.#filters.ofYear = (index) => index === ofYear;
      } else if (typeof ofYear === "function") {
        this.#filters.ofYear = ofYear;
      }
    }
  }
  *[Symbol.iterator]() {
    let yieldMax = this.#limit;
    let year = this.#startDate.getFullYear();
    while (yieldMax > 0) {
      const calendar = getCalendar(year);
      year++;
      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        let dayIndex = -1;
        for (const weekday of calendar[monthIndex]) {
          dayIndex++;
          if (this.#filters.ofWeek) {
            if (!this.#filters.ofWeek(weekday)) {
              continue;
            }
          }
          if (this.#filters.ofMonth) {
            if (!this.#filters.ofMonth(dayIndex)) {
              continue;
            }
          }
          if (this.#filters.ofYear) {
            if (!this.#filters.ofYear(year)) {
              continue;
            }
          }
          console.log({ weekday, dayIndex });
          yieldMax--;
          yield new Date(Date.UTC(year, monthIndex, dayIndex, 0, 0, 0, 0));
        }
      }
    }
  }
};

const f13 = new Day({
  ofMonth: 13, // 13th
  ofWeek: 5, // friday
  // ofYear: undefined,
});

// https://stackoverflow.com/questions/55427168/is-there-a-function-to-get-the-utc-date-in-the-locale-string-format
function toLocaleUTCDateString(date, locales, options) {
  const timeDiff = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.valueOf() + timeDiff);
  return adjustedDate.toLocaleDateString(locales, options);
}

//stackoverflow.com/questions/24998624/day-name-from-date-in-js

function getDayName(date, locale = "en-us") {
  return date.getDay();
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][date.getDay()];

  //   return date.toLocaleDateString(locale, { weekday: "long" });

  return toLocaleUTCDateString(date, locale, { weekday: "long" });
}

for (const date of f13) {
  // console.log(
  //   getDayName(date),
  //   date.getFullYear(),
  //   date.getMonth(),
  //   date.getDay()
  // );
}

// const fridaysThe13th = new Day({
//   start: new Date(2010, 0, 1),
//   end: new Date(2019, 0, 1),
//   ofMonth: 13,
//   ofWeek: 5,
//   ofYear: undefined,
//   //
//   mohth: undefined,
//   week: undefined,
//   year: new Year({ year: (year) => year > 2010 }),
// });

// new Week({
//   ofYear: undefined,
//   ofMonth: undefined,
//   days:{
//     0: new Days({
//       ofMonth:1,
//     }),
//     7:undefined
//   },
//   //
//   year: new Year({
//     year:(year)=>year>2010,
//     leap:true,
//   }),
// });

// new Month({
//   ofYear:undefined,
//   days:{
//     0: new Day({
//       ofMonth:1
//     })
//   },
//   weeks:{

//   },
//   lengths:[28,28,30,31]
// });

// new Year({
//   start: new Date(2010,0,1),
//   end: new Date(2019,0,1),

//   days: {
//     0: new Day({
//       ofMonth: 1,
//     }),
//     '+': new Day({

//     }),
//     '-': new Day({

//     }),
//   },
//   weeks: {

//   },
//   months: {},
//   //
//   leap: true,
//   lengths: [365, 366],
// });

// for (const year of years){
//   console.log(year); // 0 - 1
// }

// for(const month of months){
//   console.log(month); // 0 - 11
// }

// const fridaysThe13thQ = new Query(
//   'select * from days where day = 13 and day_of_week = "5" and year > "2010" order by day.index asc limit 1'
// );
