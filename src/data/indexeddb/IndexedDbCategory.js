import Abstract from './IndexedDbAbstract';

export default class IndexedDbCategory extends Abstract {
    static className = 'IndexedDbCategory';

    main_table = 'category';
    primary_key = 'id';
    offline_id_prefix = 'category';
}