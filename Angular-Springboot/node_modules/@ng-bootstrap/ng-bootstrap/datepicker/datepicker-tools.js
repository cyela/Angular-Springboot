import { NgbDate } from './ngb-date';
import { isDefined } from '../util/util';
export function isChangedDate(prev, next) {
    return !dateComparator(prev, next);
}
export function dateComparator(prev, next) {
    return (!prev && !next) || (!!prev && !!next && prev.equals(next));
}
export function checkMinBeforeMax(minDate, maxDate) {
    if (maxDate && minDate && maxDate.before(minDate)) {
        throw new Error("'maxDate' " + maxDate + " should be greater than 'minDate' " + minDate);
    }
}
export function checkDateInRange(date, minDate, maxDate) {
    if (date && minDate && date.before(minDate)) {
        return NgbDate.from(minDate);
    }
    if (date && maxDate && date.after(maxDate)) {
        return NgbDate.from(maxDate);
    }
    return date;
}
export function isDateSelectable(date, state) {
    var minDate = state.minDate, maxDate = state.maxDate, disabled = state.disabled, markDisabled = state.markDisabled;
    // clang-format off
    return !(!isDefined(date) ||
        disabled ||
        (markDisabled && markDisabled(date, { year: date.year, month: date.month })) ||
        (minDate && date.before(minDate)) ||
        (maxDate && date.after(maxDate)));
    // clang-format on
}
export function generateSelectBoxMonths(calendar, date, minDate, maxDate) {
    if (!date) {
        return [];
    }
    var months = calendar.getMonths();
    if (minDate && date.year === minDate.year) {
        var index = months.findIndex(function (month) { return month === minDate.month; });
        months = months.slice(index);
    }
    if (maxDate && date.year === maxDate.year) {
        var index = months.findIndex(function (month) { return month === maxDate.month; });
        months = months.slice(0, index + 1);
    }
    return months;
}
export function generateSelectBoxYears(date, minDate, maxDate) {
    if (!date) {
        return [];
    }
    var start = minDate && minDate.year || date.year - 10;
    var end = maxDate && maxDate.year || date.year + 10;
    return Array.from({ length: end - start + 1 }, function (e, i) { return start + i; });
}
export function nextMonthDisabled(calendar, date, maxDate) {
    return maxDate && calendar.getNext(date, 'm').after(maxDate);
}
export function prevMonthDisabled(calendar, date, minDate) {
    var prevDate = calendar.getPrev(date, 'm');
    return minDate && (prevDate.year === minDate.year && prevDate.month < minDate.month ||
        prevDate.year < minDate.year && minDate.month === 1);
}
export function buildMonths(calendar, date, state, i18n, force) {
    var displayMonths = state.displayMonths, months = state.months;
    // move old months to a temporary array
    var monthsToReuse = months.splice(0, months.length);
    // generate new first dates, nullify or reuse months
    var firstDates = Array.from({ length: displayMonths }, function (_, i) {
        var firstDate = calendar.getNext(date, 'm', i);
        months[i] = null;
        if (!force) {
            var reusedIndex = monthsToReuse.findIndex(function (month) { return month.firstDate.equals(firstDate); });
            // move reused month back to months
            if (reusedIndex !== -1) {
                months[i] = monthsToReuse.splice(reusedIndex, 1)[0];
            }
        }
        return firstDate;
    });
    // rebuild nullified months
    firstDates.forEach(function (firstDate, i) {
        if (months[i] === null) {
            months[i] = buildMonth(calendar, firstDate, state, i18n, monthsToReuse.shift() || {});
        }
    });
    return months;
}
export function buildMonth(calendar, date, state, i18n, month) {
    if (month === void 0) { month = {}; }
    var minDate = state.minDate, maxDate = state.maxDate, firstDayOfWeek = state.firstDayOfWeek, markDisabled = state.markDisabled, outsideDays = state.outsideDays;
    month.firstDate = null;
    month.lastDate = null;
    month.number = date.month;
    month.year = date.year;
    month.weeks = month.weeks || [];
    month.weekdays = month.weekdays || [];
    date = getFirstViewDate(calendar, date, firstDayOfWeek);
    // month has weeks
    for (var week = 0; week < calendar.getWeeksPerMonth(); week++) {
        var weekObject = month.weeks[week];
        if (!weekObject) {
            weekObject = month.weeks[week] = { number: 0, days: [], collapsed: true };
        }
        var days = weekObject.days;
        // week has days
        for (var day = 0; day < calendar.getDaysPerWeek(); day++) {
            if (week === 0) {
                month.weekdays[day] = calendar.getWeekday(date);
            }
            var newDate = new NgbDate(date.year, date.month, date.day);
            var nextDate = calendar.getNext(newDate);
            var ariaLabel = i18n.getDayAriaLabel(newDate);
            // marking date as disabled
            var disabled = !!((minDate && newDate.before(minDate)) || (maxDate && newDate.after(maxDate)));
            if (!disabled && markDisabled) {
                disabled = markDisabled(newDate, { month: month.number, year: month.year });
            }
            // saving first date of the month
            if (month.firstDate === null && newDate.month === month.number) {
                month.firstDate = newDate;
            }
            // saving last date of the month
            if (newDate.month === month.number && nextDate.month !== month.number) {
                month.lastDate = newDate;
            }
            var dayObject = days[day];
            if (!dayObject) {
                dayObject = days[day] = {};
            }
            dayObject.date = newDate;
            dayObject.context = Object.assign(dayObject.context || {}, {
                date: { year: newDate.year, month: newDate.month, day: newDate.day },
                currentMonth: month.number, disabled: disabled,
                focused: false,
                selected: false
            });
            dayObject.tabindex = -1;
            dayObject.ariaLabel = ariaLabel;
            dayObject.hidden = false;
            date = nextDate;
        }
        weekObject.number = calendar.getWeekNumber(days.map(function (day) { return NgbDate.from(day.date); }), firstDayOfWeek);
        // marking week as collapsed
        weekObject.collapsed = outsideDays === 'collapsed' && days[0].date.month !== month.number &&
            days[days.length - 1].date.month !== month.number;
    }
    return month;
}
export function getFirstViewDate(calendar, date, firstDayOfWeek) {
    var daysPerWeek = calendar.getDaysPerWeek();
    var firstMonthDate = new NgbDate(date.year, date.month, 1);
    var dayOfWeek = calendar.getWeekday(firstMonthDate) % daysPerWeek;
    return calendar.getPrev(firstMonthDate, 'd', (daysPerWeek + dayOfWeek - firstDayOfWeek) % daysPerWeek);
}
//# sourceMappingURL=datepicker-tools.js.map