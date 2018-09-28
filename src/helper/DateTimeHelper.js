import moment from "moment/moment";

export default {
    /**
     * Month name string array
     *
     * @type {string[]}
     */
    monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],

    /**
     * Full month name string array
     * @type {string[]}
     */
    fullMonthName: [
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
        "November", "December"
    ],

    /**
     * Get database format full year
     *
     * @param {Date} date
     * @returns {string}
     */
    getFullYear(date) {
        return this.getStringDateTime(date.getFullYear());
    },

    /**
     * Get database format month
     *
     * @param {Date} date
     * @returns {string}
     */
    getMonth(date) {
        return this.getStringDateTime(date.getMonth() + 1);
    },

    /**
     * Get database format date
     *
     * @param {Date} date
     * @returns {string}
     */
    getDate(date) {
        return this.getStringDateTime(date.getDate());
    },

    /**
     * Get database format hour
     *
     * @param {Date} date
     * @returns {string}
     */
    getHours(date) {
        return this.getStringDateTime(date.getHours());
    },

    /**
     * Get database format minus
     *
     * @param {Date} date
     * @returns {string}
     */
    getMinutes(date) {
        return this.getStringDateTime(date.getMinutes());
    },

    /**
     * Get database format seconds
     *
     * @param {Date} date
     * @returns {string}
     */
    getSeconds(date) {
        return this.getStringDateTime(date.getSeconds());
    },

    /**
     * Get database format date or time
     *
     * @param {number} number
     * @returns {string}
     */
    getStringDateTime(number) {
        if (number < 10) {
            return "0" + number;
        }
        return String(number);
    },

    /**
     * Get database format date time from current timestamp
     *
     * @param currentTimestamp
     * @returns {string}
     */
    getDatabaseDateTime(currentTimestamp) {
        let dateTime = new Date(new Date().getTime() + this.getTimezoneOffsetTimeStamp());
        if (currentTimestamp) {
            dateTime = new Date(currentTimestamp + this.getTimezoneOffsetTimeStamp());
        }
        return this.getFullYear(dateTime) + "-" +
            this.getMonth(dateTime) + "-" +
            this.getDate(dateTime) + " " +
            this.getHours(dateTime) + ":" +
            this.getMinutes(dateTime) + ":" +
            this.getSeconds(dateTime);
    },



    getCurrentDateTime() {
        return moment().format('lll');
    },

    getDayOfWeekDateTime() {
        return moment().format('llll');
    },




    /**
     * Get time zone offset to timestamp
     *
     * @returns {number}
     */
    getTimezoneOffsetTimeStamp() {
        return new Date().getTimezoneOffset() * 60 * 1000;
    },

    /**
     *
     *
     * @param databaseDateTime
     * @returns {Date}
     */
    convertDatabaseDateTimeToLocalDate(databaseDateTime) {
        let timeMSecond = moment(databaseDateTime).unix() * 1000;
        return new Date(timeMSecond - this.getTimezoneOffsetTimeStamp());
    },

    /**
     * Get date time string to receipt
     * @param databaseDateTime {string}
     * @param getTime {boolean}
     * @returns {string}
     */
    getReceiptDateTime(databaseDateTime, getTime = true) {
        let dateTime = this.convertDatabaseDateTimeToLocalDate(databaseDateTime);
        let time = this.getDate(dateTime) + "/" +
            this.getMonth(dateTime) + "/" +
            this.getFullYear(dateTime);
        if (getTime) {
            time += " " + this.getHours(dateTime) + ":" +
                this.getMinutes(dateTime);
        }
        return time;
    },

    /**
     * get date object from timestamp
     *
     * @param timestamp
     * @returns {Date}
     */
    getDateObjectFromTimestamp(timestamp) {
        return new Date(timestamp);
    },

    /**
     * get time from timestamp
     *
     * @param timestamp
     * @returns {string}
     */
    getTimeFromTimestamp(timestamp) {
        let dateTime = this.getDateObjectFromTimestamp(timestamp);
        let hour = dateTime.getHours();
        let min = dateTime.getMinutes();
        hour = hour > 9 ? hour : `0${hour}`;
        min = min > 9 ? min : `0${min}`;
        return `${hour}:${min}`;
    },

    /**
     * Check current date in date range
     *
     * @param dateFrom
     * @param dateTo
     * @return {boolean}
     */
    isCurrentDateInInterval(dateFrom = null, dateTo = null) {
        let currentTime = new Date();
        let timezoneOffset = currentTime.getTimezoneOffset();
        let currentTimeStamp = new Date(currentTime.getTime() + timezoneOffset * 60 * 1000).getTime();
        let fromTimeStamp = new Date(dateFrom).getTime();
        let toTimeStamp = new Date(dateTo).getTime();
        let toNextDateTimeStamp = new Date(toTimeStamp + 86400 * 1000).getTime();
        if (dateFrom && currentTimeStamp < fromTimeStamp) {
            return false;
        }
        if (dateTo && currentTimeStamp > toNextDateTimeStamp) {
            return false;
        }
        return true;
    }
}