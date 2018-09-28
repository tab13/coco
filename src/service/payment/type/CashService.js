import {PaymentAbstract} from "./PaymentAbstract";
import PaymentConstant from "../../../view/constant/PaymentConstant";

export class Cash extends PaymentAbstract{
    code = PaymentConstant.CASH;
}