import {PaymentAbstract} from "./PaymentAbstract";
import PaymentConstant from "../../../view/constant/PaymentConstant";

export class PaymentStoreCreditService extends PaymentAbstract{
    code = PaymentConstant.STORE_CREDIT;
}