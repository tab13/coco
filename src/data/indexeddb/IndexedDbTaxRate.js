import Abstract from './IndexedDbAbstract';

export default class IndexedDbTaxRate extends Abstract {
    static className = 'IndexedDbTaxRate';

    main_table = 'tax_rate';
    primary_key = 'id';
}