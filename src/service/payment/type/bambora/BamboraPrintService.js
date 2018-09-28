import CoreService from "../../../CoreService";
import ServiceFactory from "../../../../framework/factory/ServiceFactory";
import i18n from "../../../../config/i18n";

export class BamboraPrintService extends CoreService {
    static className = 'BamboraPrintService';

    aboveHeader = "";
    rowAboveHeader = [];
    header = "";
    rowHeader = [];
    content = "";
    rowContent = [];
    footer = "";
    rowFooter = [];
    defaultAlign = "";
    defaultStyle = "";

    /**
     * Reset all temp data
     */
    resetData() {
        this.aboveHeader = "";
        this.rowAboveHeader = [];
        this.header = "";
        this.rowHeader = [];
        this.content = "";
        this.rowContent = [];
        this.footer = "";
        this.rowFooter = [];
        this.defaultAlign = "";
        this.defaultStyle = "";
    }

    /**
     * Print bambora receipt
     *
     * @param receiptData
     * @return {boolean}
     */
    print(receiptData) {
        if (!receiptData) {
            return false;
        }
        this.resetData();
        this.formatString(receiptData);

        let startHtml = "<html><body>";
        let endHtml = "</body></html>";
        let startTable = "<table style= 'width:100%' >";
        let endTable = "</table>";
        let startDiv = "<div style= 'width:100%' >";
        let endDiv = "</div>";

        let cssHtml = "<style> " +
            "@media screen {.paper {margin: 5px auto; max-width: 500px;}} " +
            "@media print {body {color: #000; background-color: #fff;}} " +
            "@page{ size: auto; margin: 0 4mm;}" +
            "</style>";
        cssHtml += "<style> " +
            ".left{width:33%; text-align: left} " +
            ".center{width:33%; text-align: center} " +
            ".right{width:33%; text-align: right}" +
            "</style>";

        let aboveHeaderHtml = '';
        let headerHtml = '';
        let contentHtml = '';
        let footerHtml = '';

        /** build header */
        if (this.rowAboveHeader.length) {
            this.defaultAlign = this.getDefaultAligned(this.aboveHeader);
            let html = this.buidRow(this.rowAboveHeader);
            aboveHeaderHtml = startDiv + html + endDiv;
        }

        /** build header */
        if (this.rowHeader.length) {
            this.defaultAlign = this.getDefaultAligned(this.header);
            let html = this.buidRow(this.rowHeader);
            headerHtml = startDiv + html + endDiv;
        }

        /** build content */
        if (this.rowContent.length) {
            this.defaultAlign = this.getDefaultAligned(this.content);
            let html = this.buidRow(this.rowContent);
            contentHtml = startDiv + html + endDiv;
        }

        /** build content */
        if (this.rowFooter.length) {
            this.defaultAlign = this.getDefaultAligned(this.footer);
            let html = this.buidRow(this.rowFooter);
            footerHtml = startDiv + html + endDiv;
        }

        let receiptHtml = startHtml +
            startTable +
            aboveHeaderHtml +
            headerHtml +
            contentHtml +
            footerHtml +
            endTable +
            endHtml +
            cssHtml;

        let print_window = window.open('', 'print_offline', 'status=1,width=500,height=700');
        if (print_window) {
            print_window.document.open();
            print_window.document.write(receiptHtml);
            print_window.print();
            print_window.close();
        } else {
            window.alert("Your browser has blocked the automatic popup, " +
                "please change your browser setting or print the receipt manually");
        }
    }

    /**
     * Format receipt string base on Bambora receipt pattern
     *
     * @param string
     */
    formatString(string) {
        /** replace string goal */
        string = string.replace(/\u001b0/gi, i18n.translator.translate("All receipts"));
        /** All receipts (default): 0 */
        string = string.replace(/\u001b1/gi, i18n.translator.translate("Approved"));
        /** Approved receipts : 1 */
        string = string.replace(/\u001b2/gi, i18n.translator.translate("Declined"));
        /** Declined receipts : 2 */
        string = string.replace(/\u001b3/gi, i18n.translator.translate("Merchant"));
        /** Merchant receipts : 3 */
        string = string.replace(/\u001b4/gi, i18n.translator.translate("Cardholder"));
        /** Cardholder receipts : 4 */

        /** remove Decorations */
        string = string.replace(/\u001bp/g, "---------------------\n");
        /** Horizontal separator (---------) : p */
        //str = str.replace(/\u001bp/g, "");  /** Horizontal separator (---------) : p */
        string = string.replace(/\u001bq/g, "");
        /** Pad with following character, e.g. ‘_’  as long as the receipt width. : q */

        /** get above header text */
        let startStr = "\u001b ";
        let endStr = "\u001b!";
        let aboveHeader = this.getSections(startStr, endStr, string);
        aboveHeader = this.formatSection(aboveHeader);
        let rowAboveHeader = this.getRow(aboveHeader);
        this.aboveHeader = aboveHeader;
        this.rowAboveHeader = rowAboveHeader;

        /** get header text */
        startStr = "\u001b!";
        endStr = '\u001b&';
        let header = this.getSections(startStr, endStr, string);
        header = this.formatSection(header);
        let rowHeader = this.getRow(header);
        this.header = header;
        this.rowHeader = rowHeader;

        /** get content text */
        startStr = "\u001b&";
        endStr = "\u001b$";
        let content = this.getSections(startStr, endStr, string);
        content = this.formatSection(content);
        let rowContent = this.getRow(content);
        this.content = content;
        this.rowContent = rowContent;


        /** get footer text */
        startStr = "\u001b$";
        endStr = "\u001b'";
        let footer = this.getSections(startStr, endStr, string);
        footer = this.formatSection(footer);
        let rowFooter = this.getRow(footer);
        this.footer = footer;
        this.rowFooter = rowFooter;
    }

    /**
     * Get receipt sections from bambora receipt string
     *
     * @param start_str
     * @param end_str
     * @param str
     * @return {string}
     */
    getSections(start_str, end_str, str) {
        let start = str.indexOf(start_str);
        let end = str.indexOf(end_str);
        let str_header = '';
        /** exist header && content */
        if ((start !== -1) && (end !== -1)) {
            str_header = str.substring(start, end);
        }
        return str_header;
    }

    /**
     * format receipt sections
     *
     * @param string
     * @return {*}
     */
    formatSection(string) {
        /** remove Sections */
        string = string.replace(/\u001b /gi, "");
        /** Above header : (space) */
        string = string.replace(/\u001b!/gi, "");
        /** Header : ! */
        string = string.replace(/\u001b"/gi, "");
        /** Below header (above content) : " */
        string = string.replace(/\u001b#/gi, "");
        /** Above footer (below content) : # */
        string = string.replace(/\u001b$/gi, "");
        /** Footer : $ */
        string = string.replace(/\u001b%/gi, "");
        /** Below footer : % */
        string = string.replace(/\u001b&/gi, "");
        /** Content : & */
        string = string.replace(/\u001b'/gi, "");
        /** End of receipt : ' */

        /* force remove */
        string = string.replace("\u001b!", "");
        /** Header : ! */
        string = string.replace("\u001b$", "");
        /** Footer : $ */
        string = string.replace("\u001b%", "");
        /** Below footer : % */
        string = string.replace("\u001b&", "");
        /** Content : & */
        string = string.replace("u001b'", "");
        /** End of receipt : ' */

        return string;
    }

    /**
     * Get section's rows
     * @param str
     * @return {Array}
     */
    getRow(str) {
        let array = [];
        let sub_str = "\n";
        let start = str.indexOf(sub_str);
        while (start >= 0) {
            if (start !== 0) {
                let row = str.substr(0, start);
                array.push(row);
            }
            str = str.slice(start + sub_str.length);
            start = str.indexOf(sub_str);
        }
        return array;
    }

    /**
     * Build section's rows
     *
     * @param rowsArray
     * @return {string}
     */
    buidRow(rowsArray) {
        let self = this;
        let html = '';
        let startRow = "<tr style='width:100% ; font-size: 12px;'>";
        let endRow = "</tr>";
        let openLeftRow = '<td class="left"  >';
        let openCenterRow = '<td class="center"  >';
        let openRightRow = '<td class="right"  >';
        let closeRow = '</td>';

        /** build html */
        rowsArray.forEach(function (row) {
            /** build row */
            html += startRow;
            /** build alignned in row */
            let alignedRow = self.getAligned(row);

            if (typeof alignedRow === "object") {
                alignedRow.forEach(function (subRow) {
                    html += openLeftRow;
                    if (subRow.left) {
                        html += self.stringFinalRow(subRow.left, subRow.style_left);
                    }
                    html += closeRow;

                    html += openCenterRow;
                    if (subRow.center) {
                        html += self.stringFinalRow(subRow.center, subRow.style_center);
                    }
                    html += closeRow;

                    html += openRightRow;
                    if (subRow.right) {
                        html += self.stringFinalRow(subRow.right, subRow.style_right);
                    }
                    html += closeRow;
                });
            }
            html += endRow;
        });
        return html;
    }

    /**
     *
     *
     * @param string
     * @param style
     * @return {*}
     */
    stringFinalRow(string, style) {
        if (style === "bold") {
            return "<b>" + string + "</b>";
        }
        if (style === "normal") {
            return string;
        }
        if (style === "italic") {
            return "<i>" + string + "</i>";
        }
        if (style === "double") {
            return "<h3>" + string + "</h3>";
        }
    }

    /**
     *
     * @param str
     * @return {Array}
     */
    getAligned(str) {
        let array = [];
        let leftStr = "\u001b@";
        let centerStr = "\u001bA";
        let rightStr = "\u001bB";
        let subRow = [];

        /** Not have align */
        let hasLeft = str.indexOf(leftStr);
        let hasCenter = str.indexOf(centerStr);
        let hasRight = str.indexOf(rightStr);
        if ((hasLeft === -1) && (hasCenter === -1) && (hasRight === -1)) {
            if (this.defaultAlign === 'left') {
                subRow['style_left'] = this.getStyle(str);
                str = this.removeStyleRow(str);
                subRow['left'] = str;
            }
            if (this.defaultAlign === 'center') {
                subRow['style_center'] = this.getStyle(str);
                str = this.removeStyleRow(str);
                subRow['center'] = str;
            }
            if (this.defaultAlign === 'right') {
                subRow['style_right'] = str;
                str = this.removeStyleRow(str);
                subRow['right'] = str;
                //array.push({'right':str});
            }
            array.push(subRow);
            return array;
        }

        /** Left aligned (default) */
        if (hasLeft !== -1) {
            str = str.replace(/\u001b@/gi, "");
            this.defaultAlign = 'left';
            let checkFlag = str.indexOf("\u001bA");
            if (checkFlag !== -1) {
                let leftString = str.substr(0, checkFlag);
                str = str.slice(checkFlag);
                subRow['style_left'] = this.getStyle(leftString);
                leftString = this.removeStyleRow(leftString);
                subRow['left'] = leftString;
            } else {
                let checkFlag = str.indexOf("\u001bB");
                if (checkFlag !== -1) {
                    let leftString = str.substr(0, checkFlag);
                    str = str.slice(checkFlag);
                    subRow['style_left'] = this.getStyle(leftString);
                    leftString = this.removeStyleRow(leftString);
                    subRow['left'] = leftString;
                } else {
                    subRow['style_left'] = this.getStyle(str);
                    str = this.removeStyleRow(str);
                    subRow['left'] = str;
                }
            }
        } else {
            this.defaultAlign = 'left';
            let checkFlag = str.indexOf("\u001bA");
            if (checkFlag !== -1) {
                let leftString = str.substr(0, checkFlag);
                str = str.slice(checkFlag);
                if (leftString.length > 0) {
                    subRow['style_left'] = this.getStyle(leftString);
                    leftString = this.removeStyleRow(leftString);
                    subRow['left'] = leftString;
                }
            } else {
                let checkFlag = str.indexOf("\u001bB");
                if (checkFlag !== -1) {
                    let leftString = str.substr(0, checkFlag);
                    str = str.slice(checkFlag);
                    if (leftString.length > 0) {
                        subRow['style_left'] = this.getStyle(leftString);
                        leftString = this.removeStyleRow(leftString);
                        subRow['left'] = leftString;
                    }
                }
            }

        }

        /** Center aligned: A */
        if (hasCenter !== -1) {
            str = str.replace(/\u001bA/gi, "");
            this.defaultAlign = 'center';
            let checkFlag = str.indexOf("\u001bB");
            if (checkFlag !== -1) {
                let centerString = str.substr(0, checkFlag);
                str = str.slice(checkFlag);
                subRow['style_center'] = this.getStyle(centerString);
                centerString = this.removeStyleRow(centerString);
                subRow['center'] = centerString;
            } else {
                subRow['style_center'] = this.getStyle(str);
                str = this.removeStyleRow(str);
                subRow['center'] = str;
            }
        }

        /** Right aligned: B */
        if (hasRight !== -1) {
            str = str.replace(/\u001bB/gi, "");
            this.defaultAlign = 'right';
            subRow['style_right'] = this.getStyle(str);
            str = this.removeStyleRow(str);
            subRow['right'] = str;

        }

        array.push(subRow);
        return array;
    }

    /**
     *
     * @param str
     * @return {string}
     */
    getStyle(str) {
        let italicText = str.indexOf("\u001bP");
        if (italicText !== -1) {
            this.defaultStyle = 'normal';
            return 'normal';
        }

        italicText = str.indexOf("\u001bQ");
        if (italicText !== -1) {
            this.defaultStyle = 'italic';
            return 'italic';
        }

        let boldText = str.indexOf("\u001bR");
        if (boldText !== -1) {
            this.defaultStyle = 'bold';
            return 'bold';
        }

        let doubleHeight = str.indexOf("\u001bS");
        if (doubleHeight !== -1) {
            this.defaultStyle = 'double';
            return 'double';
        }

        if (this.defaultStyle) {
            return this.defaultStyle;
        }

        return 'double';
    }

    /**
     *
     * @param str
     * @return {*}
     */
    removeStyleRow(str) {
        str = str.replace(/\u001bP/gi, "");
        /** Normal text (default) : P */
        str = str.replace(/\u001bQ/gi, "");
        /** Italic text : Q */
        str = str.replace(/\u001bR/gi, "");
        /** Bold text : R */
        str = str.replace(/\u001bS/gi, "");
        /** Double height : S */
        return str;
    }

    /**
     * 
     * @param str
     * @return {string}
     */
    getDefaultAligned(str) {
        let aligned = str.substr(0, 2);
        /** Left aligned (default) */
        if (aligned === "\u001b@") {
            return "left";
        }
        /** Center aligned */
        if (aligned === "\u001bA") {
            return "center";
        }

        /** Right aligned */
        if (aligned === "\u001bB") {
            return "right";
        }
        return "left";
    }
}

/** @type BamboraPrintService */
let bamboraPrintService = ServiceFactory.get(BamboraPrintService);

export default bamboraPrintService;