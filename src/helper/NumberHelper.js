export default {
    /**
     * Count the number of decimal
     *
     * @param {number} number
     * @return {number}
     */
    countDecimal(number) {
        if ((parseFloat(number) % 1) !== 0) {
            if (number.toString().indexOf('e') !== -1) {
                return Math.abs(number.toString().split('e')[1]);
            }
            return number.toString().split(".")[1].length;
        }
        return 0;
    },

    /**
     * sum an array number
     *
     * @param {Array.<number>} numbers
     * @return {*|any}
     */
    addNumber(...numbers) {
        return numbers.reduce((a, b) => {
            if (!a) {
                a = 0;
            }
            if (!b) {
                b = 0;
            }
            let maxCountNumberDecimal = Math.max(this.countDecimal(a), this.countDecimal(b));
            return parseFloat((+a + +b).toFixed(maxCountNumberDecimal));
        });
    },

    /**
     * Minus 2 numbers
     * @param {number} a
     * @param {number} b
     * @return {number}
     */
    minusNumber(a, b) {
        if (!a) {
            a = 0;
        }
        if (!b) {
            b = 0;
        }
        let maxCountNumberDecimal = Math.max(this.countDecimal(a), this.countDecimal(b));
        return parseFloat((+a - +b).toFixed(maxCountNumberDecimal));
    },

    /**
     * Multiple 2 numbers
     * @param {Array.<number>} numbers
     * @return {number}
     */
    multipleNumber(...numbers) {
        return numbers.reduce((a, b) => {
            if (!a) {
                a = 0;
            }
            if (!b) {
                b = 0;
            }
            let maxCountNumberDecimal = this.countDecimal(a) + this.countDecimal(b);
            return parseFloat((+a * +b).toFixed(maxCountNumberDecimal));
        });
    },
    phpRound (value, precision, mode) {
        //   example 1: round(1241757, -3)
        //   returns 1: 1242000
        //   example 2: round(3.6)
        //   returns 2: 4
        //   example 3: round(2.835, 2)
        //   returns 3: 2.84
        //   example 4: round(1.1749999999999, 2)
        //   returns 4: 1.17
        //   example 5: round(58551.799999999996, 2)
        //   returns 5: 58551.8

        let m, f, isHalf, sgn; // helper variables
        // making sure precision is integer
        precision |= 0;
        m      = Math.pow(10, precision);
        value *= m;
        // sign of the number
        sgn    = (value > 0) | -(value < 0);
        isHalf = value % 1 === 0.5 * sgn;
        f      = Math.floor(value);

        if (isHalf) {
            switch (mode) {
                case 'PHP_ROUND_HALF_DOWN':
                    // rounds .5 toward zero
                    value = f + (sgn < 0);
                    break;
                case 'PHP_ROUND_HALF_EVEN':
                    // rouds .5 towards the next even integer
                    value = f + (f % 2 * sgn);
                    break;
                case 'PHP_ROUND_HALF_ODD':
                    // rounds .5 towards the next odd integer
                    value = f + !(f % 2);
                    break;
                default:
                    // rounds .5 away from zero
                    value = f + (sgn > 0)
            }
        }

        return (isHalf ? value : Math.round(value)) / m
    }

}