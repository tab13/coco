import Abstract from './IndexedDbAbstract';

export default class IndexedDbSession extends Abstract {
    static className = 'IndexedDbSession';

    main_table = 'session';
    primary_key = 'shift_increment_id';

}