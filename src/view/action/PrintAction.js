import * as PrintConstant from "../constant/PrintConstant";

export default {
    /**
     * Action Print After
     *
     * @return {{type}}
     */
    finishPrint: () => {
        return {
            type: PrintConstant.FINISH_PRINT
        }
    }
}
