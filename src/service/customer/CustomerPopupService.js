import CoreService from "../CoreService";
import ServiceFactory from "../../framework/factory/ServiceFactory";
import CountryHelper from "../../helper/CountryHelper";

export class CustomerPopupService extends CoreService {
    static className = 'CustomerPopupService';

    /**
     * set row customer field
     * @param arrField
     * @returns {Array}
     */
    setRowCustomerField(arrField) {
        let allRow = [];
        for (let field of arrField) {
            let key = this.checkOneRowField(allRow);
            if (key >= 0 && field.oneRow === false) {
                allRow[key].push(field);
            } else {
                allRow.push([field]);
            }
        }
        return allRow;
    }

    /**
     * check one row field
     * @param allRow
     * @returns {number}
     */
    checkOneRowField(allRow) {
        let key = -1;
        for (let i = 0; i < allRow.length; i++) {
            let row = allRow[i];
            if (row.length === 1 && row[0].oneRow === false) {
                key = i;
                break;
            }
        }
        return key;
    }

    /**
     * create customer field input
     * @param code
     * @param ref
     * @param type
     * @param label
     * @param optional
     * @param required
     * @param required_email
     * @param max_length
     * @param google_suggest
     * @param oneRow
     * @returns {{code: *, ref: *, type: *, label: *, optional: *, required: *, required_email: *, max_length: *, google_suggest: *, oneRow: *}}
     */
    createCustomerFieldInput(code, ref, type, label, default_value, optional, required, required_email, max_length, google_suggest, oneRow) {
        let field = {
            code: code,
            ref: ref,
            type: type,
            label: label,
            default_value: default_value,
            optional: optional,
            required: required,
            required_email: required_email,
            max_length: max_length,
            google_suggest: google_suggest,
            oneRow: oneRow
        };
        return field;
    }

    /**
     * create field group
     * @param code
     * @param ref
     * @param type
     * @param label
     * @param default_value
     * @param options
     * @param key_value
     * @param key_title
     * @param oneRow
     * @returns {{code: *, ref: *, type: *, label: *, default_value: *, options: *, key_value: *, key_title: *, oneRow: *}}
     */
    createCustomerFieldGroup(code, ref, type, label, default_value, options, key_value, key_title, oneRow) {
        let field = {
            code: code,
            ref: ref,
            type: type,
            label: label,
            default_value: default_value,
            options: options,
            key_value: key_value,
            key_title: key_title,
            oneRow: oneRow
        };
        return field;
    }

    /**
     * create field check
     * @param code
     * @param ref
     * @param type
     * @param label
     * @param check
     * @param oneRow
     * @returns {{code: *, ref: *, type: *, label: *, check: *, oneRow: *}}
     */
    createCustomerFieldCheckBox(code, ref, type, label, check, disabled ,oneRow) {
        let field = {
            code: code,
            ref: ref,
            type: type,
            label: label,
            check: check,
            disabled: disabled,
            oneRow: oneRow
        };
        return field;
    }

    /**
     * create customer field input
     * @param code
     * @param states
     * @param ref
     * @param type
     * @param label
     * @param default_value
     * @param optional
     * @param required
     * @param required_email
     * @param max_length
     * @param google_suggest
     * @param key_value
     * @param key_title
     * @param oneRow
     * @returns {{code: *,
     * states: *,
     * ref: *,
     * type: *,
     * label: *,
     * default_value: *,
     * optional: *,
     * required: *,
     * required_email: *,
     * max_length: *,
     * google_suggest: *,
     * key_value: *,
     * key_title: *,
     * oneRow: *}}
     */
    createCustomerFieldState(code, states, ref, type, label, default_value,
                             optional, required, required_email, max_length,
                             google_suggest, key_value, key_title, oneRow) {
        let field = {
            code: code,
            states: states,
            ref: ref,
            type: type,
            label: label,
            default_value: default_value,
            optional: optional,
            required: required,
            required_email: required_email,
            max_length: max_length,
            google_suggest: google_suggest,
            key_value: key_value,
            key_title: key_title,
            oneRow: oneRow
        };
        return field;
    }

    /**
     * save customer
     * @param customer
     * @param data
     */
    saveCustomer(customer, data) {
        customer.firstname = this.getRefField(data, 'firstname').ref.input.value;
        customer.lastname = this.getRefField(data, 'lastname').ref.input.value;
        customer.email = this.getRefField(data, 'email').ref.input.value;
        customer.telephone = this.getRefField(data, 'telephone').ref.input.value;
        customer.group_id = this.getRefField(data, 'group_id').ref.select.value;
        customer.subscriber_status = this.getRefField(data, 'subscriber_status').ref.input.checked ? 1 : 0;
        return customer;
    }

    /**
     * save address
     * @param customer
     * @param current_address
     * @param data
     * @returns {{id, customer_id,
     * firstname,
     * lastname,
     * middlename: string,
     * prefix: string,
     * suffix: string,
     * telephone,
     * fax: string,
     * company,
     * street: Array,
     * city,
     * postcode,
     * country_id,
     * region: {region_code: *, region: *, region_id: number},
     * region_id: number,
     * default_shipping,
     * default_billing,
     * created_at: (*|string), updated_at: (*|string)}}
     */
    saveAddress(customer, current_address, data, is_new_address) {
        current_address = {
            id: current_address.id,
            customer_id: customer.id,
            is_new_address: is_new_address,
            firstname: this.getRefField(data, 'firstname').ref.input.value,
            lastname: this.getRefField(data, 'lastname').ref.input.value,
            middlename: this.getRefField(data, 'middlename') ? this.getRefField(data, 'middlename').ref.input.value : "" ,
            prefix: this.getRefField(data, 'prefix') ? this.getRefField(data, 'prefix').ref.input.value : "",
            suffix: this.getRefField(data, 'suffix') ? this.getRefField(data, 'suffix').ref.input.value : "",
            telephone: this.getRefField(data, 'telephone') ? this.getRefField(data, 'telephone').ref.input.value : "",
            fax: this.getRefField(data, 'fax') ? this.getRefField(data, 'fax').ref.input.value : "",
            company: this.getRefField(data, 'company').ref.input.value,
            street: this.getStreet(data),
            city: this.getRefField(data, 'city').ref.input.value,
            postcode: this.getRefField(data, 'postcode').ref.input.value,
            country_id: this.getRefField(data, 'country').ref.select.value,
            region: this.getRegion(data),
            region_id: this.getRegion(data).region_id,
            default_shipping: this.getRefField(data, 'default_shipping').ref.input.checked,
            default_billing: this.getRefField(data, 'default_billing').ref.input.checked
        };
        this.checkDefaultAddress(customer, current_address.default_shipping, current_address.default_billing);
        return current_address;
    }

    /**
     * get ref field
     * @param data
     * @param code
     */
    getRefField(data, code) {
        return data.find(item => item.code === code);
    }

    /**
     * get street
     * @param data
     * @returns {Array}
     */
    getStreet(data) {
        let street = [];
        street.push(data.find(item => item.code === 'street').ref.input.value);
        if (data.find(item => item.code === 'street_2').ref.input.value) {
            street.push(data.find(item => item.code === 'street_2').ref.input.value);
        }
        return street;
    }

    /**
     * get region
     * @param data
     * @returns {{region_code: *, region: *, region_id: number}}
     */
    getRegion(data) {
        let field = this.getRefField(data, 'state').ref.getValue();
        let isInput = field.type === 'input';
        let region = {
            region_code: isInput ? field.value : field.state.code,
            region: isInput ? field.value : field.state.name,
            region_id: isInput ? 0 : field.state.id
        };
        return region;
    }

    /**
     * check default address
     * @param customer
     * @param default_shipping
     * @param default_billing
     */
    checkDefaultAddress(customer, default_shipping, default_billing) {
        if (customer.id) {
            if (default_shipping) {
                let address_shipping = customer.addresses.find(item => item.default_shipping === true);
                if(address_shipping) {
                    address_shipping.default_shipping = false;
                }
            }
            if (default_billing) {
                let address_billing = customer.addresses.find(item => item.default_billing === true);
                if(address_billing) {
                    address_billing.default_billing = false;
                }
            }
        }
    }

    /**
     * get information address
     * @param address
     * @returns {string}
     */
    getInfoAddress(address) {
        let info = address.street[0] + ", " + address.city + ", " + address.postcode;
        return info;
    }

    /**
     * get information country
     * @param address
     * @returns {string}
     */
    getInfoCountry(address) {
        let info = "";
        if (address.country_id) {
            let country = CountryHelper.getCountry(address.country_id).name;
            let region = address.region.region;
            if (address.region) {
                if (country && region) {
                    info = country + ", " + region;
                } else {
                    if(!country && region) {
                        info = region;
                    } else if(country && !region) {
                        info = country;
                    }
                }
            }
        }
        return info;
    }
}

/** @type CustomerPopupService */
let customerPopupService = ServiceFactory.get(CustomerPopupService);

export default customerPopupService;