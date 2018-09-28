import Abstract from './IndexedDbAbstract';

export default class IndexedDbTaxRule extends Abstract {
    static className = 'IndexedDbTaxRule';

    main_table = 'tax_rule';
    primary_key = 'id';
}