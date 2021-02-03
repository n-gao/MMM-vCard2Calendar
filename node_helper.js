const NodeHelper = require("node_helper");
const moment = require("moment");
const ICAL = require("ical.js");
const request = require("request");
const { v4: uuid } = require("uuid");


module.exports = NodeHelper.create({
    start: function () {
        const self = this;
        this.config = {};
        this.expressApp.use("/" + this.name, (req, res) => {
            self.sendCalendar(res);
        });
    },

    socketNotificationReceived: function (notification, payload) {
        switch (notification) {
            case "SET_CONFIG":
                this.config = payload;
                break;
            default:
                console.error("{} is not supported", notification);
        }
    },

    sendCalendar: function (res) {
        const self = this;
        this.fetchCalendar(function (error, response, body) {
            if (error) {
                console.error("Failed to retrieve vCard", error);
                const calendar = new ICAL.Component(['vcalendar', [], []]);
                res.writeHead(200, {
                    'Content-Type': 'text/calendar; charset=utf-8',
                    'Content-Disposition': 'attachment; filename=calendar.ics'
                });
                res.end(calendar.toString());
            } else {
                const ics = self.vCardToICal(body);
                res.writeHead(200, {
                    'Content-Type': 'text/calendar; charset=utf-8',
                    'Content-Disposition': 'attachment; filename=calendar.ics'
                });
                res.end(ics);
            }
        });
    },

    fetchCalendar: function (callback) {
        request.get({
            url: this.config.url,
            auth: this.config.auth
        }, callback);
    },

    vCardToICal: function (vCard) {
        const contacts = ICAL.parse(vCard);
        const calendar = new ICAL.Component(['vcalendar', [], []]);
        calendar.addPropertyWithValue('x-wr-timezone', ICAL.Timezone.utcTimezone);
        contacts.forEach(contact => {
            const component = new ICAL.Component(contact);
            const birthDay = component.getFirstPropertyValue("bday");
            if (birthDay) {
                const name = component.getFirstPropertyValue("fn");
                const month = birthDay.month;
                const day = birthDay.day;
                // This is a weird Magic Mirror bug where recurrent events are offset by an hour.
                // A workaround is to just use new events every year which is no problem since
                // the events are created on the fly.
                // const year = birthDay.year ? birthDay.year : moment().year();
                let year = moment().year();
                // If the Birthday is in the past add it for next year
                if (moment([year, month - 1, day + 1]) < moment()) {
                    year++;
                }
                const date = new ICAL.Time({
                    year: year,
                    month: month,
                    day: day,
                    isDate: true
                });
                const endDate = date.clone();
                endDate.addDuration(new ICAL.Duration({
                    days: 1
                }));

                const vevent = new ICAL.Component('vevent');
                const event = new ICAL.Event(vevent);
                event.summary = name;
                event.uid = uuid();
                event.startDate = date;
                event.endDate = endDate;
                // See above
                // vevent.addPropertyWithValue('rrule', new ICAL.Recur({
                //     freq: 'yearly'
                // }));
                vevent.addPropertyWithValue('dtstamp', ICAL.Time.now());
                calendar.addSubcomponent(vevent);
            }
        });
        return calendar.toString();
    }
});
